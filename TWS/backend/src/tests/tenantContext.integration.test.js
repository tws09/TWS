/**
 * WP1 — integration test: `tenantContextRun` middleware + `tenantScope` plugin
 * working together over real Express routes and real Mongoose models.
 *
 * Two orgs are seeded with Users and Projects. Route handlers query the models
 * with NO manual orgId filter — the plugin must make every tenant-scoped list /
 * aggregate / write disjoint per tenant, while a supra-admin route (path-based
 * platform bypass) still sees across tenants.
 */

const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');

require('../models/registerPlugins');
const tenantContextRun = require('../middleware/tenant/tenantContextRun');
const { connect, disconnect } = require('./helpers/memoryMongo');

const Organization = require('../models/org/Organization');
const User = require('../models/users-auth/User');
const Project = require('../models/project-delivery/Project');

/** @type {import('express').Express} */
let app;
const seeded = {};

/**
 * Stand-in for verifyERPToken: resolves the tenant/org from :tenantSlug and a
 * test header, then populates req exactly like the real middleware does
 * (req.user / req.orgId / req.tenant / req.tenantId / req.tenantContext).
 * tenantContextRun's write-through accessors pick those up into the ALS context.
 */
function fakeTenantAuth(req, res, next) {
  const org = seeded[req.params.tenantSlug];
  if (!org) return res.status(404).json({ error: 'tenant not found' });
  req.user = { _id: req.get('x-user-id') || org.ownerId, id: org.ownerId, role: 'admin', orgId: org._id };
  req.tenant = { _id: org.tenantId, slug: req.params.tenantSlug };
  req.tenantId = String(org.tenantId);
  req.orgId = String(org._id);
  req.tenantContext = { tenantId: String(org.tenantId), orgId: String(org._id), tenantSlug: req.params.tenantSlug };
  next();
}

/** Stand-in for supra-admin auth: a platform actor with NO org context. */
function fakeSupraAdminAuth(req, res, next) {
  req.user = { _id: new mongoose.Types.ObjectId(), role: 'platform_super_admin' };
  next();
}

