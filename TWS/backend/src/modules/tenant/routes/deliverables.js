const express = require('express');
const router = express.Router();
const Deliverable = require('../../../models/Deliverable');
const Milestone = require('../../../models/Milestone');
const Project = require('../../../models/Project');
const { authenticateToken } = require('../../../middleware/auth/auth');
const ErrorHandler = require('../../../middleware/common/errorHandler');
// Use standardized orgId helper utility
const { ensureOrgId, getTenantFilter } = require('../../../utils/orgIdHelper');

/**
 * GET /deliverables
 * Get all deliverables for a project (or all projects)
 */
router.get('/',
  authenticateToken,
  ErrorHandler.asyncHandler(async (req, res) => {
    // Use standardized orgId utility
    const orgId = await ensureOrgId(req);
    const tenantId = req.tenantId || req.tenant?._id?.toString();
    const { projectId, status } = req.query;
    
    const filter = { orgId, tenantId };
    if (projectId) {
      filter.project_id = projectId;
    }
    if (status) {
      filter.status = status;
    }
    
    const deliverables = await Deliverable.find(filter)
      .populate('project_id', 'name')
      .sort({ target_date: 1 });
    
    res.json({
      success: true,
      data: deliverables
    });
  })
);

/**
 * GET /deliverables/:id
 * Get a single deliverable by ID
 */
router.get('/:id',
  authenticateToken,
  ErrorHandler.asyncHandler(async (req, res) => {
    // Use standardized orgId utility
    const orgId = await ensureOrgId(req);
    const tenantId = req.tenantId || req.tenant?._id?.toString();
    
    let deliverable = await Deliverable.findOne({
      _id: req.params.id,
      orgId,
      tenantId
    }).populate('project_id', 'name');
    
    // Fallback to Milestone if not found
    if (!deliverable) {
      const milestone = await Milestone.findOne({
        _id: req.params.id,
        orgId
      }).populate('projectId', 'name');
      
      if (!milestone) {
        return res.status(404).json({
          success: false,
          message: 'Deliverable not found'
        });
      }
      
      // Transform milestone to deliverable format
      deliverable = {
        _id: milestone._id,
        name: milestone.title || milestone.name,
        description: milestone.description,
        status: milestone.status || 'created',
        target_date: milestone.dueDate,
        start_date: milestone.startDate,
        progress_percentage: milestone.progress || 0,
        project_id: milestone.projectId,
        acceptance_criteria: milestone.acceptance_criteria || [],
        blocking_criteria_met: milestone.blocking_criteria_met || false
      };
    }
    
    res.json({
      success: true,
      data: deliverable
    });
  })
);

/**
 * POST /deliverables
 * Create a new deliverable
 */
