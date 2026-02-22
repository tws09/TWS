/**
 * Input Validation Middleware
 * Validates request parameters, query strings, and body data
 */

const { body, query, param, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}

// Export handleValidationErrors FIRST, immediately after definition
module.exports.handleValidationErrors = handleValidationErrors;

/**
 * Validate session query parameters
 */
module.exports.validateSessionQuery = [
  query('tenantId')
    .optional()
    .isMongoId()
    .withMessage('Invalid tenant ID format'),
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),
  query('status')
    .optional()
    .isIn(['active', 'idle', 'suspended', 'terminated', 'expired'])
    .withMessage('Invalid status value'),
  handleValidationErrors
];

/**
 * Validate session ID parameter
 */
module.exports.validateSessionId = [
  param('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isMongoId()
    .withMessage('Invalid session ID format'),
  handleValidationErrors
];

/**
 * Validate bulk terminate request
 */
module.exports.validateBulkTerminate = [
  body('sessionIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('Session IDs must be an array with 1-100 items'),
  body('sessionIds.*')
    .isMongoId()
    .withMessage('All session IDs must be valid MongoDB ObjectIds'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must be a string with max 500 characters'),
  handleValidationErrors
];

/**
 * Validate tenant ID query
 */
module.exports.validateTenantId = [
  query('tenantId')
    .optional()
    .isMongoId()
    .withMessage('Invalid tenant ID format'),
  handleValidationErrors
];

/**
 * Validate time range query
 */
module.exports.validateTimeRange = [
  query('timeRange')
    .optional()
    .isIn(['24h', '7d', '30d', '90d'])
    .withMessage('Time range must be one of: 24h, 7d, 30d, 90d'),
  query('tenantId')
    .optional()
    .isMongoId()
    .withMessage('Invalid tenant ID format'),
  handleValidationErrors
];

/**
 * Sanitize string input
 */
module.exports.sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate pagination parameters
 */
module.exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Ensure handleValidationErrors is exported (re-export to be safe)
module.exports.handleValidationErrors = handleValidationErrors;

/**
 * Validate tenant creation request
 */
module.exports.validateTenantCreation = () => [
  body('name').notEmpty().withMessage('Tenant name is required'),
  body('adminUser.email').isEmail().withMessage('Valid admin email is required'),
  body('adminUser.password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('adminUser.fullName').notEmpty().withMessage('Admin full name is required'),
  handleValidationErrors
];

/**
 * Validate tenant creation request
 */
module.exports.validateTenantCreation = () => [
  body('name').notEmpty().withMessage('Tenant name is required'),
  body('adminUser.email').isEmail().withMessage('Valid admin email is required'),
  body('adminUser.password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('adminUser.fullName').notEmpty().withMessage('Admin full name is required'),
  handleValidationErrors
];