const { logger, createRequestLogger } = require('../../config/logging');
const { v4: uuidv4 } = require('uuid');

/**
 * Winston Logger Service
 * Provides structured JSON logging with request context
 */
class LoggerService {
  constructor() {
    this.requestId = null;
    this.userId = null;
    this.chatId = null;
    this.logger = logger;
  }

  // Set context for current request
  setContext(requestId, userId = null, chatId = null) {
    this.requestId = requestId;
    this.userId = userId;
    this.chatId = chatId;
  }

  // Clear context
  clearContext() {
    this.requestId = null;
    this.userId = null;
    this.chatId = null;
  }

  // Generate new request ID
  generateRequestId() {
    return uuidv4();
  }

  // Logging methods
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  error(message, error = null, meta = {}) {
    const errorMeta = { ...meta };
    
    if (error) {
      errorMeta.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      };
    }
    
    this.logger.error(message, errorMeta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // Specialized logging methods
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      contentLength: res.get('Content-Length')
    };

    if (res.statusCode >= 400) {
      this.warn('HTTP Request', logData);
    } else {
      this.info('HTTP Request', logData);
    }
  }

  logDatabaseQuery(operation, collection, duration, query = null) {
    const logData = {
      operation,
      collection,
      duration: `${duration}ms`,
      query: query ? JSON.stringify(query) : undefined
    };

    this.debug('Database Query', logData);
  }

  logMessageOperation(operation, messageId, userId, chatId, details = {}) {
    const logData = {
      operation,
      messageId,
      userId,
      chatId,
      ...details
    };

    this.info('Message Operation', logData);
  }

  logUserActivity(activity, userId, details = {}) {
    const logData = {
      activity,
      userId,
      ...details
    };

    this.info('User Activity', logData);
  }

  logSecurityEvent(event, userId, details = {}) {
    const logData = {
      event,
      userId,
      severity: 'security',
      ...details
    };

    this.warn('Security Event', logData);
  }

  logPerformanceMetric(metric, value, details = {}) {
    const logData = {
      metric,
      value,
      ...details
    };

    this.info('Performance Metric', logData);
  }

  logSystemEvent(event, details = {}) {
    const logData = {
      event,
      ...details
    };

    this.info('System Event', logData);
  }

  // Audit logging
  logAudit(action, performedBy, targetId = null, details = {}) {
    const logData = {
      action,
      performedBy,
      targetId,
      audit: true,
      ...details
    };

    this.info('Audit Log', logData);
  }

  // Error logging with context
  logError(error, context = {}) {
    const errorData = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      context
    };

    this.error('Application Error', error, errorData);
  }

  // Get logger instance for direct use
  getLogger() {
    return this.logger;
  }

  // Create child logger with additional context
  child(defaultMeta = {}) {
    return this.logger.child(defaultMeta);
  }
}

// Create singleton instance
const loggerService = new LoggerService();

// Export both the service and a convenience logger
module.exports = {
  loggerService,
  logger: loggerService,
  createLogger: (defaultMeta) => loggerService.child(defaultMeta)
};