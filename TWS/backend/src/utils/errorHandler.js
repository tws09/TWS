/**
 * Enhanced Error Handler Utility
 * Provides consistent error handling across the application
 */

/**
 * Custom error classes
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Format error response
 */
const formatError = (error, req) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const response = {
    success: false,
    message: error.message || 'An error occurred',
    code: error.code || 'INTERNAL_ERROR'
  };

  // Add stack trace in development
  if (isDevelopment && error.stack) {
    response.stack = error.stack;
  }

  // Add validation errors if present
  if (error.errors && Array.isArray(error.errors)) {
    response.errors = error.errors;
  }

  // Add request details in development
  if (isDevelopment) {
    response.path = req.path;
    response.method = req.method;
  }

  return response;
};

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    error = new ValidationError('Validation failed', errors);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = new ValidationError(`${field} already exists`, [{ field, message: `${field} must be unique` }]);
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    error = new NotFoundError('Invalid ID format');
  }

  // Default to 500 if status code not set
  const statusCode = error.statusCode || 500;

  // Log error with full details
  console.error('❌ Error Handler:', {
    message: error.message,
    code: error.code,
    statusCode,
    path: req.path,
    method: req.method,
    errorName: error.name,
    errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    originalError: err.message,
    originalStack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  // Log validation errors if present
  if (error.errors && Array.isArray(error.errors)) {
    console.error('❌ Validation errors:', JSON.stringify(error.errors, null, 2));
  }
  
  // Log Mongoose errors if present
  if (err.errors && typeof err.errors === 'object') {
    console.error('❌ Mongoose validation errors:', JSON.stringify(err.errors, null, 2));
  }

  // Send error response
  res.status(statusCode).json(formatError(error, req));
};

/**
 * Async handler wrapper to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  errorHandler,
  asyncHandler,
  formatError
};

