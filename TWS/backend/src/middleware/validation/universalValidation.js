/**
 * Universal Validation Middleware
 * Provides common validation rules for all form submissions
 * Addresses Issue #4.3: Client-Side Validation Without Server Validation
 * 
 * NEVER TRUST CLIENT-SIDE VALIDATION
 * Always validate on server using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: errorMessages
    });
  }
  next();
};

/**
 * Common validation rules
 */
const commonValidations = {
  // MongoDB ObjectId validation
  mongoId: (field = 'id') => param(field)
    .isMongoId()
    .withMessage(`Invalid ${field} format`),

  // Email validation
  email: (field = 'email') => body(field)
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),

  // Password validation
  password: (field = 'password') => body(field)
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .optional()
    .withMessage('Password should contain at least one uppercase letter, one lowercase letter, and one number'),

  // String validation
  string: (field, options = {}) => {
    const { min = 1, max = 255, required = true } = options;
    let validator = body(field).trim();
    
    if (required) {
      validator = validator.notEmpty().withMessage(`${field} is required`);
    } else {
      validator = validator.optional();
    }
    
    return validator
      .isLength({ min, max })
      .withMessage(`${field} must be between ${min} and ${max} characters`);
  },

  // Number validation
  number: (field, options = {}) => {
    const { min = 0, max = Number.MAX_SAFE_INTEGER, required = true } = options;
    let validator = body(field);
    
    if (required) {
      validator = validator.notEmpty().withMessage(`${field} is required`);
    } else {
      validator = validator.optional();
    }
    
    return validator
      .isFloat({ min, max })
      .withMessage(`${field} must be a number between ${min} and ${max}`);
  },

  // Date validation
  date: (field, required = true) => {
    let validator = body(field);
    
    if (required) {
      validator = validator.notEmpty().withMessage(`${field} is required`);
    } else {
      validator = validator.optional();
    }
    
    return validator
      .isISO8601()
      .withMessage(`${field} must be a valid ISO 8601 date`);
  },

  // Array validation
  array: (field, options = {}) => {
    const { min = 0, max = 1000, required = true } = options;
    let validator = body(field);
    
    if (required) {
      validator = validator.notEmpty().withMessage(`${field} is required`);
    } else {
      validator = validator.optional();
    }
    
    return validator
      .isArray({ min, max })
      .withMessage(`${field} must be an array with ${min} to ${max} items`);
  },

  // Enum validation
  enum: (field, values, required = true) => {
    let validator = body(field);
    
    if (required) {
      validator = validator.notEmpty().withMessage(`${field} is required`);
    } else {
      validator = validator.optional();
    }
    
    return validator
      .isIn(values)
      .withMessage(`${field} must be one of: ${values.join(', ')}`);
  },

  // Slug validation
  slug: (field = 'slug') => body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is required`)
    .isLength({ min: 3, max: 50 })
    .withMessage(`${field} must be between 3 and 50 characters`)
    .matches(/^[a-z0-9-]+$/)
    .withMessage(`${field} can only contain lowercase letters, numbers, and hyphens`)
    .custom((value) => {
      if (value.startsWith('-') || value.endsWith('-')) {
        throw new Error(`${field} cannot start or end with a hyphen`);
      }
      if (value.includes('--')) {
        throw new Error(`${field} cannot contain consecutive hyphens`);
      }
      return true;
    }),

  // Sanitize HTML/XSS prevention
  sanitize: (field) => body(field)
    .optional()
    .trim()
    .escape()
    .withMessage(`${field} contains invalid characters`)
};

/**
 * Validation middleware for common operations
 */
const validateCreate = (validations) => {
  return [
    ...validations,
    handleValidationErrors
  ];
};

const validateUpdate = (validations) => {
  return [
    ...validations,
    handleValidationErrors
  ];
};

const validateQuery = (validations) => {
  return [
    ...validations,
    handleValidationErrors
  ];
};

module.exports = {
  handleValidationErrors,
  commonValidations,
  validateCreate,
  validateUpdate,
  validateQuery
};
