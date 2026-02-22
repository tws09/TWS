const express = require('express');
const router = express.Router();
const Approval = require('../../../models/Approval');
const Milestone = require('../../../models/Milestone');
const Deliverable = require('../../../models/Deliverable');
const User = require('../../../models/User');
const Project = require('../../../models/Project');
const { authenticateToken } = require('../../../middleware/auth/auth');
const ErrorHandler = require('../../../middleware/common/errorHandler');
const NotificationService = require('../../../services/notifications/notification.service');
// Use standardized orgId helper utility
const { ensureOrgId, getTenantFilter } = require('../../../utils/orgIdHelper');

/**
 * GET /approvals/deliverable/:deliverableId
 * Get all approvals for a deliverable
 */
router.get('/deliverable/:deliverableId', 
  authenticateToken,
  ErrorHandler.asyncHandler(async (req, res) => {
    // Use standardized orgId utility
    const orgId = await ensureOrgId(req);
    const tenantId = req.tenantId || req.tenant?._id?.toString();
    
    const approvals = await Approval.find({ 
      deliverable_id: req.params.deliverableId,
      orgId,
      tenantId
    }).sort({ step_number: 1 });
    
    res.json({
      success: true,
      data: approvals
    });
  })
);

/**
 * POST /approvals/:approvalId/approve
 * Approve a step in the approval chain
 */
router.post('/:approvalId/approve',
  authenticateToken,
  ErrorHandler.asyncHandler(async (req, res) => {
    // Use standardized orgId utility
    const orgId = await ensureOrgId(req);
    const tenantId = req.tenantId || req.tenant?._id?.toString();
    const { notes } = req.body;
    
    const approval = await Approval.findOne({
      _id: req.params.approvalId,
      orgId,
      tenantId
    });
    
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: 'Approval not found'
      });
    }
    
    // Check if previous step is approved
    if (approval.step_number > 1) {
      const previousApproved = await Approval.isPreviousStepApproved(
        approval.deliverable_id,
        approval.step_number
      );
      
      if (!previousApproved) {
        return res.status(400).json({
          success: false,
          message: 'Previous step must be approved first'
        });
      }
    }
    
    // Approve the step
    await approval.approve(notes);
    
    // Check if all internal steps are approved (for client step)
    if (approval.step_number === 3) { // After security approval
      const allInternalApproved = await Approval.areAllInternalStepsApproved(
        approval.deliverable_id
      );
      
      if (allInternalApproved) {
        // Enable client approval step
        const clientApproval = await Approval.findOne({
          deliverable_id: approval.deliverable_id,
          step_number: 4
        });
        
        if (clientApproval) {
          clientApproval.can_proceed = true;
          await clientApproval.save();
        }
        
        // Update deliverable status to ready_approval
        let deliverable = await Deliverable.findById(approval.deliverable_id);
        if (!deliverable) {
          deliverable = await Milestone.findById(approval.deliverable_id);
        }
        
        if (deliverable) {
          deliverable.status = 'ready_approval';
          await deliverable.save();
        }
      }
    }
    
    // Check if all steps are approved
    const allApprovals = await Approval.getApprovalsForDeliverable(approval.deliverable_id);
    const allApproved = allApprovals.every(a => a.status === 'approved');
    
    if (allApproved) {
      // Update deliverable status to approved
      let deliverable = await Deliverable.findById(approval.deliverable_id);
      if (!deliverable) {
        deliverable = await Milestone.findById(approval.deliverable_id);
      }
      
      if (deliverable) {
        deliverable.status = 'approved';
        await deliverable.save();
      }
      
      // Send in-app notification to PM
      try {
        const project = await Project.findById(deliverable.project_id);
        if (project && project.ownerId) {
          await NotificationService.createNotification({
            userIds: [project.ownerId],
            type: 'approval_approved',
            title: 'Deliverable Approved',
            message: `All approvals received for deliverable "${deliverable.name}"`,
            relatedEntityType: 'deliverable',
            relatedEntityId: deliverable._id,
            createdBy: req.user._id
          });
        }
      } catch (error) {
        console.error('In-app notification failed:', error);
      }
    } else {
      // Notify next approver (in-app notification)
      try {
        const nextApproval = allApprovals.find(a => 
          a.step_number === approval.step_number + 1 && a.status === 'pending'
        );
        
        if (nextApproval) {
          let nextApproverId = null;
          
          // Resolve approver ID (userId for internal, email lookup for client)
          if (nextApproval.approver_type === 'client') {
            const clientUser = await User.findOne({ email: nextApproval.approver_id, orgId: orgId });
            if (clientUser) {
              nextApproverId = clientUser._id;
            }
          } else {
            // Internal approver - approver_id is userId
            nextApproverId = nextApproval.approver_id;
          }
          
          if (nextApproverId) {
            const deliverable = await Deliverable.findById(approval.deliverable_id);
            await NotificationService.createNotification({
              userIds: [nextApproverId],
              type: 'approval_requested',
              title: 'Approval Required',
              message: `Deliverable "${deliverable?.name || 'Deliverable'}" requires your approval (Step ${nextApproval.step_number})`,
              relatedEntityType: 'approval',
              relatedEntityId: nextApproval._id,
              createdBy: req.user._id
            });
          }
        }
      } catch (error) {
        console.error('In-app notification failed:', error);
      }
    }
    
    res.json({
      success: true,
      message: 'Approval step completed',
      data: approval
    });
  })
);

