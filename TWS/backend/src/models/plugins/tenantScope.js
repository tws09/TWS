/**
 * tenantScope — Mongoose plugin that enforces query-time tenant isolation.
 *
 * WP1 (tenant isolation). Registered GLOBALLY via
 * `backend/src/models/registerPlugins.js` (`mongoose.plugin(...)`) so every
 * schema compiled afterwards is covered, with an explicit opt-out list for
 * platform / cross-tenant models.
 *
 * WHAT IT DOES
 * ------------
 * For a covered schema, every read / update / delete / aggregate / distinct
 * query gets `{ <orgField>: <context orgId> }` merged into its filter — UNLESS:
 *
 *   • there is no request context orgId (background jobs, pre-auth, bare tests)
 *   • the request is a platform-admin actor (`isPlatformAdmin()`)
 *   • the query already constrains `orgId` / `organizationId` / `tenantId`
 *     (top-level, or nested inside `$and` / `$or` / `$nor`)
 *   • the caller opted out: `Query#byPassTenantScope()` or
 *     `.setOptions({ bypassTenantScope: true })` (aggregate:
 *     `.option({ bypassTenantScope: true })`)
 *   • the model name is on the OPT_OUT list
 *   • `process.env.TENANT_SCOPE_ENFORCE === 'false'` — then it only LOGS
 *     (once per model) what it *would* have scoped, and leaves the query alone
 *
 * WHAT IT DOES NOT DO
 * ------------------
 *   • It does NOT stamp `orgId` onto inserts (`new Model()` / `save()` /
 *     `insertMany()` / `create()`); callers still set `orgId` explicitly, as
 *     they do today. This plugin is read/update/delete SCOPING only.
 *   • It does not touch `estimatedDocumentCount()` (takes no filter).
 *
 * ALT FIELD NAME
 * --------------
 * A few models isolate on `organizationId` instead of `orgId`
 * (`finance/Expense`, `hr-payroll/Attendance*`). The plugin AUTO-DETECTS this
 * (uses `organizationId` when the schema has it and no `orgId`); an explicit
 * `schema.plugin(tenantScope, { orgIdField: 'organizationId' })` also works.
 */

const mongoose = require('mongoose');
const { getContext, getOrgId, getTenantId, isPlatformAdmin } = require('../../config/requestContext');

/**
 * Models that legitimately operate OUTSIDE a single tenant and must never be
 * auto-scoped. One-line justification per entry — see the WP1 summary.
 */
const OPT_OUT_MODELS = new Set([
  // Platform-admin account & workflow models — no tenant dimension / cross-tenant by design
  'TWSAdmin',
  'SupraAdmin',
  'OnboardingChecklist',
  'PlatformAdminApproval',
  // Registry models that DEFINE the tenant boundary (scoping them by their own id is meaningless)
  'Tenant',
  'Organization',
  // Identity / session infra resolved before a tenant context exists, and managed cross-tenant
  'User',
  'Session',
  'Security',
  // user <-> tenant bridge tables — always queried with an explicit {userId, tenantId},
  // and used in inherently cross-tenant flows (tenant switching, membership management)
  'TenantUser',
  'TenantRole',
]);

const TENANT_FIELDS = ['orgId', 'organizationId', 'tenantId'];

function isEnforcing() {
  return process.env.TENANT_SCOPE_ENFORCE !== 'false';
}

function log(level, msg) {
  // Keep test output quiet unless explicitly debugging.
  if (process.env.NODE_ENV === 'test' && !process.env.TENANT_SCOPE_DEBUG) return;
  const fn = typeof console[level] === 'function' ? console[level] : console.log;
  fn(`[tenantScope] ${msg}`);
}

/**
 * True if `filter` already constrains any of `fields`, at the top level or
 * nested inside `$and` / `$or` / `$nor`.
 * @param {Record<string, any>} filter
 * @param {string[]} fields
 * @returns {boolean}
 */
function alreadyConstrains(filter, fields) {
  if (!filter || typeof filter !== 'object') return false;
  for (const f of fields) {
    if (Object.prototype.hasOwnProperty.call(filter, f)) return true;
  }
  for (const key of ['$and', '$or', '$nor']) {
    const branch = filter[key];
    if (Array.isArray(branch) && branch.some((sub) => alreadyConstrains(sub, fields))) {
      return true;
    }
  }
  return false;
}

/**
 * @param {import('mongoose').Schema} schema
 * @param {{ orgIdField?: string, tenantIdField?: string }} [options]
 */
