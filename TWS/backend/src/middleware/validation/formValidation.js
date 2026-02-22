const { body, validationResult } = require('express-validator');

// Validation middleware for form templates
const validateFormData = [
  body('title')
    .notEmpty()
    .withMessage('Form title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Form title must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('category')
    .isIn(['job_posting', 'interview_form', 'evaluation_form', 'feedback_form', 'custom'])
    .withMessage('Invalid category'),
  
  body('fields')
    .isArray({ min: 1 })
    .withMessage('At least one field is required'),
  
  body('fields.*.type')
    .isIn(['text', 'textarea', 'select', 'multiselect', 'radio', 'checkbox', 'rating', 'date', 'number', 'email', 'phone', 'file', 'url'])
    .withMessage('Invalid field type'),
  
  body('fields.*.label')
    .notEmpty()
    .withMessage('Field label is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Field label must be between 1 and 100 characters'),
  
  body('fields.*.required')
    .optional()
    .isBoolean()
    .withMessage('Required field must be a boolean'),
  
  body('fields.*.options')
    .optional()
    .isArray()
    .withMessage('Options must be an array'),
  
  body('fields.*.maxRating')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Max rating must be between 1 and 10'),
  
  body('fields.*.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum value must be numeric'),
  
  body('fields.*.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum value must be numeric'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for form responses
const validateResponseData = [
  body('formId')
    .notEmpty()
    .withMessage('Form ID is required'),
  
  body('jobPostingId')
    .optional()
    .notEmpty()
    .withMessage('Job posting ID is required for job applications'),
  
  body('candidate.name')
    .notEmpty()
    .withMessage('Candidate name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Candidate name must be between 2 and 100 characters'),
  
  body('candidate.email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('candidate.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  
  body('responses')
    .isObject()
    .withMessage('Responses must be an object'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for job postings
const validateJobPostingData = [
  body('title')
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Job title must be between 3 and 100 characters'),
  
  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  body('employmentType')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship'])
    .withMessage('Invalid employment type'),
  
  body('experienceLevel')
    .isIn(['Entry Level', 'Mid Level', 'Senior Level', 'Executive'])
    .withMessage('Invalid experience level'),
  
  body('salaryRange.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum salary must be numeric'),
  
  body('salaryRange.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum salary must be numeric'),
  
  body('formTemplateId')
    .notEmpty()
    .withMessage('Form template ID is required'),
  
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for interviews
const validateInterviewData = [
  body('candidate.name')
    .notEmpty()
    .withMessage('Candidate name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Candidate name must be between 2 and 100 characters'),
  
  body('candidate.email')
    .isEmail()
    .withMessage('Valid candidate email is required')
    .normalizeEmail(),
  
  body('candidate.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  
  body('job.id')
    .notEmpty()
    .withMessage('Job ID is required'),
  
  body('job.title')
    .notEmpty()
    .withMessage('Job title is required'),
  
  body('interviewer.name')
    .notEmpty()
    .withMessage('Interviewer name is required'),
  
  body('interviewer.email')
    .isEmail()
    .withMessage('Valid interviewer email is required')
    .normalizeEmail(),
  
  body('scheduledAt')
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  
  body('duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  
  body('type')
    .isIn(['video', 'phone', 'in-person'])
    .withMessage('Invalid interview type'),
  
  body('formTemplateId')
    .notEmpty()
    .withMessage('Form template ID is required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateFormData,
  validateResponseData,
  validateJobPostingData,
  validateInterviewData
};
