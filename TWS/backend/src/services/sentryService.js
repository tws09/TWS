const Sentry = require('@sentry/node');
const { loggerService } = require('./core/logger.service');

/**
 * Sentry Error Tracking Service
 * Provides comprehensive error tracking with contextual breadcrumbs
 */
class SentryService {
  constructor() {
    this.initialized = false;
    this.dsn = process.env.SENTRY_DSN;
    this.environment = process.env.NODE_ENV || 'development';
    this.release = process.env.APP_VERSION || '1.0.0';
  }

  initialize() {
    if (!this.dsn) {
      console.warn('Sentry DSN not provided. Error tracking disabled.');
      return;
    }

    try {
      Sentry.init({
        dsn: this.dsn,
        environment: this.environment,
        release: this.release,
        
        // Performance monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        
        // Error sampling
        sampleRate: 1.0,
        
        // Integrations
        integrations: [
          // Enable HTTP integration for request tracking
          new Sentry.Integrations.Http({ tracing: true }),
          
          // Enable Express integration
          new Sentry.Integrations.Express({ app: undefined }),
          
          // Enable MongoDB integration
          new Sentry.Integrations.Mongo({ useMongoose: true }),
          
          // Enable Node.js integration
          new Sentry.Integrations.Node({}),
          
          // Enable OnUncaughtException integration
          new Sentry.Integrations.OnUncaughtException({
            exitEvenIfOtherHandlersAreRegistered: false
          }),
          
          // Enable OnUnhandledRejection integration
          new Sentry.Integrations.OnUnhandledRejection({
            mode: 'warn'
          })
        ],
        
        // Before send hook to filter sensitive data
        beforeSend(event, hint) {
          // Remove sensitive data
          if (event.request) {
            delete event.request.headers.authorization;
            delete event.request.cookies;
          }
          
          // Add custom context
          event.tags = {
            ...event.tags,
            component: 'tws-backend'
          };
          
          return event;
        },
        
        // Before breadcrumb hook
        beforeBreadcrumb(breadcrumb) {
          // Filter out sensitive breadcrumbs
          if (breadcrumb.category === 'http' && breadcrumb.data) {
            delete breadcrumb.data.authorization;
            delete breadcrumb.data.cookie;
          }
          
          return breadcrumb;
        }
      });

      this.initialized = true;
      loggerService.info('Sentry initialized successfully', {
        environment: this.environment,
        release: this.release
      });

    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
      loggerService.error('Sentry initialization failed', error);
    }
  }

  // Set user context
  setUserContext(userId, userInfo = {}) {
    if (!this.initialized) return;

    Sentry.setUser({
      id: userId,
      ...userInfo
    });

    loggerService.debug('Sentry user context set', { userId, userInfo });
  }

  // Set request context
  setRequestContext(req) {
    if (!this.initialized) return;

    Sentry.setContext('request', {
      method: req.method,
      url: req.url,
      headers: this.sanitizeHeaders(req.headers),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Set user if available
    if (req.user) {
      this.setUserContext(req.user._id, {
        email: req.user.email,
        role: req.user.role,
        organization: req.user.orgId
      });
    }
  }

  // Set chat context
  setChatContext(chatId, chatInfo = {}) {
    if (!this.initialized) return;

    Sentry.setContext('chat', {
      chatId,
      ...chatInfo
    });

    loggerService.debug('Sentry chat context set', { chatId, chatInfo });
  }

  // Set message context
  setMessageContext(messageId, messageInfo = {}) {
    if (!this.initialized) return;

    Sentry.setContext('message', {
      messageId,
      ...messageInfo
    });

    loggerService.debug('Sentry message context set', { messageId, messageInfo });
  }

  // Add breadcrumb
  addBreadcrumb(message, category = 'custom', level = 'info', data = {}) {
    if (!this.initialized) return;

    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data: this.sanitizeData(data),
      timestamp: Date.now() / 1000
    });
  }

  // Capture exception
  captureException(error, context = {}) {
    if (!this.initialized) {
      loggerService.error('Sentry not initialized, logging error locally', error, context);
      return;
    }

    // Add context
    if (Object.keys(context).length > 0) {
      Sentry.withScope((scope) => {
        Object.keys(context).forEach(key => {
          scope.setContext(key, context[key]);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }

    loggerService.error('Exception captured by Sentry', error, context);
  }

  // Capture message
  captureMessage(message, level = 'info', context = {}) {
    if (!this.initialized) {
      loggerService.info('Sentry not initialized, logging message locally', { message, level, context });
      return;
    }

    // Add context
    if (Object.keys(context).length > 0) {
      Sentry.withScope((scope) => {
        Object.keys(context).forEach(key => {
          scope.setContext(key, context[key]);
        });
        Sentry.captureMessage(message, level);
      });
    } else {
      Sentry.captureMessage(message, level);
    }

    loggerService.info('Message captured by Sentry', { message, level, context });
  }

  // Start transaction
  startTransaction(name, op = 'custom') {
    if (!this.initialized) return null;

    return Sentry.startTransaction({
      name,
      op
    });
  }

  // Start span
  startSpan(transaction, name, op = 'custom') {
    if (!this.initialized || !transaction) return null;

    return transaction.startChild({
      op,
      description: name
    });
  }

  // Finish span
  finishSpan(span) {
    if (span) {
      span.finish();
    }
  }

  // Finish transaction
  finishTransaction(transaction) {
    if (transaction) {
      transaction.finish();
    }
  }

  // Set tag
  setTag(key, value) {
    if (!this.initialized) return;

    Sentry.setTag(key, value);
  }

  // Set extra data
  setExtra(key, value) {
    if (!this.initialized) return;

    Sentry.setExtra(key, this.sanitizeData(value));
  }

  // Set context
  setContext(key, context) {
    if (!this.initialized) return;

    Sentry.setContext(key, this.sanitizeData(context));
  }

  // Clear context
  clearContext() {
    if (!this.initialized) return;

    Sentry.configureScope((scope) => {
      scope.clear();
    });
  }

  // Express middleware
  getExpressMiddleware() {
    if (!this.initialized) return (req, res, next) => next();

    return Sentry.requestHandler();
  }

  // Express error handler
  getExpressErrorHandler() {
    if (!this.initialized) return (err, req, res, next) => next(err);

    return Sentry.errorHandler();
  }

  // Express tracing middleware
  getExpressTracingMiddleware() {
    if (!this.initialized) return (req, res, next) => next();

    return Sentry.tracingHandler();
  }

  // Sanitize sensitive data
  sanitizeData(data) {
    if (typeof data !== 'object' || data === null) return data;

    const sanitized = { ...data };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];

    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    });

    return sanitized;
  }

  // Sanitize headers
  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  // Flush events (useful for graceful shutdown)
  async flush(timeout = 2000) {
    if (!this.initialized) return;

    try {
      await Sentry.flush(timeout);
      loggerService.info('Sentry events flushed successfully');
    } catch (error) {
      loggerService.error('Failed to flush Sentry events', error);
    }
  }

  // Close Sentry
  async close() {
    if (!this.initialized) return;

    try {
      await this.flush();
      loggerService.info('Sentry closed successfully');
    } catch (error) {
      loggerService.error('Failed to close Sentry', error);
    }
  }

  // Health check
  isHealthy() {
    return this.initialized && !!this.dsn;
  }

  // Get Sentry instance for advanced usage
  getSentry() {
    return Sentry;
  }
}

// Create singleton instance
const sentryService = new SentryService();

// Initialize on module load if DSN is provided
if (process.env.SENTRY_DSN) {
  sentryService.initialize();
}

module.exports = sentryService;