module.exports = function tenantScopePlugin(schema, options = {}) {
  const explicitField = options.orgIdField;
  const tenantIdField = options.tenantIdField || 'tenantId';

  const hasOrgId = !!schema.path('orgId');
  const hasOrganizationId = !!schema.path('organizationId');
  const hasTenantId = !!schema.path(tenantIdField);

  // Full no-op for schemas with no tenant dimension at all (point 4 of the WP).
  if (!explicitField && !hasOrgId && !hasOrganizationId && !hasTenantId) {
    return;
  }

  // The field we will actually enforce on, and whether it is an ObjectId path.
  let scopeField;
  if (explicitField) {
    scopeField = explicitField;
  } else if (hasOrgId) {
    scopeField = 'orgId';
  } else if (hasOrganizationId) {
    scopeField = 'organizationId';
  } else {
    scopeField = tenantIdField;
  }
  const scopeIsObjectId = scopeField !== tenantIdField;

  // Canonical org field to guarantee exists on the schema (forward-compat).
  const canonicalOrgField = explicitField || (hasOrganizationId && !hasOrgId ? 'organizationId' : 'orgId');

  const added = [];
  if (!schema.path(canonicalOrgField)) {
    schema.add({
      [canonicalOrgField]: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        index: true,
        // NB: intentionally NOT `required` — do not break models that lacked it.
      },
    });
    added.push(canonicalOrgField);
  }
  if (!schema.path(tenantIdField)) {
    schema.add({ [tenantIdField]: { type: String, index: true } });
    added.push(tenantIdField);
  }

  // Per-model state, finalised once the model is compiled.
  const state = {
    modelName: null,
    optedOut: false,
    scopeField,
    warnedWouldScope: false,
  };

  schema.once('init', (model) => {
    state.modelName = model.modelName;
    if (OPT_OUT_MODELS.has(model.modelName)) {
      state.optedOut = true;
      log('info', `${model.modelName}: opted out of query scoping`);
      return;
    }
    // One-time audit signal that a covered model lacked a canonical tenant path.
    // Kept out of production boot output (verbose, ~40 lines); set
    // TENANT_SCOPE_DEBUG to see it anywhere.
    if (added.length && (process.env.NODE_ENV !== 'production' || process.env.TENANT_SCOPE_DEBUG)) {
      log(
        'warn',
        `${model.modelName}: added missing path(s) [${added.join(', ')}] (NOT required) — ` +
          `scoping on '${state.scopeField}'`,
      );
    }
  });

  // ---- escape hatch ---------------------------------------------------------
  schema.query.byPassTenantScope = function byPassTenantScope() {
    this._bypassTenantScope = true;
    this.setOptions({ bypassTenantScope: true });
    return this;
  };

  /** Value to scope by for the current async context, or null. */
  function contextScopeValue() {
    if (!getContext()) return null;
    return scopeIsObjectId ? getOrgId() : getTenantId();
  }

  function queryShouldSkip(query) {
    if (state.optedOut) return true;
    if (isPlatformAdmin()) return true;
    const opts = (typeof query.getOptions === 'function' && query.getOptions()) || {};
    if (opts.bypassTenantScope === true || query._bypassTenantScope === true) return true;
    return false;
  }

  // Shared pre-hook for find / count / update / delete / replaceOne / distinct.
  function scopeQuery(next) {
    try {
      if (queryShouldSkip(this)) return next();

      const value = contextScopeValue();
      if (!value) return next();

      const filter =
        (typeof this.getFilter === 'function' && this.getFilter()) ||
        (typeof this.getQuery === 'function' && this.getQuery()) ||
        {};
      if (alreadyConstrains(filter, TENANT_FIELDS)) return next();

      if (!isEnforcing()) {
        if (!state.warnedWouldScope) {
          state.warnedWouldScope = true;
          log(
            'warn',
            `${state.modelName || '(model)'}: TENANT_SCOPE_ENFORCE=false — would scope ` +
              `${this.op || 'query'} by { ${state.scopeField}: <ctx> } but leaving it unmodified`,
          );
        }
        return next();
      }

      this.where({ [state.scopeField]: value });
    } catch (err) {
      log('error', `${state.modelName || '(model)'}: scopeQuery hook failed: ${err && err.message}`);
    }
    return next();
  }

  /** Pre-hook for aggregate: unshift a `$match` stage. */
  function scopeAggregate(next) {
    try {
      if (state.optedOut || isPlatformAdmin()) return next();
      const opts = this.options || {};
      if (opts.bypassTenantScope === true) return next();

      const value = contextScopeValue();
      if (!value) return next();

      const pipeline = typeof this.pipeline === 'function' ? this.pipeline() : this._pipeline;
      if (!Array.isArray(pipeline)) return next();

      // Consider the query "already scoped" if any of the first few stages
      // constrain a tenant field via $match.
      const leading = pipeline.slice(0, 5);
      const scoped = leading.some(
        (stage) => stage && stage.$match && alreadyConstrains(stage.$match, TENANT_FIELDS),
      );
      if (scoped) return next();

      let matchValue = value;
      if (scopeIsObjectId) {
        if (!mongoose.isValidObjectId(value)) {
          log('warn', `${state.modelName || '(model)'}: context orgId '${value}' is not a valid ObjectId — aggregate left unscoped`);
          return next();
        }
        matchValue = new mongoose.Types.ObjectId(value);
      }

      if (!isEnforcing()) {
        if (!state.warnedWouldScope) {
          state.warnedWouldScope = true;
          log('warn', `${state.modelName || '(model)'}: TENANT_SCOPE_ENFORCE=false — would prepend $match { ${state.scopeField} } to aggregate`);
        }
        return next();
      }

      pipeline.unshift({ $match: { [state.scopeField]: matchValue } });
    } catch (err) {
      log('error', `${state.modelName || '(model)'}: scopeAggregate hook failed: ${err && err.message}`);
    }
    return next();
  }

  // ---- register hooks -----------------------------------------------------
  // /^find/  => find, findOne, findOneAndUpdate, findOneAndDelete, findOneAndReplace
  //            (Model.findById routes through findOne in Mongoose 7, so it is covered)
  schema.pre(/^find/, scopeQuery);
  // /^count/ => count (deprecated), countDocuments — NOT estimatedDocumentCount
  schema.pre(/^count/, scopeQuery);
  schema.pre('distinct', scopeQuery);
  // updateOne / deleteOne default to QUERY middleware in Mongoose 7; pin it explicitly.
  schema.pre('updateOne', { query: true, document: false }, scopeQuery);
  schema.pre('deleteOne', { query: true, document: false }, scopeQuery);
  schema.pre(['updateMany', 'deleteMany', 'replaceOne'], scopeQuery);
  schema.pre('aggregate', scopeAggregate);
};

module.exports.OPT_OUT_MODELS = OPT_OUT_MODELS;
module.exports.alreadyConstrains = alreadyConstrains;
