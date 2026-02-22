/**
 * Audit Logging Middleware
 * Logs important actions for security and compliance
 */

// Use the existing AuditLog model
let AuditLog;
try {
  AuditLog = require('../../models/AuditLog');
} catch (error) {
  console.warn('AuditLog model not found, audit logging will be disabled');
  AuditLog = null;
}

/**
 * Create audit log entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} action - Action performed
 * @param {String} resource - Resource affected
 * @param {String} status - Success or failure
 * @param {String} details - Additional details
 */
const createAuditLog = async (req, res, action, resource, status, details = {}) => {
  try {
    const auditData = {
      userId: req.user?._id || req.parent?._id || null,
      userType: req.user ? (req.user.role?.includes('admin') ? 'Admin' : req.user.role || 'User') : (req.parent ? 'Parent' : 'System'),
      orgId: req.tenantContext?.orgId || null,
      tenantId: req.tenantContext?.tenantId || req.tenantId || null,
      action,
      resource,
      status,
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      method: req.method,
      path: req.path,
      details: {
        ...details,
        timestamp: new Date()
      }
    };

    // Don't await to avoid blocking the request
    if (AuditLog) {
      AuditLog.create(auditData).catch(err => {
        console.error('Error creating audit log:', err);
      });
    }
  } catch (error) {
    console.error('Error in audit logging:', error);
  }
};

/**
 * Audit logging middleware
 * Automatically logs API requests
 */
const auditLogMiddleware = (options = {}) => {
  const {
    logSuccess = true,
    logFailure = true,
    excludePaths = ['/health', '/status']
  } = options;

  return async (req, res, next) => {
    // Skip excluded paths
    if (excludePaths.some(path => req.path.includes(path))) {
      return next();
    }

    const startTime = Date.now();
    const originalSend = res.send;

    // Override res.send to capture response
    res.send = function (body) {
      const duration = Date.now() - startTime;
      const status = res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure';

      // Determine action and resource from request
      const action = req.method.toLowerCase();
      const resource = req.path.split('/').pop() || req.path;

      // Log based on options
      if ((status === 'success' && logSuccess) || (status === 'failure' && logFailure)) {
        createAuditLog(req, res, action, resource, status, {
          statusCode: res.statusCode,
          duration
        });
      }

      // Call original send
      originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Manual audit log function for important actions
 */
const logAction = async (req, action, resource, status, details) => {
  await createAuditLog(req, null, action, resource, status, details);
};

module.exports = {
  auditLogMiddleware,
  logAction,
  createAuditLog
};