beforeAll(async () => {
  await connect();

  const mk = async (slug) => {
    const tenantId = new mongoose.Types.ObjectId();
    const org = await Organization.create({ name: slug.toUpperCase(), slug, tenantId });
    const owner = await User.create({
      fullName: `${slug} owner`,
      email: `owner@${slug}.test`,
      password: 'x'.repeat(20),
      role: 'admin',
      status: 'active',
      orgId: org._id,
      tenantId: String(tenantId),
    });
    await Project.create([
      { orgId: org._id, tenantId: String(tenantId), name: `${slug}-alpha`, slug: `${slug}-alpha` },
      { orgId: org._id, tenantId: String(tenantId), name: `${slug}-beta`, slug: `${slug}-beta` },
    ]);
    seeded[slug] = { _id: org._id, tenantId, ownerId: owner._id };
  };

  await mk('acme');
  await mk('globex');

  app = express();
  app.use(express.json());
  app.use('/api/', tenantContextRun);

  app.get('/api/tenant/:tenantSlug/organization/projects', fakeTenantAuth, async (req, res, nextFn) => {
    try {
      const projects = await Project.find({}).sort({ name: 1 }).lean();
      res.json({ projects: projects.map((p) => p.name) });
    } catch (e) {
      nextFn(e);
    }
  });

  app.get('/api/tenant/:tenantSlug/organization/projects/count', fakeTenantAuth, async (req, res, nextFn) => {
    try {
      const agg = await Project.aggregate([{ $group: { _id: null, count: { $sum: 1 } } }]);
      res.json({ count: agg.length ? agg[0].count : 0 });
    } catch (e) {
      nextFn(e);
    }
  });

  app.get('/api/tenant/:tenantSlug/organization/users', fakeTenantAuth, async (req, res, nextFn) => {
    try {
      // User is on the OPT-OUT list; tenant routes must still pass orgId explicitly.
      const users = await User.find({ orgId: req.orgId }).lean();
      res.json({ users: users.map((u) => u.email) });
    } catch (e) {
      nextFn(e);
    }
  });

  app.patch('/api/tenant/:tenantSlug/organization/projects/:id', fakeTenantAuth, async (req, res, nextFn) => {
    try {
      const r = await Project.updateOne({ _id: req.params.id }, { $set: { name: req.body.name } });
      res.json({ matched: r.matchedCount, modified: r.modifiedCount });
    } catch (e) {
      nextFn(e);
    }
  });

  app.delete('/api/tenant/:tenantSlug/organization/projects/:id', fakeTenantAuth, async (req, res, nextFn) => {
    try {
      const r = await Project.deleteOne({ _id: req.params.id });
      res.json({ deleted: r.deletedCount });
    } catch (e) {
      nextFn(e);
    }
  });

  app.get('/api/supra-admin/projects', fakeSupraAdminAuth, async (req, res, nextFn) => {
    try {
      const projects = await Project.find({}).sort({ name: 1 }).lean();
      res.json({ projects: projects.map((p) => p.name) });
    } catch (e) {
      nextFn(e);
    }
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => res.status(500).json({ error: err.message }));
}, 60000);

afterAll(async () => {
  await disconnect();
}, 60000);

describe('tenant-scoped list endpoints are disjoint per tenant', () => {
  test('acme sees only acme projects', async () => {
    const res = await request(app).get('/api/tenant/acme/organization/projects');
    expect(res.status).toBe(200);
    expect(res.body.projects).toEqual(['acme-alpha', 'acme-beta']);
  });

  test('globex sees only globex projects', async () => {
    const res = await request(app).get('/api/tenant/globex/organization/projects');
    expect(res.status).toBe(200);
    expect(res.body.projects).toEqual(['globex-alpha', 'globex-beta']);
  });

  test('aggregate count is per-tenant', async () => {
    const acme = await request(app).get('/api/tenant/acme/organization/projects/count');
    const globex = await request(app).get('/api/tenant/globex/organization/projects/count');
    expect(acme.body.count).toBe(2);
    expect(globex.body.count).toBe(2);
  });

  test('explicit-orgId user listing stays disjoint', async () => {
    const acme = await request(app).get('/api/tenant/acme/organization/users');
    const globex = await request(app).get('/api/tenant/globex/organization/users');
    expect(acme.body.users).toEqual(['owner@acme.test']);
    expect(globex.body.users).toEqual(['owner@globex.test']);
  });
});

describe('cross-tenant writes are blocked', () => {
  test('acme cannot rename a globex project', async () => {
    const globexProject = await Project.findOne({ name: 'globex-alpha' }).byPassTenantScope().lean();
    const res = await request(app)
      .patch(`/api/tenant/acme/organization/projects/${globexProject._id}`)
      .send({ name: 'pwned' });
    expect(res.status).toBe(200);
    expect(res.body.matched).toBe(0);
    expect(res.body.modified).toBe(0);

    const still = await Project.findById(globexProject._id).byPassTenantScope().lean();
    expect(still.name).toBe('globex-alpha');
  });

  test('acme cannot delete a globex project', async () => {
    const globexProject = await Project.findOne({ name: 'globex-beta' }).byPassTenantScope().lean();
    const res = await request(app).delete(`/api/tenant/acme/organization/projects/${globexProject._id}`);
    expect(res.body.deleted).toBe(0);
    expect(await Project.countDocuments({}).byPassTenantScope()).toBe(4);
  });

  test('acme CAN rename its own project', async () => {
    const acmeProject = await Project.findOne({ name: 'acme-beta' }).byPassTenantScope().lean();
    const res = await request(app)
      .patch(`/api/tenant/acme/organization/projects/${acmeProject._id}`)
      .send({ name: 'acme-beta-2' });
    expect(res.body.modified).toBe(1);
  });
});

describe('supra-admin route still reads across tenants', () => {
  test('GET /api/supra-admin/projects returns every org', async () => {
    const res = await request(app).get('/api/supra-admin/projects');
    expect(res.status).toBe(200);
    // 4 projects across both orgs (one acme project may have been renamed above)
    expect(res.body.projects).toHaveLength(4);
    expect(res.body.projects.some((n) => n.startsWith('acme-'))).toBe(true);
    expect(res.body.projects.some((n) => n.startsWith('globex-'))).toBe(true);
  });
});
