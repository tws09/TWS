/**
 * Idempotency Key Middleware
 * Prevents duplicate requests using idempotency keys
 * SECURITY FIX: Server-side idempotency prevents duplicate project creation
 */

const crypto = require('crypto');
const auditService = require('../../services/compliance/audit.service');

// In-memory store for idempotency keys (use Redis in production)
const idempotencyStore = new Map();
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Clean up expired idempotency keys
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of idempotencyStore.entries()) {
    if (value.expiresAt < now) {
      idempotencyStore.delete(key);
    }
  }
}, 60 * 60 * 1000); // Clean every hour

/**
 * Generate idempotency key middleware
 * Checks for X-Idempotency-Key header and stores response
 */
const idempotencyMiddleware = () => {
  return async (req, res, next) => {
    // Only apply to state-changing methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    const idempotencyKey = req.headers['x-idempotency-key'];
    
    // If no key provided, generate one and continue
    if (!idempotencyKey) {
      return next();
    }

    // Validate key format (UUID v4)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(idempotencyKey)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid idempotency key format. Must be a valid UUID v4',
        code: 'INVALID_IDEMPOTENCY_KEY',
        traceId: req.headers['x-request-id'] || req.id
      });
    }

    // Check if we've seen this key before
    const cached = idempotencyStore.get(idempotencyKey);
    
    if (cached) {
      // Return cached response
      res.status(cached.statusCode);
      res.set('X-Idempotency-Key', idempotencyKey);
      res.set('X-Idempotency-Replayed', 'true');
      return res.json(cached.body);
    }

    // Store original res.json
    const originalJson = res.json.bind(res);
    const originalStatus = res.status.bind(res);
    let statusCode = 200;
    let responseBody = null;

    // Override res.json to capture response
    res.status = function(code) {
      statusCode = code;
      return originalStatus(code);
    };

    res.json = function(body) {
      responseBody = body;
      
      // Store response for idempotency
      idempotencyStore.set(idempotencyKey, {
        statusCode,
        body: responseBody,
        expiresAt: Date.now() + IDEMPOTENCY_TTL,
        path: req.path,
        method: req.method
      });

      // Log idempotency key usage
      auditService.logEvent({
        action: 'IDEMPOTENCY_KEY_USED',
        userId: req.user?._id?.toString() || 'system',
        userEmail: req.user?.email || 'system@tws.com',
        userRole: req.user?.role || 'system',
        organization: req.user?.orgId || null,
        tenantId: req.tenant?._id?.toString() || 'default',
        resource: 'Request',
        resourceId: idempotencyKey,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.get('User-Agent'),
        details: {
          method: req.method,
          path: req.path,
          idempotencyKey
        },
        severity: 'info',
        status: 'success'
      }).catch(err => console.error('Failed to log idempotency:', err));

      return originalJson(body);
    };

    next();
  };
};

module.exports = {
  idempotencyMiddleware
};
