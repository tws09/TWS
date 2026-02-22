/**
 * Middleware to require access reason for platform admin tenant data access
 * This should be applied to routes that access tenant data
 */

const platformAdminAccessService = require('../../services/tenant/platform-admin-access.service');

/**
 * Middleware factory to require access reason
 * @param {Object} options - Options
 * @param {boolean} options.allowQueryParam - Allow reason in query params (default: false, only body/header)
 * @returns {Function} Express middleware
 */
const requirePlatformAdminAccessReason = (options = {}) => {
  const { allowQueryParam = false } = options;

  return async (req, res, next) => {
    try {
      // Only check for platform admins
      const isPlatformAdmin = req.user?.role === 'platform_super_admin' ||
                             req.user?.role === 'platform_admin' ||
                             req.user?.role === 'super_admin';

      if (!isPlatformAdmin) {
        return next(); // Not platform admin, skip this check
      }

      // Get access reason from request
      const accessReason = req.body.accessReason ||
                          req.headers['x-access-reason'] ||
                          (allowQueryParam ? req.query.accessReason : null);

      if (!accessReason) {
        return res.status(400).json({
          success: false,
          message: 'Access reason is required for platform admin tenant data access',
          code: 'ACCESS_REASON_REQUIRED',
          hint: 'Provide accessReason in request body or X-Access-Reason header',
          allowedReasons: platformAdminAccessService.getAllowedReasons()
        });
      }

      // Validate reason
      const validation = platformAdminAccessService.validateAccessReason(accessReason);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error,
          code: validation.code,
          allowedReasons: validation.allowedReasons
        });
      }

      // Store reason in request for use in tenantValidation middleware
      req.body.accessReason = accessReason;
      req.headers['x-access-reason'] = accessReason;

      next();
    } catch (error) {
      console.error('Error in requirePlatformAdminAccessReason middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Error validating access reason',
        error: error.message
      });
    }
  };
};

module.exports = requirePlatformAdminAccessReason;
