/**
 * Supra Admin - Platform Admin Access Control routes
 */

const { express } = require('./shared');
const router = express.Router();
const {
  requirePlatformPermission,
  PLATFORM_PERMISSIONS,
  Tenant,
  PlatformAdminApproval,
  platformAdminAccessService
} = require('./shared');

router.post('/access/request-approval', requirePlatformPermission(PLATFORM_PERMISSIONS.TENANTS.READ), async (req, res) => {
  try {
    const { tenantId, reason, justification } = req.body;
    if (!tenantId || !reason || !justification) {
      return res.status(400).json({ success: false, message: 'tenantId, reason, and justification are required', code: 'MISSING_REQUIRED_FIELDS' });
    }
    const reasonValidation = platformAdminAccessService.validateAccessReason(reason);
    if (!reasonValidation.valid) {
      return res.status(400).json({ success: false, message: reasonValidation.error, code: reasonValidation.code, allowedReasons: reasonValidation.allowedReasons });
    }
    if (justification.length < 20) {
      return res.status(400).json({ success: false, message: 'Justification must be at least 20 characters', code: 'INVALID_JUSTIFICATION' });
    }
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    const approvalResult = await platformAdminAccessService.createApprovalRequest({
      platformAdminId: req.user._id, platformAdminEmail: req.user.email, platformAdminName: req.user.fullName,
      tenantId: tenant._id, tenantName: tenant.name, reason, justification,
      ipAddress: req.ip || req.connection.remoteAddress, userAgent: req.get('User-Agent'), endpoint: req.path, method: req.method
    });
    if (!approvalResult.success) return res.status(400).json({ success: false, message: approvalResult.error, code: 'APPROVAL_REQUEST_FAILED' });
    res.status(201).json({ success: true, message: 'Approval request created successfully', data: { approval: approvalResult.approval, status: 'pending', message: 'Approval request is pending. You will be notified when it is reviewed.' } });
  } catch (error) {
    console.error('Request approval error:', error);
    res.status(500).json({ success: false, message: 'Failed to create approval request', error: error.message });
  }
});

router.post('/access/approve/:approvalId', requirePlatformPermission(PLATFORM_PERMISSIONS.PLATFORM_USERS.ASSIGN_ROLE), async (req, res) => {
  try {
    const approval = await PlatformAdminApproval.findById(req.params.approvalId);
    if (!approval) return res.status(404).json({ success: false, message: 'Approval request not found' });
    if (approval.status !== 'pending') return res.status(400).json({ success: false, message: `Approval request is already ${approval.status}`, code: 'INVALID_APPROVAL_STATUS' });
    approval.status = 'approved';
    approval.approvedBy = req.user._id;
    approval.approvedAt = new Date();
    approval.accessGranted = true;
    approval.accessGrantedAt = new Date();
    approval.accessExpiresAt = new Date(Date.now() + (60 * 60 * 1000));
    await approval.save();
    res.json({ success: true, message: 'Approval granted successfully', data: { approval, accessExpiresAt: approval.accessExpiresAt } });
  } catch (error) {
    console.error('Approve access error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve access request', error: error.message });
  }
});

router.post('/access/reject/:approvalId', requirePlatformPermission(PLATFORM_PERMISSIONS.PLATFORM_USERS.UPDATE), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason || rejectionReason.length < 10) return res.status(400).json({ success: false, message: 'Rejection reason is required (minimum 10 characters)', code: 'MISSING_REJECTION_REASON' });
    const approval = await PlatformAdminApproval.findById(req.params.approvalId);
    if (!approval) return res.status(404).json({ success: false, message: 'Approval request not found' });
    if (approval.status !== 'pending') return res.status(400).json({ success: false, message: `Approval request is already ${approval.status}`, code: 'INVALID_APPROVAL_STATUS' });
    approval.status = 'rejected';
    approval.rejectedBy = req.user._id;
    approval.rejectedAt = new Date();
    approval.rejectionReason = rejectionReason;
    await approval.save();
    res.json({ success: true, message: 'Approval request rejected', data: { approval } });
  } catch (error) {
    console.error('Reject access error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject access request', error: error.message });
  }
});

router.get('/access/approvals', requirePlatformPermission(PLATFORM_PERMISSIONS.PLATFORM_USERS.READ), async (req, res) => {
  try {
    const { status, tenantId } = req.query;
    const filter = { platformAdminId: req.user._id };
    if (status) filter.status = status;
    if (tenantId) filter.tenantId = tenantId;
    const approvals = await PlatformAdminApproval.find(filter).populate('tenantId', 'name slug').populate('approvedBy', 'fullName email').populate('rejectedBy', 'fullName email').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: approvals });
  } catch (error) {
    console.error('Get approvals error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch approval requests', error: error.message });
  }
});

router.get('/access/pending-approvals', requirePlatformPermission(PLATFORM_PERMISSIONS.PLATFORM_USERS.READ), async (req, res) => {
  try {
    if (req.user.role !== 'platform_super_admin' && req.user.role !== 'platform_admin') {
      return res.status(403).json({ success: false, message: 'Insufficient permissions to view all approval requests', code: 'INSUFFICIENT_PERMISSIONS' });
    }
    const approvals = await PlatformAdminApproval.find({ status: 'pending' }).populate('platformAdminId', 'fullName email').populate('tenantId', 'name slug erpCategory subscription').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: approvals });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending approval requests', error: error.message });
  }
});

router.post('/access/revoke/:approvalId', requirePlatformPermission(PLATFORM_PERMISSIONS.PLATFORM_USERS.UPDATE), async (req, res) => {
  try {
    const { revocationReason } = req.body;
    if (!revocationReason || revocationReason.length < 10) return res.status(400).json({ success: false, message: 'Revocation reason is required (minimum 10 characters)', code: 'MISSING_REVOCATION_REASON' });
    const approval = await PlatformAdminApproval.findById(req.params.approvalId);
    if (!approval) return res.status(404).json({ success: false, message: 'Approval not found' });
    if (approval.status !== 'approved') return res.status(400).json({ success: false, message: `Approval is ${approval.status}, cannot revoke`, code: 'INVALID_APPROVAL_STATUS' });
    await approval.revoke(req.user._id, revocationReason);
    res.json({ success: true, message: 'Approval revoked successfully', data: { approval } });
  } catch (error) {
    console.error('Revoke approval error:', error);
    res.status(500).json({ success: false, message: 'Failed to revoke approval', error: error.message });
  }
});

module.exports = router;
