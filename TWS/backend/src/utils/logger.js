/**
 * Secure Logging Service for Backend
 * Replaces console.log with secure, production-safe logging
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Sanitize error object to remove sensitive information
 */
const sanitizeError = (error) => {
  if (!error) return null;

  const sanitized = {
    message: error.message || 'Unknown error',
    name: error.name || 'Error',
    code: error.code,
  };

  // Only include stack trace in development
  if (isDevelopment && error.stack) {
    sanitized.stack = error.stack;
  }

  // Remove sensitive fields from response
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'cookie', 'apiKey'];
  if (error.response?.data) {
    sanitized.response = {};
    Object.keys(error.response.data).forEach(key => {
      if (!sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized.response[key] = error.response.data[key];
      } else {
        sanitized.response[key] = '[REDACTED]';
      }
    });
  }

  return sanitized;
};

/**
 * Log error message
 */
const logError = (message, error = null, context = {}) => {
  const sanitizedError = error ? sanitizeError(error) : null;
  const logData = {
    level: 'error',
    message,
    error: sanitizedError,
    context,
    timestamp: new Date().toISOString(),
  };

  if (isDevelopment) {
    console.error(`[ERROR] ${message}`, sanitizedError || '', context);
  }

  // In production, send to logging service
  if (isProduction) {
    // TODO: Send to logging service (e.g., Winston, Bunyan, CloudWatch, etc.)
    // loggerService.error(logData);
  }
};

/**
 * Log warning message
 */
const logWarn = (message, context = {}) => {
  const logData = {
    level: 'warn',
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  if (isDevelopment) {
    console.warn(`[WARN] ${message}`, context);
  }

  if (isProduction) {
    // TODO: Send to logging service
  }
};

/**
 * Log info message
 */
const logInfo = (message, context = {}) => {
  const logData = {
    level: 'info',
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  if (isDevelopment) {
    console.log(`[INFO] ${message}`, context);
  }

  if (isProduction) {
    // Only log important info in production
    // TODO: Send to logging service for important messages
  }
};

/**
 * Log debug message (only in development)
 */
const logDebug = (message, context = {}) => {
  if (isDevelopment) {
    console.debug(`[DEBUG] ${message}`, context);
  }
  // Never log debug in production
};

module.exports = {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
};
