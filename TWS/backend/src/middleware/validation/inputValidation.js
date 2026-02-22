const { body, param, query, validationResult } = require('express-validator');

/**
 * Input Validation Middleware for Education System
 * Prevents SQL injection, XSS, and other injection attacks
 */

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Student registration validation
 */
const validateStudentRegistration = [
  body('firstName').trim().notEmpty().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').trim().notEmpty().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('dateOfBirth').isDate().withMessage('Invalid date of birth'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('phone').optional().matches(/^[0-9+\-\s()]*$/).withMessage('Invalid phone format'),
  body('admissionNumber').trim().notEmpty().withMessage('Admission number required'),
  handleValidationErrors
];

/**
 * Grade entry validation
 */
const validateGradeEntry = [
  body('studentId').isMongoId().withMessage('Invalid student ID'),
  body('subjectId').isMongoId().withMessage('Invalid subject ID'),
  body('examId').isMongoId().withMessage('Invalid exam ID'),
  body('obtainedMarks').isFloat({ min: 0 }).withMessage('Obtained marks must be positive'),
  body('totalMarks').isFloat({ min: 1 }).withMessage('Total marks must be positive'),
  body('grade').optional().trim().isLength({ max: 5 }).withMessage('Grade too long'),
  handleValidationErrors
];

/**
 * Attendance marking validation
 */
const validateAttendance = [
  body('studentId').isMongoId().withMessage('Invalid student ID'),
  body('date').isDate().withMessage('Invalid date'),
  body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid attendance status'),
  body('remarks').optional().trim().isLength({ max: 500 }).withMessage('Remarks too long'),
  handleValidationErrors
];

/**
 * Homework submission validation
 */
const validateHomeworkSubmission = [
  param('id').isMongoId().withMessage('Invalid homework ID'),
  body('submissionText').optional().trim().isLength({ max: 5000 }).withMessage('Submission text too long'),
  handleValidationErrors
];

/**
 * Fee payment validation
 */
const validateFeePayment = [
  body('studentId').isMongoId().withMessage('Invalid student ID'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('paymentMethod').optional().isIn(['cash', 'card', 'bank_transfer', 'online', 'cheque']).withMessage('Invalid payment method'),
  body('paymentDate').optional().isDate().withMessage('Invalid payment date'),
  handleValidationErrors
];

/**
 * Announcement validation
 */
const validateAnnouncement = [
  body('title').trim().notEmpty().isLength({ max: 200 }).withMessage('Title required (max 200 chars)'),
  body('content').trim().notEmpty().isLength({ max: 5000 }).withMessage('Content required (max 5000 chars)'),
  body('type').optional().isIn(['announcement', 'alert', 'notice', 'event']).withMessage('Invalid type'),
  body('targetAudience').optional().isIn(['all', 'students', 'teachers', 'parents']).withMessage('Invalid target audience'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
  handleValidationErrors
];

/**
 * ID parameter validation
 */
const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors
];

/**
 * Query parameter validation for pagination
 */
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  handleValidationErrors
];

/**
 * Sanitize user input to prevent XSS
 */
const sanitizeInput = (req, res, next) => {
  // Helper function to recursively sanitize
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remove potentially dangerous characters
      return obj
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        obj[key] = sanitize(obj[key]);
      });
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
};

module.exports = {
  validateStudentRegistration,
  validateGradeEntry,
  validateAttendance,
  validateHomeworkSubmission,
  validateFeePayment,
  validateAnnouncement,
  validateMongoId,
  validatePagination,
  sanitizeInput,
  handleValidationErrors
};

