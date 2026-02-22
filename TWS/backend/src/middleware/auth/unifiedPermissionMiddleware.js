/**
 * Unified Permission Middleware
 * 
 * ✅ Issue #1.6 Fix: Standardized permission checking
 * 
 * Provides a single interface for authorization across all route types:
 * - requireAuth(permission) - For permission-based routes
 * - requireAuth(roles) - For role-based routes  
 * - requireAuth({ permission, roles }) - For combined checks
 * 
 * Usage:
 * ```javascript
 * const { requireAuth } = require('./middleware/auth/unifiedPermissionMiddleware');
 * 
 * // Permission-based (platform/supra admin)
 * router.get('/tenants', requireAuth('tenants:read'), controller.getTenants);
 * 
 * // Role-based (tenant routes)
 * router.get('/projects', requireAuth(['owner', 'admin']), controller.getProjects);
 * 
 * // Combined
 * router.delete('/user', requireAuth({ permission: 'platform_users:delete', roles: ['platform_super_admin'] }), controller.deleteUser);
 * ```
 */

const { requireRole } = require('./auth');
const { requirePermission } = require('./permissions');
const { requirePlatformPermission, PLATFORM_PERMISSIONS } = require('./platformRBAC');

/**
 * Unified authorization middleware
 * Accepts: permission string, role/roles array, or options object
 */
function requireAuth(permissionOrRolesOrOptions) {
  // Permission string (e.g., 'tenants:read')
  if (typeof permissionOrRolesOrOptions === 'string') {
    // Check if it's a platform permission
    if (permissionOrRolesOrOptions.includes(':') && !permissionOrRolesOrOptions.includes('.')) {
      return requirePlatformPermission(permissionOrRolesOrOptions);
    }
    // Resource permission (e.g., 'students.view' or 'students:view')
    const sep = permissionOrRolesOrOptions.includes('.') ? '.' : ':';
    const [resource, action] = permissionOrRolesOrOptions.split(sep);
    return requirePermission(resource || permissionOrRolesOrOptions, action || 'read');
  }
  
  // Roles array (e.g., ['owner', 'admin'])
  if (Array.isArray(permissionOrRolesOrOptions)) {
    return requireRole(permissionOrRolesOrOptions);
  }
  
  // Options object
  if (typeof permissionOrRolesOrOptions === 'object') {
    const { permission, roles } = permissionOrRolesOrOptions;
    const middlewares = [];
    if (permission) middlewares.push(requireAuth(permission));
    if (roles) middlewares.push(requireAuth(roles));
    return (req, res, next) => {
      let i = 0;
      const runNext = (err) => {
        if (err) return next(err);
        if (i >= middlewares.length) return next();
        middlewares[i++](req, res, runNext);
      };
      runNext();
    };
  }
  
  throw new Error('requireAuth: Invalid argument - expected string, array, or object');
}

module.exports = {
  requireAuth,
  requireRole,
  requirePermission,
  requirePlatformPermission,
  PLATFORM_PERMISSIONS,
};
