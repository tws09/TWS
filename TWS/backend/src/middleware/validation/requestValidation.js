/**
 * Request Validation Middleware
 * Validates Content-Type, Authorization header format, and request size
 */

/**
 * Validate Content-Type header
 * SECURITY FIX: Prevent JSON injection and unexpected payload types
 */
const validateContentType = (req, res, next) => {
  // Skip for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const contentType = req.get('Content-Type');
  
  // For POST/PUT/PATCH, require application/json
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        success: false,
        message: 'Content-Type must be application/json',
        code: 'INVALID_CONTENT_TYPE',
        traceId: req.headers['x-request-id'] || req.id
      });
    }
  }

  next();
};

/**
 * Validate Authorization header format
 * SECURITY FIX: Ensure Bearer token format is correct
 */
const validateAuthHeader = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Skip if no auth header (some endpoints might not require auth)
  if (!authHeader) {
    return next();
  }

  // Validate Bearer token format
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization header format. Expected: Bearer <token>',
      code: 'INVALID_AUTH_FORMAT',
      traceId: req.headers['x-request-id'] || req.id
    });
  }

  const token = authHeader.substring(7).trim();
  
  // Validate token is not empty
  if (!token || token.length < 10) {
    return res.status(401).json({
      success: false,
      message: 'Token is required and must be at least 10 characters',
      code: 'INVALID_TOKEN',
      traceId: req.headers['x-request-id'] || req.id
    });
  }

  next();
};

/**
 * Validate request body size
 * SECURITY FIX: Prevent payload-based DoS attacks
 */
const validateRequestSize = (maxSize = '1mb') => {
  return (req, res, next) => {
    const contentLength = req.get('Content-Length');
    
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);
      const maxSizeInBytes = parseSize(maxSize);
      
      if (sizeInBytes > maxSizeInBytes) {
        return res.status(413).json({
          success: false,
          message: `Request body too large. Maximum size: ${maxSize}`,
          code: 'PAYLOAD_TOO_LARGE',
          traceId: req.headers['x-request-id'] || req.id
        });
      }
    }

    next();
  };
};

/**
 * Parse size string to bytes
 */
function parseSize(size) {
  const units = {
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };

  const match = size.toLowerCase().match(/^(\d+)(kb|mb|gb)$/);
  if (match) {
    return parseInt(match[1], 10) * units[match[2]];
  }

  return 1024 * 1024; // Default 1MB
}

module.exports = {
  validateContentType,
  validateAuthHeader,
  validateRequestSize
};
