const winston = require('winston');
const path = require('path');
const DailyRotateFile = require('winston-daily-rotate-file');

/**
 * Centralized Logging Configuration
 * Provides consistent logging across the application
 */

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for structured JSON logs
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const logEntry = {
      timestamp: info.timestamp,
      level: info.level,
      message: info.message,
      service: 'tws-backend',
      ...info
    };
    
    // Remove undefined values
    Object.keys(logEntry).forEach(key => {
      if (logEntry[key] === undefined) {
        delete logEntry[key];
      }
    });
    
    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    const requestId = info.requestId ? `[${info.requestId}]` : '';
    const userId = info.userId ? `[User:${info.userId}]` : '';
    const chatId = info.chatId ? `[Chat:${info.chatId}]` : '';
    return `${info.timestamp} ${info.level}: ${requestId}${userId}${chatId} ${info.message}`;
  })
);

// Create the main logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: jsonFormat,
  defaultMeta: { service: 'tws-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? jsonFormat : consoleFormat
    }),

    // Daily rotate file for all logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: jsonFormat
    }),

    // Daily rotate file for errors
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: jsonFormat
    }),

    // Combined log file (non-rotating for immediate access)
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Error log file (non-rotating for immediate access)
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: jsonFormat
    })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: jsonFormat
    })
  ]
});

// Create a child logger factory for request-specific logging
const createRequestLogger = (requestId, userId = null, chatId = null) => {
  return logger.child({
    requestId,
    userId,
    chatId
  });
};

// Create a child logger factory for service-specific logging
const createServiceLogger = (serviceName) => {
  return logger.child({
    service: serviceName
  });
};

// Logging utility functions
const logRequest = (req, res, responseTime) => {
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
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

const logError = (error, context = {}) => {
  const errorData = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    },
    context
  };

  logger.error('Application Error', error, errorData);
};

const logUserActivity = (activity, userId, details = {}) => {
  const logData = {
    activity,
    userId,
    ...details
  };

  logger.info('User Activity', logData);
};

const logSecurityEvent = (event, userId, details = {}) => {
  const logData = {
    event,
    userId,
    severity: 'security',
    ...details
  };

  logger.warn('Security Event', logData);
};

const logDatabaseQuery = (operation, collection, duration, query = null) => {
  const logData = {
    operation,
    collection,
    duration: `${duration}ms`,
    query: query ? JSON.stringify(query) : undefined
  };

  logger.debug('Database Query', logData);
};

const logMessageOperation = (operation, messageId, userId, chatId, details = {}) => {
  const logData = {
    operation,
    messageId,
    userId,
    chatId,
    ...details
  };

  logger.info('Message Operation', logData);
};

const logPerformanceMetric = (metric, value, details = {}) => {
  const logData = {
    metric,
    value,
    ...details
  };

  logger.info('Performance Metric', logData);
};

const logSystemEvent = (event, details = {}) => {
  const logData = {
    event,
    ...details
  };

  logger.info('System Event', logData);
};

const logAudit = (action, performedBy, targetId = null, details = {}) => {
  const logData = {
    action,
    performedBy,
    targetId,
    audit: true,
    ...details
  };

  logger.info('Audit Log', logData);
};

module.exports = {
  logger,
  createRequestLogger,
  createServiceLogger,
  logRequest,
  logError,
  logUserActivity,
  logSecurityEvent,
  logDatabaseQuery,
  logMessageOperation,
  logPerformanceMetric,
  logSystemEvent,
  logAudit
};
