/**
 * Platform Admin Access Middleware
 * Checks if platform admin access session is still valid (not expired)
 */

const platformAdminAccessService = require('../../services/tenant/platform-admin-access.service');

/**
 * Middleware to check if platform admin access session is still valid
 * Should be used after tenantValidation middleware
 */
const checkPlatformAdminAccessExpiration = async (req, res, next) => {
  try {
    // Only check if this is a platform admin access
    if (!req.platformAdminAccess) {
      return next(); // Not platform admin access, continue
    }

    const { expiresAt, tenantId } = req.platformAdminAccess;

    // Check if access has expired
    if (expiresAt && new Date() > new Date(expiresAt)) {
      // Log expired access attempt
      await platformAdminAccessService.logPlatformAdminAccess({
        platformAdminId: req.user._id,
        platformAdminEmail: req.user.email,
        platformAdminName: req.user.fullName,
        tenantId: tenantId,
        tenantName: 'Unknown',
        reason: req.platformAdminAccess.reason || 'unknown',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        endpoint: req.path,
        method: req.method
      });

      return res.status(403).json({
        success: false,
        message: 'Platform admin access has expired. Please request new access.',
        code: 'ACCESS_EXPIRED',
        expiresAt: expiresAt
      });
    }

    // Access is still valid, continue
    next();
  } catch (error) {
    console.error('Error checking platform admin access expiration:', error);
    // Don't block request on expiration check failure
    next();
  }
};

module.exports = {
  checkPlatformAdminAccessExpiration
};
