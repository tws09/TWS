const auditService = require('../../services/compliance/audit.service');

/**
 * Enhanced error handling middleware for Supra-Admin routes
 */
class ErrorHandler {
  
  /**
   * Async error wrapper to catch async errors in route handlers
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Global error handler middleware
   */
  static globalErrorHandler(err, req, res, next) {
    // Log error details
    console.error('Supra-Admin Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      user: req.user?.email || 'anonymous',
      timestamp: new Date().toISOString()
    });

    // Log security events for authentication/authorization errors
    if (err.status === 401 || err.status === 403) {
      auditService.logSecurityEvent(
        auditService.auditActions.LOGIN_FAILED,
        req.user?._id,
        req.user?.orgId,
        {
          reason: err.message,
          details: {
            url: req.url,
            method: req.method,
            userAgent: req.get('User-Agent')
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          severity: err.status === 401 ? 'medium' : 'high'
        }
      );
    }

    // Determine error response
    let statusCode = err.status || err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation Error';
    } else if (err.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
    } else if (err.name === 'MongoError' && err.code === 11000) {
      statusCode = 409;
      message = 'Duplicate entry';
    } else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
      message = 'Internal Server Error';
    }

    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: err 
      })
    });
  }

  /**
   * 404 handler for undefined routes
   */
  static notFoundHandler(req, res, next) {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.status = 404;
    next(error);
  }

  /**
   * Validation error formatter
   */
  static formatValidationErrors(errors) {
    return errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
  }

  /**
   * Database error handler
   */
  static handleDatabaseError(error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return { status: 400, message: 'Validation failed', errors };
    }
    
    if (error.name === 'CastError') {
      return { status: 400, message: 'Invalid ID format' };
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return { status: 409, message: `${field} already exists` };
    }
    
    return { status: 500, message: 'Database error' };
  }
}

module.exports = ErrorHandler;