router.post('/',
  authenticateToken,
  ErrorHandler.asyncHandler(async (req, res) => {
    // Use standardized orgId utility
    const orgId = await ensureOrgId(req);
    const tenantId = req.tenantId || req.tenant?._id?.toString();
    const { project_id, name, description, start_date, target_date, status, acceptance_criteria } = req.body;
    
    // Validate project exists and belongs to org
    const project = await Project.findOne({
      _id: project_id,
      orgId
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const deliverable = new Deliverable({
      project_id,
      name,
      description,
      start_date: new Date(start_date),
      target_date: new Date(target_date),
      status: status || 'created',
      acceptance_criteria: acceptance_criteria || [],
      orgId,
      tenantId
    });
    
    await deliverable.save();
    
    res.status(201).json({
      success: true,
      data: deliverable,
      message: 'Deliverable created successfully'
    });
  })
);

/**
 * PUT /deliverables/:id
 * Update a deliverable
 */
router.put('/:id',
  authenticateToken,
  ErrorHandler.asyncHandler(async (req, res) => {
    // Use standardized orgId utility
    const orgId = await ensureOrgId(req);
    const tenantId = req.tenantId || req.tenant?._id?.toString();
    
    const deliverable = await Deliverable.findOne({
      _id: req.params.id,
      orgId,
      tenantId
    });
    
    if (!deliverable) {
      return res.status(404).json({
        success: false,
        message: 'Deliverable not found'
      });
    }
    
    const { name, description, start_date, target_date, status, progress_percentage, acceptance_criteria, blocking_criteria_met } = req.body;
    
    if (name) deliverable.name = name;
    if (description !== undefined) deliverable.description = description;
    if (start_date) deliverable.start_date = new Date(start_date);
    if (target_date) deliverable.target_date = new Date(target_date);
    if (status) deliverable.status = status;
    if (progress_percentage !== undefined) deliverable.progress_percentage = progress_percentage;
    if (acceptance_criteria) deliverable.acceptance_criteria = acceptance_criteria;
    if (blocking_criteria_met !== undefined) deliverable.blocking_criteria_met = blocking_criteria_met;
    
    await deliverable.save();
    
    res.json({
      success: true,
      data: deliverable,
      message: 'Deliverable updated successfully'
    });
  })
);

/**
 * DELETE /deliverables/:id
 * Delete a deliverable
 */
router.delete('/:id',
  authenticateToken,
  ErrorHandler.asyncHandler(async (req, res) => {
    // Use standardized orgId utility
    const orgId = await ensureOrgId(req);
    const tenantId = req.tenantId || req.tenant?._id?.toString();
    
    const deliverable = await Deliverable.findOneAndDelete({
      _id: req.params.id,
      orgId,
      tenantId
    });
    
    if (!deliverable) {
      return res.status(404).json({
        success: false,
        message: 'Deliverable not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Deliverable deleted successfully'
    });
  })
);

/**
 * POST /deliverables/:id/validate-date
 * PM validates deliverable date and sets confidence
 */
router.post('/:id/validate-date',
  authenticateToken,
  ErrorHandler.asyncHandler(async (req, res) => {
    // Use standardized orgId utility
    const orgId = await ensureOrgId(req);
    const tenantId = req.tenantId || req.tenant?._id?.toString();
    const { confidence, notes } = req.body;
    
    if (!confidence || confidence < 0 || confidence > 100) {
      return res.status(400).json({
        success: false,
        message: 'Confidence must be between 0 and 100'
      });
    }
    
    // Try Deliverable first, fallback to Milestone
    let deliverable = await Deliverable.findOne({
      _id: req.params.id,
      orgId,
      tenantId
    });
    
    if (!deliverable) {
      deliverable = await Milestone.findOne({
        _id: req.params.id,
        orgId
      });
      
      if (!deliverable) {
        return res.status(404).json({
          success: false,
          message: 'Deliverable not found'
        });
      }
      
      // If using Milestone, we can't use validateDate method
      // Just update the fields directly
      deliverable.last_date_validation = new Date();
      if (!deliverable.validation_history) {
        deliverable.validation_history = [];
      }
      deliverable.validation_history.push({
        validated_at: new Date(),
        validated_by: req.user._id,
        confidence,
        notes: notes || ''
      });
      await deliverable.save();
    } else {
      // Use Deliverable model's validateDate method
      await deliverable.validateDate(req.user._id, confidence, notes);
    }
    
    res.json({
      success: true,
      message: 'Date validated successfully',
      data: deliverable
    });
  })
);

/**
 * GET /deliverables/needing-validation
 * Get deliverables that need date validation (14+ days since last validation)
 */
router.get('/needing-validation',
  authenticateToken,
  ErrorHandler.asyncHandler(async (req, res) => {
    await buildTenantContext(req);
    const { orgId } = req.tenantContext;
    const { daysThreshold = 14 } = req.query;
    
    // Get Deliverables needing validation
    const deliverables = await Deliverable.findNeedingValidation(orgId, parseInt(daysThreshold));
    
    // Also check Milestones (if using Milestones as Deliverables)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - parseInt(daysThreshold));
    
    const milestones = await Milestone.find({
      orgId,
      $or: [
        { last_date_validation: { $lt: thresholdDate } },
        { last_date_validation: { $exists: false } }
      ],
      status: { $in: ['pending', 'in_progress'] }
    }).populate('projectId', 'name');
    
    // Combine and format
    const allItems = [
      ...deliverables.map(d => ({
        ...d.toObject(),
        type: 'deliverable'
      })),
      ...milestones.map(m => ({
        ...m.toObject(),
        type: 'milestone',
        name: m.title,
        target_date: m.dueDate,
        progress_percentage: m.progress
      }))
    ];
    
    res.json({
      success: true,
      data: allItems
    });
  })
);

module.exports = router;
