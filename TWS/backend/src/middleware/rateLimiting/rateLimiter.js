/**
 * Rate Limiting Middleware
 * Prevents abuse and DoS attacks
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 */
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for sensitive operations
 * SECURITY FIX: Multi-level rate limiting (IP + user-based)
 */
exports.strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  // SECURITY FIX: Use IP + user ID for key generation (prevents multi-account abuse)
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = req.user?._id?.toString() || 'anonymous';
    return `${ip}-${userId}`;
  },
  // SECURITY FIX: Custom handler to log rate limit hits and send response
  handler: (req, res, next, options) => {
    // Log rate limit hit
    const auditService = require('../../services/compliance/audit.service');
    auditService.logEvent({
      action: 'RATE_LIMIT_EXCEEDED',
      performedBy: req.user?._id?.toString() || 'anonymous',
      userId: req.user?._id?.toString() || 'anonymous',
      userEmail: req.user?.email || 'unknown',
      userRole: req.user?.role || 'unknown',
      organization: req.user?.orgId || null,
      tenantId: req.tenant?._id?.toString() || 'default',
      resource: 'Request',
      resourceId: null,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.get('User-Agent'),
      details: {
        method: req.method,
        path: req.path,
        limit: options.max,
        windowMs: options.windowMs
      },
      severity: 'medium',
      status: 'failure'
    }).catch(err => console.error('Failed to log rate limit:', err));
    
    // Send rate limit response
    res.status(429).json({
      success: false,
      message: 'Too many requests for this operation, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      traceId: req?.headers['x-request-id'] || req?.id || null
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Session termination rate limiter
 */
exports.sessionTerminationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit to 5 terminations per minute
  message: {
    success: false,
    message: 'Too many session terminations, please wait a moment.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Bulk operation rate limiter
 */
exports.bulkOperationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Limit to 3 bulk operations per minute
  message: {
    success: false,
    message: 'Too many bulk operations, please wait a moment.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Client Portal Settings Rate Limiter
 * SECURITY: Prevents rapid toggling of client portal access
 * Limits: 5 changes per 5 minutes per user+project combination
 */
exports.clientPortalSettingsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Maximum 5 changes per 5 minutes per user
  message: {
    success: false,
    message: 'Too many changes to client portal settings. Please wait before making another change.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // SECURITY: Skip rate limiting for admins (they might need to make bulk changes)
  skip: (req) => {
    return ['admin', 'super_admin', 'org_manager'].includes(req.user?.role);
  },
  // SECURITY: Rate limit per user + project combination
  keyGenerator: (req) => {
    const userId = req.user?._id?.toString() || 'anonymous';
    const projectId = req.params.projectId || req.params.id || 'global';
    return `client_portal_${userId}_${projectId}`;
  },
  // SECURITY: Log rate limit hits
  handler: (req, res, next, options) => {
    const auditService = require('../../services/compliance/audit.service');
    auditService.logEvent({
      action: 'CLIENT_PORTAL_RATE_LIMIT_EXCEEDED',
      performedBy: req.user?._id?.toString() || 'anonymous',
      userId: req.user?._id?.toString() || 'anonymous',
      userEmail: req.user?.email || 'unknown',
      userRole: req.user?.role || 'unknown',
      organization: req.user?.orgId || null,
      tenantId: req.tenant?._id?.toString() || 'default',
      resource: 'CLIENT_PORTAL_SETTINGS',
      resourceId: req.params.projectId || null,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.get('User-Agent'),
      details: {
        method: req.method,
        path: req.path,
        reason: 'Rate limit exceeded for client portal settings changes'
      },
      severity: 'medium',
      status: 'failure'
    }).catch(err => console.error('Failed to log rate limit:', err));
    
    res.status(429).json({
      success: false,
      message: 'Too many changes to client portal settings. Please wait before making another change.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '5 minutes',
      traceId: req.headers['x-request-id'] || req.id
    });
  }
});

/**
 * Token Verification Rate Limiter
 * SECURITY FIX: Prevents brute force attacks on token verification
 * Limits: 300 token verification attempts per 15 minutes per IP (covers projects/tasks/dashboard usage)
 * More lenient than strict limiter since this runs on every authenticated request
 */
exports.tokenVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window (GET tasks, POST task, refresh, etc.)
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  // SECURITY: Use IP address for key generation (before user is authenticated)
  keyGenerator: (req) => {
    // Get real IP (handles proxies)
    const ip = req.ip || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress ||
               (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
               'unknown';
    return `token_verification_${ip}`;
  },
  // SECURITY: Custom handler to log rate limit hits
  handler: (req, res, next, options) => {
    const auditService = require('../../services/compliance/audit.service');
    auditService.logSecurityEvent('RATE_LIMIT_EXCEEDED', null, null, {
      reason: 'Token verification rate limit exceeded',
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      method: req.method,
      path: req.path,
      limit: options.max,
      windowMs: options.windowMs,
      severity: 'medium',
      status: 'failure'
    }).catch(err => console.error('Failed to log rate limit:', err));
    
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(options.windowMs / 1000) // seconds
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
  // SECURITY: Skip if token is already validated (prevents double counting)
  skip: (req) => {
    // If user is already authenticated, skip rate limiting
    // This prevents legitimate users from hitting rate limits
    return req.user !== undefined;
  }
});

/**
 * Authentication Rate Limiter
 * SECURITY: Prevents brute force attacks on login endpoints
 * Limits: 5 login attempts per 15 minutes per IP
 * Stricter than general API limiter to prevent account enumeration
 */
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  // SECURITY: Use IP address for key generation (before user is authenticated)
  keyGenerator: (req) => {
    // Get real IP (handles proxies)
    const ip = req.ip || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress ||
               (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
               'unknown';
    return `auth_${ip}`;
  },
  // SECURITY: Skip successful requests (only count failures)
  skipSuccessfulRequests: true,
  // SECURITY: Custom handler to log rate limit hits
  handler: (req, res, next, options) => {
    const auditService = require('../../services/compliance/audit.service');
    const email = req.body?.email || req.body?.username || 'unknown';
    
    auditService.logSecurityEvent(
      auditService.auditActions.LOGIN_FAILED,
      null,
      null,
      {
        resource: 'AUTHENTICATION',
        resourceId: null,
        userId: null,
        userEmail: email,
        userRole: 'unknown',
        status: 'failure',
        details: {
          reason: 'Rate limit exceeded for authentication endpoint',
          endpoint: req.path,
          method: req.method,
          email: email,
          limit: options.max,
          windowMs: options.windowMs,
          ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent'),
          bruteForceAttempt: true
        },
        ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent'),
        severity: 'high' // High severity for brute force attempts
      }
    ).catch(err => console.error('Failed to log auth rate limit:', err));
    
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again in 15 minutes.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(options.windowMs / 1000) // seconds
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Registration Rate Limiter
 * SECURITY: Prevents spam account creation
 * Limits: 3 registration attempts per hour per IP
 */
exports.registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registrations per hour
  keyGenerator: (req) => {
    const ip = req.ip || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress ||
               (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
               'unknown';
    return `registration_${ip}`;
  },
  handler: (req, res, next, options) => {
    const auditService = require('../../services/compliance/audit.service');
    const email = req.body?.email || 'unknown';
    
    auditService.logSecurityEvent(
      auditService.auditActions.LOGIN_FAILED, // Using as generic security event
      null,
      null,
      {
        resource: 'REGISTRATION',
        resourceId: null,
        userId: null,
        userEmail: email,
        userRole: 'unknown',
        status: 'failure',
        details: {
          reason: 'Rate limit exceeded for registration endpoint',
          endpoint: req.path,
          method: req.method,
          email: email,
          limit: options.max,
          windowMs: options.windowMs,
          ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent'),
          spamAttempt: true
        },
        ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent'),
        severity: 'medium'
      }
    ).catch(err => console.error('Failed to log registration rate limit:', err));
    
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts. Please try again in 1 hour.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(options.windowMs / 1000) // seconds
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Password Reset Rate Limiter
 * SECURITY: Prevents abuse of password reset functionality
 * Limits: 3 password reset requests per hour per IP
 */
exports.passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  keyGenerator: (req) => {
    const ip = req.ip || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress ||
               (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
               'unknown';
    const email = req.body?.email || 'unknown';
    return `password_reset_${ip}_${email}`;
  },
  handler: (req, res, next, options) => {
    const auditService = require('../../services/compliance/audit.service');
    const email = req.body?.email || 'unknown';
    
    auditService.logSecurityEvent(
      auditService.auditActions.LOGIN_FAILED,
      null,
      null,
      {
        resource: 'PASSWORD_RESET',
        resourceId: null,
        userId: null,
        userEmail: email,
        userRole: 'unknown',
        status: 'failure',
        details: {
          reason: 'Rate limit exceeded for password reset endpoint',
          endpoint: req.path,
          method: req.method,
          email: email,
          limit: options.max,
          windowMs: options.windowMs,
          ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent'),
          abuseAttempt: true
        },
        ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent'),
        severity: 'medium'
      }
    ).catch(err => console.error('Failed to log password reset rate limit:', err));
    
    res.status(429).json({
      success: false,
      message: 'Too many password reset requests. Please try again in 1 hour.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(options.windowMs / 1000) // seconds
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Token Refresh Rate Limiter
 * SECURITY: Prevents abuse of token refresh endpoint
 * Limits: 10 refresh attempts per 15 minutes per IP
 */
exports.tokenRefreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 refresh attempts per 15 minutes
  keyGenerator: (req) => {
    const ip = req.ip || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress ||
               (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
               'unknown';
    return `token_refresh_${ip}`;
  },
  handler: (req, res, next, options) => {
    const auditService = require('../../services/compliance/audit.service');
    
    auditService.logSecurityEvent(
      auditService.auditActions.LOGIN_FAILED,
      null,
      null,
      {
        resource: 'TOKEN_REFRESH',
        resourceId: null,
        userId: null,
        userEmail: 'unknown',
        userRole: 'unknown',
        status: 'failure',
        details: {
          reason: 'Rate limit exceeded for token refresh endpoint',
          endpoint: req.path,
          method: req.method,
          limit: options.max,
          windowMs: options.windowMs,
          ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent'),
          abuseAttempt: true
        },
        ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent'),
        severity: 'medium'
      }
    ).catch(err => console.error('Failed to log token refresh rate limit:', err));
    
    res.status(429).json({
      success: false,
      message: 'Too many token refresh attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(options.windowMs / 1000) // seconds
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});