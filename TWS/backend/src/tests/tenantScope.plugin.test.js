/**
 * WP1 — unit tests for the tenantScope Mongoose plugin.
 *
 * Uses throwaway models against an in-memory replica set. Verifies that inside
 * a request context every query family (find / findOne / findById /
 * countDocuments / distinct / updateOne / updateMany / deleteOne / deleteMany /
 * aggregate) is scoped to the context org, and that the sanctioned escape
 * hatches (isPlatformAdmin, .byPassTenantScope(), explicit orgId in the filter)
 * still see across orgs. With no context, queries are unscoped.
 */

const mongoose = require('mongoose');
require('../models/registerPlugins');
const { runWithContext } = require('../config/requestContext');
const { connect, disconnect } = require('./helpers/memoryMongo');

const ORG_A = new mongoose.Types.ObjectId();
const ORG_B = new mongoose.Types.ObjectId();

let Thing; // orgId-scoped
let AltThing; // organizationId-scoped
let TenantThing; // tenantId-scoped (no orgId natively)

beforeAll(async () => {
  await connect();

  Thing = mongoose.model(
    'ScopeThing',
    new mongoose.Schema({ orgId: { type: mongoose.Schema.Types.ObjectId }, name: String, n: Number }),
  );
  AltThing = mongoose.model(
    'ScopeAltThing',
    new mongoose.Schema({ organizationId: { type: mongoose.Schema.Types.ObjectId }, name: String }),
  );
  TenantThing = mongoose.model(
    'ScopeTenantThing',
    new mongoose.Schema({ tenantId: String, name: String }),
  );
}, 60000);

afterAll(async () => {
  await disconnect();
}, 60000);

beforeEach(async () => {
  await Promise.all([Thing.deleteMany({}).byPassTenantScope(), AltThing.deleteMany({}), TenantThing.deleteMany({})]);
  await Thing.create([
    { orgId: ORG_A, name: 'a1', n: 1 },
    { orgId: ORG_A, name: 'a2', n: 2 },
    { orgId: ORG_B, name: 'b1', n: 3 },
  ]);
  await AltThing.create([
    { organizationId: ORG_A, name: 'alt-a' },
    { organizationId: ORG_B, name: 'alt-b' },
  ]);
  await TenantThing.create([
    { tenantId: 'tenant-A', name: 't-a' },
    { tenantId: 'tenant-B', name: 't-b' },
  ]);
});

// Run `fn` INSIDE the ALS scope. The async wrapper is a context-preservation
// device: `fn`'s query resolves within this async frame, i.e. while the ALS
// store is still active — exactly how a request handler runs under
// `tenantContextRun` -> next(). (No literal await needed; wrapper returns fn().)
// eslint-disable-next-line require-await
const inOrgA = (fn) => runWithContext({ orgId: String(ORG_A) }, async () => fn());

describe('tenantScope plugin — reads scoped to context org', () => {
  test('find() returns only context-org rows', async () => {
    const rows = await inOrgA(() => Thing.find({}));
    expect(rows.map((r) => r.name).sort()).toEqual(['a1', 'a2']);
  });

  test('find() with no context is unscoped', async () => {
    const rows = await Thing.find({});
    expect(rows).toHaveLength(3);
  });

  test('findOne() cannot reach another org', async () => {
    const row = await inOrgA(() => Thing.findOne({ name: 'b1' }));
    expect(row).toBeNull();
  });

  test('findById() cannot reach another org (routes through findOne hook)', async () => {
    const b1 = await Thing.collection.findOne({ name: 'b1' });
    const row = await inOrgA(() => Thing.findById(b1._id));
    expect(row).toBeNull();

    const a1 = await Thing.collection.findOne({ name: 'a1' });
    const ok = await inOrgA(() => Thing.findById(a1._id));
    expect(ok && ok.name).toBe('a1');
  });

  test('countDocuments() is scoped', async () => {
    const c = await inOrgA(() => Thing.countDocuments({}));
    expect(c).toBe(2);
  });

  test('distinct() is scoped', async () => {
    const names = await inOrgA(() => Thing.distinct('name'));
    expect(names.sort()).toEqual(['a1', 'a2']);
  });

  test('aggregate() gets a leading $match on the context org', async () => {
    const res = await inOrgA(() => Thing.aggregate([{ $group: { _id: null, total: { $sum: '$n' } } }]));
    expect(res[0].total).toBe(3); // 1 + 2, NOT 6
  });

  test('a $or that does NOT constrain a tenant field still gets scoped', async () => {
    const rows = await inOrgA(() => Thing.find({ $or: [{ name: 'a1' }, { name: 'b1' }] }));
    // b1 belongs to ORG_B -> must be filtered out by the injected top-level orgId
    expect(rows.map((r) => r.name)).toEqual(['a1']);
  });

  test('organizationId-field models are auto-detected and scoped', async () => {
    const rows = await inOrgA(() => AltThing.find({}));
    expect(rows.map((r) => r.name)).toEqual(['alt-a']);
  });

  test('tenantId-only models are scoped by context tenantId', async () => {
    const rows = await runWithContext({ orgId: String(ORG_A), tenantId: 'tenant-A' }, async () => TenantThing.find({})); // eslint-disable-line require-await
    expect(rows.map((r) => r.name)).toEqual(['t-a']);
  });
});

