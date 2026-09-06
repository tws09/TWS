/**
 * tenantContextRun — opens the per-request AsyncLocalStorage tenant scope.
 *
 * WP1 (tenant isolation). Mounted ONCE in `server.js` as `app.use('/api/', ...)`
 * in the slot the deleted global query-filter monkey-patch used to occupy.
 *
 * WHY IT CAN RUN EARLY (before route-level auth):
 * -------------------------------------------------
 * Auth in this codebase is per-router (`verifyERPToken`, `authenticateToken`,
 * `unifiedTenantAuth`, ...), so at `app.use('/api/')` time `req.orgId` / `req.user`
 * are not populated yet. Instead of trying to resolve the org here (which would
 * force a DB lookup on every request), this middleware:
 *
 *   1. creates ONE mutable context object `{ orgId, userId, tenantId, isPlatformAdmin }`
 *   2. installs write-through accessors on `req` for `orgId`, `tenantId`, `user`,
 *      `authContext` and `tenantContext` — so the moment ANY auth middleware
 *      assigns one of those, the resolved value is mirrored into the context
 *   3. opens the ALS scope around the rest of the request with that object
 *
 * The `tenantScope` Mongoose plugin reads the object LAZILY (inside `pre('find')`
 * etc., i.e. at query-execution time), by which point auth has run and the
 * context is filled. If auth never runs / never resolves an org (public routes,
 * pre-auth requests), the context stays empty and the plugin no-ops.
 *
 * This is the "run early + mutable context + write-through" design explicitly
 * sanctioned by the WP1 work order.
 */

const { runWithContext, createEmptyContext, normalizeObjectId } = require('../../config/requestContext');
const { getOrgIdSync } = require('../../utils/orgIdHelper');

const PLATFORM_PATH_RE = /^\/(?:api\/)?(?:supra-admin|admin)(?:\/|$)/i;
const PLATFORM_ROLES = new Set([
  'platform_admin',
  'platform_super_admin',
  'twsadmin',
  'tws_admin',
]);

/**
 * Decide whether the current request is a platform / supra-admin actor that
 * legitimately reads across tenants. Deliberately CONSERVATIVE:
 *
 *  - a bare `super_admin` / `supra_admin` role acting INSIDE a tenant-scoped
 *    request (`:tenantSlug` present) is NOT treated as a global bypass — that
 *    user's data lives in their own org and should be scoped to it. Genuine
 *    cross-tenant platform work goes through `/api/supra-admin/*` or
 *    `/api/admin/*` (path match below) or `Query#byPassTenantScope()`.
 *
 * @param {import('express').Request} req
 * @returns {boolean}
 */
function computeIsPlatformAdmin(req) {
  // Path-based: the supra-admin / admin routers are cross-tenant by definition
  // and carry their own auth. `req.originalUrl` is stable across router nesting.
  const url = req.originalUrl || req.url || `${req.baseUrl || ''}${req.path || ''}`;
  if (PLATFORM_PATH_RE.test(url)) return true;

  const authContext = req.authContext;
  if (authContext && authContext.hasPlatformAccess === true) return true;
  if (authContext && String(authContext.type || '').toLowerCase() === 'tws_admin') return true;

  const user = req.user;
  if (user) {
    if (user.isTWSAdmin === true) return true;
    if (String(user.type || '').toLowerCase() === 'tws_admin') return true;
    const role = String(user.role || '').toLowerCase();
    if (PLATFORM_ROLES.has(role)) return true;
    // `super_admin` counts as platform ONLY when NOT inside a tenant-scoped route.
    if ((role === 'super_admin' || role === 'supra_admin') && !req.params?.tenantSlug && !req.orgId) {
      return true;
    }
  }
  return false;
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
function tenantContextRun(req, _res, next) {
  const ctx = createEmptyContext();

  // --- write-through accessors -------------------------------------------------
  // Redefine a handful of `req` properties so assignments by downstream auth
  // middleware are mirrored into `ctx`. Reads/writes still behave normally.
  const backing = {
    orgId: req.orgId,
    tenantId: req.tenantId,
    user: req.user,
    authContext: req.authContext,
    tenantContext: req.tenantContext,
  };

  const refreshDerived = () => {
    // userId
    const u = backing.user;
    if (u) {
      const uid = u._id != null ? u._id : u.id;
      if (uid != null) ctx.userId = String(uid);
      // opportunistic orgId from the user object if nothing better yet
      if (!ctx.orgId) {
        const fromUser = normalizeObjectId(u.orgId);
        if (fromUser) ctx.orgId = fromUser;
      }
    }
    // tenantId from tenantContext when not set directly
    if (!ctx.tenantId && backing.tenantContext && backing.tenantContext.tenantId != null) {
      ctx.tenantId = String(backing.tenantContext.tenantId);
    }
    if (!ctx.orgId && backing.tenantContext && backing.tenantContext.orgId != null) {
      const fromTc = normalizeObjectId(backing.tenantContext.orgId);
      if (fromTc) ctx.orgId = fromTc;
    }
    ctx.isPlatformAdmin = computeIsPlatformAdmin(req);
  };

  const define = (prop, onSet) => {
    try {
      Object.defineProperty(req, prop, {
        configurable: true,
        enumerable: true,
        get() {
          return backing[prop];
        },
        set(value) {
          backing[prop] = value;
          try {
            onSet(value);
          } catch (_) {
            /* never let context bookkeeping break the request */
          }
        },
      });
    } catch (_) {
      /* property not redefinable — fall back to whatever is already there */
    }
  };

  define('orgId', (value) => {
    const norm = normalizeObjectId(value);
    if (norm) ctx.orgId = norm;
    refreshDerived();
  });
  define('tenantId', (value) => {
    if (value != null) ctx.tenantId = String(value);
    refreshDerived();
  });
  define('user', () => refreshDerived());
  define('authContext', () => refreshDerived());
  define('tenantContext', () => refreshDerived());

  // --- seed from anything already present (defensive; usually nothing) --------
  const seededOrg = normalizeObjectId(getOrgIdSync(req));
  if (seededOrg) ctx.orgId = seededOrg;
  refreshDerived();

  return runWithContext(ctx, () => next());
}

module.exports = tenantContextRun;
module.exports.computeIsPlatformAdmin = computeIsPlatformAdmin;
