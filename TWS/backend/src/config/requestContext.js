/**
 * Request Context — AsyncLocalStorage store for per-request tenant scoping.
 *
 * WP1 (tenant isolation). This replaces the old ineffective global Mongoose
 * query-filter monkey-patch with a real request-scoped context that the
 * `tenantScope` Mongoose plugin reads at query-execution time.
 *
 * The store holds a SINGLE MUTABLE object per request:
 *
 *   { orgId, userId, tenantId, isPlatformAdmin }
 *
 * `tenantContextRun` opens the ALS scope EARLY (before route-level auth runs)
 * with an empty object, then installs write-through accessors on `req` so that
 * when auth middleware later assigns `req.orgId` / `req.user` / `req.tenantId`
 * the resolved values land in THIS SAME object. Because the plugin reads the
 * object lazily (inside `pre('find')` etc.), it always sees the post-auth value.
 *
 * If nothing ever populates `orgId` (public routes, pre-auth, background jobs,
 * unit tests that don't wrap in `runWithContext`), `getOrgId()` returns `null`
 * and the plugin no-ops — scoping is strictly additive and never fires without
 * a resolved tenant.
 */

const { AsyncLocalStorage } = require('async_hooks');

/** @typedef {{ orgId: string|null, userId: string|null, tenantId: string|null, isPlatformAdmin: boolean }} RequestContext */

/** @type {AsyncLocalStorage<RequestContext>} */
const storage = new AsyncLocalStorage();

/**
 * Normalise anything that might carry an ObjectId (a hex string, a Mongoose
 * ObjectId, a populated Document, a `{ _id }` shape) down to a 24-char hex
 * string, or `null` if it is not a valid ObjectId.
 *
 * HAZARD this guards against: `authenticateToken` populates `req.user.orgId`
 * as a populated Mongoose Document (`.populate('orgId', 'name slug status')`),
 * NOT an ObjectId. Naively stringifying that yields `"[object Object]"`.
 *
 * @param {*} value
 * @returns {string|null}
 */
function normalizeObjectId(value) {
  if (value === null || value === undefined || value === '') return null;

  // Populated Document / lean subdoc / { _id: ... }
  if (typeof value === 'object') {
    if (value._id !== undefined && value._id !== null) {
      return normalizeObjectId(value._id);
    }
    // Mongoose ObjectId (has a toHexString) or Buffer-ish
    if (typeof value.toHexString === 'function') {
      try {
        const hex = value.toHexString();
        return /^[0-9a-f]{24}$/i.test(hex) ? String(hex) : null;
      } catch (_) {
        return null;
      }
    }
    if (typeof value.toString === 'function') {
      const str = value.toString();
      return /^[0-9a-f]{24}$/i.test(str) ? str : null;
    }
    return null;
  }

  const str = String(value);
  return /^[0-9a-f]{24}$/i.test(str) ? str : null;
}

/**
 * Create a fresh, empty context object. Callers hold the reference and mutate
 * it in place; the plugin reads it lazily.
 * @returns {RequestContext}
 */
function createEmptyContext() {
  return { orgId: null, userId: null, tenantId: null, isPlatformAdmin: false };
}

/**
 * Run `fn` with `ctx` as the active request context.
 *
 * The passed object is used BY REFERENCE as the store (its four canonical keys
 * are ensured / normalised in place first). Everything `fn` awaits — the whole
 * Express middleware/handler chain and every DB call it makes — observes that
 * same object, so later mutations of it (e.g. `tenantContextRun`'s write-through
 * accessors filling in `orgId` once auth has run) are visible to `getOrgId()` /
 * `getContext()`.
 *
 * @template T
 * @param {Partial<RequestContext>} ctx
 * @param {() => T} fn
 * @returns {T}
 */
function runWithContext(ctx, fn) {
  const store = ctx && typeof ctx === 'object' ? ctx : createEmptyContext();

  // Normalise / default the canonical keys in place (keep the same reference).
  store.orgId = store.orgId !== undefined && store.orgId !== null ? normalizeObjectId(store.orgId) : null;
  store.userId = store.userId != null ? String(store.userId) : null;
  store.tenantId = store.tenantId != null ? String(store.tenantId) : null;
  store.isPlatformAdmin = store.isPlatformAdmin === true;

  return storage.run(store, fn);
}

/**
 * The live context object for the current async execution, or `null` when
 * there is no active request scope (background jobs, boot, bare unit tests).
 * @returns {RequestContext|null}
 */
function getContext() {
  return storage.getStore() || null;
}

/**
 * The resolved organization id for the current request, or `null`.
 * @returns {string|null}
 */
function getOrgId() {
  const store = storage.getStore();
  return (store && store.orgId) || null;
}

/**
 * The resolved tenant id for the current request, or `null`.
 * @returns {string|null}
 */
function getTenantId() {
  const store = storage.getStore();
  return (store && store.tenantId) || null;
}

/**
 * True when the current request is acting as a platform / supra-admin actor
 * that legitimately operates across tenants.
 * @returns {boolean}
 */
function isPlatformAdmin() {
  const store = storage.getStore();
  return !!(store && store.isPlatformAdmin === true);
}

module.exports = {
  storage,
  runWithContext,
  getContext,
  getOrgId,
  getTenantId,
  isPlatformAdmin,
  createEmptyContext,
  normalizeObjectId,
};