describe('tenantScope plugin — writes/deletes scoped to context org', () => {
  test('updateMany() only touches context-org rows', async () => {
    await inOrgA(() => Thing.updateMany({}, { $set: { name: 'touched' } }));
    const aRows = await Thing.find({ orgId: ORG_A }).byPassTenantScope();
    const bRows = await Thing.find({ orgId: ORG_B }).byPassTenantScope();
    expect(aRows.every((r) => r.name === 'touched')).toBe(true);
    expect(bRows.every((r) => r.name === 'b1')).toBe(true);
  });

  test('updateOne() cannot cross orgs', async () => {
    const res = await inOrgA(() => Thing.updateOne({ name: 'b1' }, { $set: { name: 'hacked' } }));
    expect(res.matchedCount).toBe(0);
  });

  test('deleteMany() cannot cross orgs', async () => {
    const res = await inOrgA(() => Thing.deleteMany({ name: 'b1' }));
    expect(res.deletedCount).toBe(0);
    expect(await Thing.countDocuments({}).byPassTenantScope()).toBe(3);
  });

  test('deleteMany() removes context-org rows', async () => {
    const res = await inOrgA(() => Thing.deleteMany({}));
    expect(res.deletedCount).toBe(2);
    expect(await Thing.countDocuments({}).byPassTenantScope()).toBe(1);
  });

  test('findOneAndUpdate() cannot cross orgs', async () => {
    const doc = await inOrgA(() => Thing.findOneAndUpdate({ name: 'b1' }, { $set: { n: 99 } }, { new: true }));
    expect(doc).toBeNull();
  });
});

describe('tenantScope plugin — sanctioned escape hatches', () => {
  test('isPlatformAdmin context sees every org', async () => {
    const rows = await runWithContext({ orgId: String(ORG_A), isPlatformAdmin: true }, async () => Thing.find({})); // eslint-disable-line require-await
    expect(rows).toHaveLength(3);
  });

  test('.byPassTenantScope() sees every org', async () => {
    const rows = await inOrgA(() => Thing.find({}).byPassTenantScope());
    expect(rows).toHaveLength(3);
  });

  test('.setOptions({ bypassTenantScope: true }) sees every org', async () => {
    const rows = await inOrgA(() => Thing.find({}).setOptions({ bypassTenantScope: true }));
    expect(rows).toHaveLength(3);
  });

  test('an explicit orgId in the filter is left untouched (even cross-org)', async () => {
    const rows = await inOrgA(() => Thing.find({ orgId: ORG_B }));
    expect(rows.map((r) => r.name)).toEqual(['b1']);
  });

  test('an explicit orgId nested in $or is treated as already-scoped', async () => {
    const rows = await inOrgA(() => Thing.find({ $or: [{ orgId: ORG_B }, { name: 'nope' }] }));
    expect(rows.map((r) => r.name)).toEqual(['b1']);
  });

  test('aggregate with a leading $match on orgId is not double-scoped', async () => {
    const res = await inOrgA(() =>
      Thing.aggregate([{ $match: { orgId: ORG_B } }, { $group: { _id: null, total: { $sum: '$n' } } }]),
    );
    expect(res[0].total).toBe(3); // only b1
  });

  test('aggregate().option({ bypassTenantScope: true }) sees every org', async () => {
    const res = await inOrgA(() =>
      Thing.aggregate([{ $group: { _id: null, total: { $sum: '$n' } } }]).option({ bypassTenantScope: true }),
    );
    expect(res[0].total).toBe(6);
  });
});

describe('tenantScope plugin — TENANT_SCOPE_ENFORCE feature flag', () => {
  const prev = process.env.TENANT_SCOPE_ENFORCE;
  afterEach(() => {
    if (prev === undefined) delete process.env.TENANT_SCOPE_ENFORCE;
    else process.env.TENANT_SCOPE_ENFORCE = prev;
  });

  test('when "false", queries are NOT scoped (log-only)', async () => {
    process.env.TENANT_SCOPE_ENFORCE = 'false';
    const rows = await inOrgA(() => Thing.find({}));
    expect(rows).toHaveLength(3);
  });

  test('any other value (or unset) keeps enforcement ON', async () => {
    process.env.TENANT_SCOPE_ENFORCE = 'true';
    const rows = await inOrgA(() => Thing.find({}));
    expect(rows).toHaveLength(2);
  });
});
