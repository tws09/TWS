const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for file uploads
 * Prevents abuse of upload endpoints
 */

// Student homework upload limiter: 10 uploads per hour
const studentUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: {
    success: false,
    message: 'Too many upload attempts. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Only count failed requests (optional)
  skipSuccessfulRequests: false,
  // Use user ID as key
  keyGenerator: (req) => {
    return req.user?._id?.toString() || req.ip;
  }
});

// Teacher/admin upload limiter: 50 uploads per hour
const teacherUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many upload attempts. Please try again later.'
  },
  keyGenerator: (req) => {
    return req.user?._id?.toString() || req.ip;
  }
});

module.exports = {
  studentUploadLimiter,
  teacherUploadLimiter
};