/**
 * POST /approvals/:approvalId/reject
 * Reject a step in the approval chain
 */
router.post('/:approvalId/reject',
  authenticateToken,
  ErrorHandler.asyncHandler(async (req, res) => {
    // Use standardized orgId utility
    const orgId = await ensureOrgId(req);
    const tenantId = req.tenantId || req.tenant?._id?.toString();
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const approval = await Approval.findOne({
      _id: req.params.approvalId,
      orgId,
      tenantId
    });
    
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: 'Approval not found'
      });
    }
    
    // Reject the step (this will reset subsequent approvals)
    await approval.reject(reason);
    
    // Update deliverable status to in_rework
    let deliverable = await Deliverable.findById(approval.deliverable_id);
    if (!deliverable) {
      deliverable = await Milestone.findById(approval.deliverable_id);
    }
    
    if (deliverable) {
      deliverable.status = 'in_rework';
      await deliverable.save();
    }
    
    // Send in-app notification to PM
    try {
      const deliverable = await Deliverable.findById(approval.deliverable_id);
      if (deliverable) {
        const project = await Project.findById(deliverable.project_id);
        if (project && project.ownerId) {
          await NotificationService.createNotification({
            userIds: [project.ownerId],
            type: 'approval_rejected',
            title: 'Approval Rejected',
            message: `Step ${approval.step_number} approval rejected for deliverable "${deliverable.name}". Reason: ${reason}`,
            relatedEntityType: 'approval',
            relatedEntityId: approval._id,
            createdBy: req.user._id
          });
        }
      }
    } catch (error) {
      console.error('In-app notification failed:', error);
    }
    
    res.json({
      success: true,
      message: 'Approval rejected, deliverable moved to rework',
      data: approval
    });
  })
);

/**
 * POST /approvals/deliverable/:deliverableId/create-chain
 * Create approval chain for a deliverable
 */
router.post('/deliverable/:deliverableId/create-chain',
  authenticateToken,
  ErrorHandler.asyncHandler(async (req, res) => {
    // Use standardized orgId utility
    const orgId = await ensureOrgId(req);
    const tenantId = req.tenantId || req.tenant?._id?.toString();
    const { devLeadId, qaLeadId, securityId, clientEmail } = req.body;
    
    // Check if approval chain already exists
    const existingApprovals = await Approval.find({
      deliverable_id: req.params.deliverableId
    });
    
    if (existingApprovals.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Approval chain already exists for this deliverable'
      });
    }
    
    // Get deliverable for workspaceId
    const deliverable = await Deliverable.findById(req.params.deliverableId);
    if (!deliverable) {
      return res.status(404).json({
        success: false,
        message: 'Deliverable not found'
      });
    }
    
    // Create approval chain
    const approvals = await Approval.createApprovalChain(
      req.params.deliverableId,
      orgId,
      tenantId,
      deliverable.workspaceId,
      {
        devLeadId,
        qaLeadId,
        securityId,
        clientEmail
      }
    );
    
    // Notify first approver (Step 1 - Dev Lead) - in-app notification
    try {
      const firstApproval = approvals.find(a => a.step_number === 1);
      if (firstApproval && devLeadId) {
        await NotificationService.createNotification({
          userIds: [devLeadId],
          type: 'approval_requested',
          title: 'Approval Required',
          message: `Deliverable "${deliverable.name}" requires your approval (Step 1: Dev Lead)`,
          relatedEntityType: 'approval',
          relatedEntityId: firstApproval._id,
          createdBy: req.user._id
        });
      }
    } catch (error) {
      console.error('In-app notification failed:', error);
    }
    
    res.json({
      success: true,
      message: 'Approval chain created',
      data: approvals
    });
  })
);

module.exports = router;
