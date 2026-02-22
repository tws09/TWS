const validator = require('validator');
const xss = require('xss');
const DOMPurify = require('isomorphic-dompurify');
const auditService = require('../../services/compliance/audit.service');

/**
 * Enhanced Input Sanitization Middleware
 * Provides comprehensive input validation and sanitization
 */
class InputSanitization {
  constructor() {
    this.xssOptions = {
      whiteList: {
        // Allow safe HTML tags for rich text
        p: [],
        br: [],
        strong: [],
        em: [],
        u: [],
        code: ['class'],
        pre: ['class'],
        blockquote: [],
        ul: [],
        ol: [],
        li: [],
        a: ['href', 'title', 'target', 'rel'],
        img: ['src', 'alt', 'title', 'width', 'height'],
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: []
      },
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
      css: false,
      allowList: {
        'code': ['class'],
        'pre': ['class']
      }
    };

    this.sanitizationRules = {
      // User input fields
      email: {
        sanitize: (value) => validator.normalizeEmail(value, { gmail_remove_dots: false }),
        validate: (value) => validator.isEmail(value),
        error: 'Invalid email format'
      },
      password: {
        sanitize: (value) => value.trim(),
        validate: (value) => {
          return value.length >= 8 && 
                 /[A-Z]/.test(value) && 
                 /[a-z]/.test(value) && 
                 /[0-9]/.test(value) &&
                 /[^A-Za-z0-9]/.test(value);
        },
        error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      },
      fullName: {
        sanitize: (value) => DOMPurify.sanitize(value.trim()),
        validate: (value) => {
          return value.length >= 2 && 
                 value.length <= 100 && 
                 /^[a-zA-Z\s\-'\.]+$/.test(value);
        },
        error: 'Name must be 2-100 characters and contain only letters, spaces, hyphens, apostrophes, and periods'
      },
      phone: {
        sanitize: (value) => value.replace(/[^\d\+\-\(\)\s]/g, ''),
        validate: (value) => validator.isMobilePhone(value, 'any', { strictMode: false }),
        error: 'Invalid phone number format'
      },
      
      // Message content
      messageContent: {
        sanitize: (value) => {
          // Allow markdown-like formatting but sanitize HTML
          let sanitized = DOMPurify.sanitize(value, this.xssOptions);
          
          // Preserve markdown formatting
          sanitized = sanitized
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
          
          return sanitized;
        },
        validate: (value) => {
          return value.length <= 10000 && // Max 10KB message
                 !this.containsMaliciousContent(value);
        },
        error: 'Message content is invalid or too long'
      },
      
      // File uploads
      filename: {
        sanitize: (value) => {
          // Remove path traversal attempts
          return value
            .replace(/\.\./g, '')
            .replace(/[\/\\]/g, '_')
            .replace(/[^a-zA-Z0-9\-_\.]/g, '_')
            .substring(0, 255);
        },
        validate: (value) => {
          return value.length > 0 && 
                 value.length <= 255 &&
                 !value.includes('..') &&
                 !value.includes('/') &&
                 !value.includes('\\');
        },
        error: 'Invalid filename'
      },
      
      // URLs
      url: {
        sanitize: (value) => validator.escape(value.trim()),
        validate: (value) => {
          try {
            const url = new URL(value);
            return ['http:', 'https:'].includes(url.protocol);
          } catch {
            return false;
          }
        },
        error: 'Invalid URL format'
      },
      
      // Generic text fields
      text: {
        sanitize: (value) => DOMPurify.sanitize(value.trim()),
        validate: (value) => value.length <= 1000,
        error: 'Text too long'
      },
      
      // Numbers
      number: {
        sanitize: (value) => parseFloat(value),
        validate: (value) => !isNaN(value) && isFinite(value),
        error: 'Invalid number'
      },
      
      // MongoDB ObjectId
      objectId: {
        sanitize: (value) => value.trim(),
        validate: (value) => validator.isMongoId(value),
        error: 'Invalid ID format'
      }
    };
  }

  /**
   * Check for malicious content
   */
  containsMaliciousContent(value) {
    const maliciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /<link[^>]*>/gi,
      /<meta[^>]*>/gi,
      /<style[^>]*>.*?<\/style>/gi
    ];

    return maliciousPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Sanitize input based on field type
   */
  sanitizeInput(fieldName, value, fieldType = 'text') {
    const rule = this.sanitizationRules[fieldType] || this.sanitizationRules.text;
    
    if (typeof value === 'string') {
      return rule.sanitize(value);
    }
    
    return value;
  }

  /**
   * Validate input based on field type
   */
  validateInput(fieldName, value, fieldType = 'text') {
    const rule = this.sanitizationRules[fieldType] || this.sanitizationRules.text;
    
    if (value === null || value === undefined) {
      return { valid: false, error: `${fieldName} is required` };
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      return { valid: false, error: `${fieldName} cannot be empty` };
    }
    
    if (!rule.validate(value)) {
      return { valid: false, error: rule.error };
    }
    
    return { valid: true };
  }

  /**
   * Middleware to sanitize request body
   */
  sanitizeBody(fields) {
    return (req, res, next) => {
      try {
        if (req.body && typeof req.body === 'object') {
          for (const [fieldName, fieldType] of Object.entries(fields)) {
            if (req.body[fieldName] !== undefined) {
              req.body[fieldName] = this.sanitizeInput(fieldName, req.body[fieldName], fieldType);
            }
          }
        }
        next();
      } catch (error) {
        console.error('Sanitization error:', error);
        res.status(400).json({
          success: false,
          message: 'Invalid input data'
        });
      }
    };
  }

  /**
   * Middleware to validate request body
   */
  validateBody(fields) {
    return async (req, res, next) => {
      try {
        const errors = [];
        
        if (req.body && typeof req.body === 'object') {
          for (const [fieldName, fieldType] of Object.entries(fields)) {
            if (req.body[fieldName] !== undefined) {
              const validation = this.validateInput(fieldName, req.body[fieldName], fieldType);
              if (!validation.valid) {
                errors.push(validation.error);
              }
            }
          }
        }

        if (errors.length > 0) {
          // Log validation failures
          await auditService.logSecurityEvent(
            auditService.auditActions.VALIDATION_FAILED,
            req.user?._id,
            req.user?.orgId,
            {
              reason: 'Input validation failed',
              details: { errors, path: req.path, method: req.method },
              ipAddress: req.ip,
              userAgent: req.get('User-Agent'),
              severity: 'low'
            }
          );

          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
          });
        }

        next();
      } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({
          success: false,
          message: 'Validation error'
        });
      }
    };
  }

  /**
   * Middleware to sanitize query parameters
   */
  sanitizeQuery() {
    return (req, res, next) => {
      try {
        if (req.query && typeof req.query === 'object') {
          for (const [key, value] of Object.entries(req.query)) {
            if (typeof value === 'string') {
              req.query[key] = this.sanitizeInput(key, value, 'text');
            }
          }
        }
        next();
      } catch (error) {
        console.error('Query sanitization error:', error);
        res.status(400).json({
          success: false,
          message: 'Invalid query parameters'
        });
      }
    };
  }

  /**
   * Middleware to sanitize URL parameters
   */
  sanitizeParams() {
    return (req, res, next) => {
      try {
        if (req.params && typeof req.params === 'object') {
          for (const [key, value] of Object.entries(req.params)) {
            if (typeof value === 'string') {
              // For IDs, use objectId validation
              if (key.includes('Id') || key.includes('id')) {
                req.params[key] = this.sanitizeInput(key, value, 'objectId');
              } else {
                req.params[key] = this.sanitizeInput(key, value, 'text');
              }
            }
          }
        }
        next();
      } catch (error) {
        console.error('Params sanitization error:', error);
        res.status(400).json({
          success: false,
          message: 'Invalid URL parameters'
        });
      }
    };
  }

  /**
   * Comprehensive sanitization middleware
   */
  sanitizeAll() {
    return [
      this.sanitizeQuery(),
      this.sanitizeParams(),
      (req, res, next) => {
        // Sanitize common fields in body
        if (req.body) {
          const commonFields = {
            email: 'email',
            fullName: 'fullName',
            content: 'messageContent',
            message: 'messageContent',
            description: 'text',
            name: 'text',
            title: 'text'
          };

          for (const [field, type] of Object.entries(commonFields)) {
            if (req.body[field] !== undefined) {
              req.body[field] = this.sanitizeInput(field, req.body[field], type);
            }
          }
        }
        next();
      }
    ];
  }

  /**
   * Rate limiting for input validation
   */
  createRateLimit() {
    const attempts = new Map();
    const maxAttempts = 10;
    const windowMs = 15 * 60 * 1000; // 15 minutes

    return (req, res, next) => {
      const key = req.ip;
      const now = Date.now();
      const windowStart = now - windowMs;

      if (!attempts.has(key)) {
        attempts.set(key, []);
      }

      const userAttempts = attempts.get(key);
      
      // Remove old attempts
      const recentAttempts = userAttempts.filter(time => time > windowStart);
      attempts.set(key, recentAttempts);

      if (recentAttempts.length >= maxAttempts) {
        return res.status(429).json({
          success: false,
          message: 'Too many validation attempts',
          retryAfter: Math.ceil((recentAttempts[0] + windowMs - now) / 1000)
        });
      }

      // Add current attempt
      recentAttempts.push(now);
      next();
    };
  }
}

// Create singleton instance
const inputSanitization = new InputSanitization();

module.exports = inputSanitization;
