const { body, param, query, validationResult } = require('express-validator');

/**
 * Nucleus Validators
 * 
 * Express-validator rules for Nucleus endpoints
 */

/**
 * Deliverable validation rules
 */
const deliverableValidators = {
  create: [
    body('project_id')
      .notEmpty()
      .withMessage('Project ID is required')
      .isMongoId()
      .withMessage('Invalid project ID format'),
    
    body('name')
      .notEmpty()
      .withMessage('Deliverable name is required')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Name must be between 1 and 200 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    
    body('start_date')
      .notEmpty()
      .withMessage('Start date is required')
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    
    body('target_date')
      .notEmpty()
      .withMessage('Target date is required')
      .isISO8601()
      .withMessage('Target date must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        if (new Date(value) < new Date(req.body.start_date)) {
          throw new Error('Target date must be after start date');
        }
        return true;
      }),
    
    body('acceptance_criteria')
      .optional()
      .isArray()
      .withMessage('Acceptance criteria must be an array')
      .custom((criteria) => {
        if (criteria && criteria.length > 0) {
          for (const item of criteria) {
            if (!item.description || typeof item.description !== 'string') {
              throw new Error('Each acceptance criteria must have a description');
            }
          }
        }
        return true;
      }),
    
    body('ownerId')
      .optional()
      .isMongoId()
      .withMessage('Invalid owner ID format')
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Name must be between 1 and 200 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    
    body('start_date')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    
    body('target_date')
      .optional()
      .isISO8601()
      .withMessage('Target date must be a valid ISO 8601 date'),
    
    body('status')
      .optional()
      .isIn(['created', 'in_dev', 'ready_approval', 'approved', 'shipped', 'in_rework'])
      .withMessage('Invalid status'),
    
    body('acceptance_criteria')
      .optional()
      .isArray()
      .withMessage('Acceptance criteria must be an array')
  ],

  status: [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['created', 'in_dev', 'ready_approval', 'approved', 'shipped', 'in_rework'])
      .withMessage('Invalid status')
  ]
};

/**
 * Approval validation rules
 */
const approvalValidators = {
  createChain: [
    body('devLeadId')
      .notEmpty()
      .withMessage('Dev Lead ID is required')
      .isMongoId()
      .withMessage('Invalid Dev Lead ID format'),
    
    body('qaLeadId')
      .notEmpty()
      .withMessage('QA Lead ID is required')
      .isMongoId()
      .withMessage('Invalid QA Lead ID format'),
    
    body('securityId')
      .optional()
      .isMongoId()
      .withMessage('Invalid Security ID format'),
    
    body('clientEmail')
      .notEmpty()
      .withMessage('Client email is required')
      .isEmail()
      .withMessage('Invalid client email format')
      .normalizeEmail()
  ],

  approve: [
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes must be less than 500 characters')
  ],

  reject: [
    body('reason')
      .notEmpty()
      .withMessage('Rejection reason is required')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Rejection reason must be between 10 and 500 characters')
  ]
};

/**
 * Change Request validation rules
 */
const changeRequestValidators = {
  submit: [
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .trim()
      .isLength({ min: 20, max: 1000 })
      .withMessage('Description must be between 20 and 1000 characters')
  ],

  evaluate: [
    body('pm_notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('PM notes must be less than 1000 characters'),
    
    body('effort_days')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Effort days must be a positive number'),
    
    body('cost_impact')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Cost impact must be a positive number'),
    
    body('date_impact_days')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Date impact days must be a non-negative integer'),
    
    body('pm_recommendation')
      .notEmpty()
      .withMessage('PM recommendation is required')
      .isIn(['accept', 'reject', 'negotiate'])
      .withMessage('PM recommendation must be: accept, reject, or negotiate')
  ],

  decide: [
    body('decision')
      .notEmpty()
      .withMessage('Decision is required')
      .isIn(['accept', 'reject'])
      .withMessage('Decision must be: accept or reject')
  ]
};

/**
 * Template validation rules
 */
const templateValidators = {
  createFromTemplate: [
    body('templateType')
      .notEmpty()
      .withMessage('Template type is required')
      .isIn(['website', 'mobile_app', 'custom'])
      .withMessage('Template type must be: website, mobile_app, or custom'),
    
    body('projectName')
      .notEmpty()
      .withMessage('Project name is required')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Project name must be between 1 and 200 characters'),
    
    body('clientId')
      .optional()
      .isMongoId()
      .withMessage('Invalid client ID format'),
    
    body('devLeadId')
      .optional()
      .isMongoId()
      .withMessage('Invalid Dev Lead ID format'),
    
    body('qaLeadId')
      .optional()
      .isMongoId()
      .withMessage('Invalid QA Lead ID format'),
    
    body('clientEmail')
      .optional()
      .isEmail()
      .withMessage('Invalid client email format')
      .normalizeEmail()
  ],

  quickStart: [
    body('workspaceName')
      .notEmpty()
      .withMessage('Workspace name is required')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Workspace name must be between 1 and 100 characters'),
    
    body('projectName')
      .notEmpty()
      .withMessage('Project name is required')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Project name must be between 1 and 200 characters'),
    
    body('templateType')
      .notEmpty()
      .withMessage('Template type is required')
      .isIn(['website', 'mobile_app', 'custom'])
      .withMessage('Template type must be: website, mobile_app, or custom')
  ]
};

/**
 * Parameter validation rules
 */
const paramValidators = {
  workspaceId: [
    param('workspaceId')
      .notEmpty()
      .withMessage('Workspace ID is required')
      .isMongoId()
      .withMessage('Invalid workspace ID format')
  ],

  projectId: [
    param('projectId')
      .notEmpty()
      .withMessage('Project ID is required')
      .isMongoId()
      .withMessage('Invalid project ID format')
  ],

  deliverableId: [
    param('deliverableId')
      .notEmpty()
      .withMessage('Deliverable ID is required')
      .isMongoId()
      .withMessage('Invalid deliverable ID format')
  ],

  approvalId: [
    param('approvalId')
      .notEmpty()
      .withMessage('Approval ID is required')
      .isMongoId()
      .withMessage('Invalid approval ID format')
  ],

  changeRequestId: [
    param('changeRequestId')
      .notEmpty()
      .withMessage('Change request ID is required')
      .isMongoId()
      .withMessage('Invalid change request ID format')
  ]
};

/**
 * Validation result handler middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  deliverableValidators,
  approvalValidators,
  changeRequestValidators,
  templateValidators,
  paramValidators,
  handleValidationErrors
};
