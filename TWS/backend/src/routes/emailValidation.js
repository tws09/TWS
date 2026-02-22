const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const emailValidationService = require('../services/integrations/email-validation.service');
const ErrorHandler = require('../utils/errorHandler');
const rateLimit = require('express-rate-limit');

// Rate limiting for email validation
const validationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  message: 'Too many validation requests. Please slow down.'
});

/**
 * POST /api/email/validate
 * Validate email address (comprehensive check)
 */
router.post('/validate',
  validationLimiter,
  [
    body('email').isEmail().normalizeEmail(),
  ],
  ErrorHandler.asyncHandler(async (req, res) => {
    const { email } = req.body;

    const result = await emailValidationService.validateEmail(email);

    if (result.valid) {
      res.json({
        success: true,
        valid: true,
        message: result.message,
        data: {
          email: email,
          domain: result.domain,
          checks: result.checks || {}
        }
      });
    } else {
      res.status(400).json({
        success: false,
        valid: false,
        message: result.message,
        reason: result.reason
      });
    }
  })
);

/**
 * GET /api/email/validate
 * Quick email validation (format + disposable check only)
 */
router.get('/validate',
  validationLimiter,
  [
    query('email').isEmail().normalizeEmail(),
  ],
  ErrorHandler.asyncHandler(async (req, res) => {
    const { email } = req.query;

    const result = emailValidationService.quickValidate(email);

    res.json({
      success: true,
      valid: result.valid,
      message: result.message,
      reason: result.reason || null
    });
  })
);

/**
 * POST /api/email/validate-batch
 * Validate multiple emails at once
 */
router.post('/validate-batch',
  validationLimiter,
  [
    body('emails').isArray().notEmpty(),
    body('emails.*').isEmail().normalizeEmail(),
  ],
  ErrorHandler.asyncHandler(async (req, res) => {
    const { emails } = req.body;

    if (emails.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 emails per batch'
      });
    }

    const results = await emailValidationService.validateBatch(emails);

    res.json({
      success: true,
      data: results
    });
  })
);

module.exports = router;
