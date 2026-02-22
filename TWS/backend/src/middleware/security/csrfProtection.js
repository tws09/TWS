const crypto = require('crypto');
const jwtService = require('../../services/auth/jwt.service');
const auditService = require('../../services/compliance/audit.service');

/**
 * CSRF Protection Middleware
 * Implements Double Submit Cookie pattern for CSRF protection
 */
class CSRFProtection {
  constructor() {
    this.secretKey = process.env.CSRF_SECRET_KEY || crypto.randomBytes(32).toString('hex');
    this.cookieName = 'csrf-token';
    this.headerName = 'x-csrf-token';
    this.maxAge = 24 * 60 * 60 * 1000; // 24 hours
    this.secure = process.env.NODE_ENV === 'production';
    this.sameSite = 'strict';
  }

  /**
   * Generate CSRF token
   */
  generateToken(sessionId) {
    const payload = {
      sessionId,
      timestamp: Date.now(),
      random: crypto.randomBytes(16).toString('hex')
    };

    const token = crypto
      .createHmac('sha256', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    return {
      token,
      payload: Buffer.from(JSON.stringify(payload)).toString('base64')
    };
  }

  /**
   * Verify CSRF token
   */
  verifyToken(token, sessionId) {
    try {
      // Decode payload
      const payload = JSON.parse(Buffer.from(token.payload, 'base64').toString());
      
      // Check timestamp (token should not be older than maxAge)
      if (Date.now() - payload.timestamp > this.maxAge) {
        return { valid: false, reason: 'Token expired' };
      }

      // Check session ID
      if (payload.sessionId !== sessionId) {
        return { valid: false, reason: 'Session mismatch' };
      }

      // Verify token signature
      const expectedToken = crypto
        .createHmac('sha256', this.secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (token.token !== expectedToken) {
        return { valid: false, reason: 'Invalid signature' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Invalid token format' };
    }
  }

  /**
   * Middleware to generate CSRF token
   */
  generateTokenMiddleware() {
    return (req, res, next) => {
      // Skip CSRF for safe methods and API endpoints that don't need it
      if (this.shouldSkipCSRF(req)) {
        return next();
      }

      const sessionId = req.sessionID || req.user?._id?.toString() || 'anonymous';
      const { token, payload } = this.generateToken(sessionId);

      // Set cookie - IMPORTANT: Set before any response is sent
      res.cookie(this.cookieName, payload, {
        httpOnly: false, // Allow JavaScript access for AJAX requests
        secure: this.secure,
        sameSite: this.sameSite,
        maxAge: this.maxAge,
        path: '/'
      });

      // Add token to response headers for AJAX requests
      res.setHeader('X-CSRF-Token', token);

      // Add to response body for forms
      req.csrfToken = token;
      
      // IMPORTANT: Ensure token is sent even if response is an error
      // Override res.json to ensure token is always included
      const originalJson = res.json.bind(res);
      res.json = function(body) {
        // Ensure CSRF token header is set even on error responses
        if (!res.getHeader('X-CSRF-Token')) {
          res.setHeader('X-CSRF-Token', token);
        }
        return originalJson(body);
      };
      
      next();
    };
  }

  /**
   * Middleware to verify CSRF token
   */
  verifyTokenMiddleware() {
    return async (req, res, next) => {
      // Skip CSRF for safe methods and certain endpoints
      if (this.shouldSkipCSRF(req)) {
        return next();
      }

      // DEVELOPMENT: Log CSRF verification attempt for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 CSRF Verification:', {
          method: req.method,
          path: req.path,
          hasCookie: !!req.cookies?.[this.cookieName],
          hasHeader: !!req.headers[this.headerName.toLowerCase()],
          cookieValue: req.cookies?.[this.cookieName]?.substring(0, 20) + '...',
          headerValue: req.headers[this.headerName.toLowerCase()]?.substring(0, 20) + '...'
        });
      }

      const sessionId = req.sessionID || req.user?._id?.toString() || 'anonymous';
      // SECURITY FIX: Handle undefined cookies gracefully
      // Initialize cookies object if it doesn't exist (cookie-parser might not be loaded)
      if (!req.cookies) {
        req.cookies = {};
      }
      const cookieToken = req.cookies[this.cookieName];
      const headerToken = req.headers[this.headerName.toLowerCase()];

      if (!cookieToken || !headerToken) {
        await this.logCSRFAttempt(req, 'Missing token');
        return res.status(403).json({
          success: false,
          message: 'CSRF token missing. Please ensure cookies are enabled and CSRF token is sent in both cookie and header.',
          code: 'CSRF_TOKEN_MISSING',
          details: {
            hasCookie: !!cookieToken,
            hasHeader: !!headerToken,
            cookieName: this.cookieName,
            headerName: this.headerName
          }
        });
      }

      // SECURITY FIX: Verify token using Double Submit Cookie pattern
      // The cookie contains the payload (base64), the header contains the token (HMAC hash)
      // We need to verify that the token in the header matches the payload in the cookie
      // First, decode the cookie payload if needed
      let decodedPayload = cookieToken;
      try {
        // Try to decode if it's base64
        if (cookieToken && !cookieToken.startsWith('{')) {
          decodedPayload = Buffer.from(cookieToken, 'base64').toString('utf-8');
        }
      } catch (e) {
        // If decoding fails, use original
        decodedPayload = cookieToken;
      }
      
      const verification = this.verifyToken(
        { token: headerToken, payload: cookieToken }, // Use original cookieToken for verification
        sessionId
      );

      if (!verification.valid) {
        await this.logCSRFAttempt(req, verification.reason);
        return res.status(403).json({
          success: false,
          message: 'CSRF token invalid',
          code: 'CSRF_TOKEN_INVALID',
          reason: verification.reason
        });
      }

      next();
    };
  }

  /**
   * Check if CSRF protection should be skipped
   */
  shouldSkipCSRF(req) {
    // DEVELOPMENT: Skip CSRF if disabled via environment variable
    if (process.env.DISABLE_CSRF_PROTECTION === 'true' || process.env.DISABLE_CSRF === 'true') {
      console.warn('⚠️ CSRF Protection is DISABLED (development mode)');
      return true;
    }

    // Skip for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return true;
    }

    // Skip for certain API endpoints
    const skipPaths = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/health',
      '/api/metrics',
      '/api/webhooks'
    ];

    if (skipPaths.some(path => req.path.startsWith(path))) {
      return true;
    }

    // Skip for file uploads (handled separately)
    if (req.path.includes('/upload') || req.path.includes('/files')) {
      return true;
    }

    return false;
  }

  /**
   * Log CSRF attempts
   */
  async logCSRFAttempt(req, reason) {
    try {
      await auditService.logSecurityEvent(
        auditService.auditActions.CSRF_ATTEMPT,
        req.user?._id,
        req.user?.orgId,
        {
          reason,
          details: {
            method: req.method,
            path: req.path,
            userAgent: req.get('User-Agent'),
            referer: req.get('Referer'),
            origin: req.get('Origin')
          },
          ipAddress: req.ip,
          severity: 'high'
        }
      );
    } catch (error) {
      console.error('Failed to log CSRF attempt:', error);
    }
  }

  /**
   * Get CSRF token for forms
   */
  getToken(req) {
    return req.csrfToken;
  }

  /**
   * Middleware to add CSRF token to response
   */
  addTokenToResponse() {
    return (req, res, next) => {
      if (req.csrfToken) {
        res.locals.csrfToken = req.csrfToken;
      }
      next();
    };
  }
}

// Create singleton instance
const csrfProtection = new CSRFProtection();

module.exports = csrfProtection;
