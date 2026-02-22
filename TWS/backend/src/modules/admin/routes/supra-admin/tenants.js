/**
 * Supra Admin - Tenant Management routes
 */

const { express, body, validationResult } = require('./shared');
const router = express.Router();
const {
  requirePlatformPermission,
  requirePlatformAdminAccessReason,
  PLATFORM_PERMISSIONS,
  Tenant,
  tenantService,
  platformAdminAccessService
} = require('./shared');

// Get all tenants
router.get('/tenants', requirePlatformPermission(PLATFORM_PERMISSIONS.TENANTS.READ), async (req, res) => {
  try {
    const { page = 1, limit = 100, status, search, includeCancelled } = req.query;
    const filter = {};
    if (status) filter.status = status;
    else if (includeCancelled !== 'true' && includeCancelled !== true) filter.status = { $ne: 'cancelled' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } }
      ];
    }
    const tenants = await Tenant.find(filter).populate('createdBy', 'fullName email').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await Tenant.countDocuments(filter);
    const totalIncludingCancelled = await Tenant.countDocuments({});
    res.json({
      tenants,
      pagination: { current: page, pages: Math.ceil(total / limit), total },
      summary: {
        total,
        totalIncludingCancelled,
        active: await Tenant.countDocuments({ ...filter, status: 'active' }),
        suspended: await Tenant.countDocuments({ ...filter, status: 'suspended' }),
        trialing: await Tenant.countDocuments({ ...filter, status: 'trialing' }),
        cancelled: totalIncludingCancelled - total
      }
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({ message: 'Failed to fetch tenants', error: error.message });
  }
});

router.get('/tenants/:id', requirePlatformAdminAccessReason(), async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('createdBy', 'fullName email').populate('supportNotes.createdBy', 'fullName');
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    const usage = await tenantService.getTenantUsage(req.params.id);
    res.json({ tenant, usage });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ message: 'Failed to fetch tenant' });
  }
});

router.put('/tenants/:id', requirePlatformAdminAccessReason(), async (req, res) => {
  try {
    const tenant = await tenantService.updateTenant(req.params.id, req.body, req.user._id);
    await platformAdminAccessService.logPlatformAdminAccess({
      platformAdminId: req.user._id, platformAdminEmail: req.user.email, platformAdminName: req.user.fullName,
      tenantId: req.params.id, tenantName: tenant.name,
      reason: req.body.accessReason || req.headers['x-access-reason'] || 'tenant_update',
      ipAddress: req.ip || req.connection.remoteAddress, userAgent: req.get('User-Agent'), endpoint: req.path, method: req.method
    });
    res.json(tenant);
  } catch (error) {
    console.error('Update tenant error:', error);
    const msg = error.message || 'Failed to update tenant';
    if (msg.includes('slug cannot be changed') || msg.includes('immutable')) {
      return res.status(400).json({ message: msg, code: 'SLUG_IMMUTABLE' });
    }
    if (msg.includes('not found')) return res.status(404).json({ message: msg });
    res.status(500).json({ message: 'Failed to update tenant' });
  }
});

router.put('/tenants/:id/status', requirePlatformAdminAccessReason(), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'cancelled', 'trialing'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const updatedBy = req.user?._id || req.twsAdmin?._id || 'system';
    const tenant = await tenantService.updateTenantStatus(req.params.id, status, updatedBy);
    await platformAdminAccessService.logPlatformAdminAccess({
      platformAdminId: req.user._id, platformAdminEmail: req.user.email, platformAdminName: req.user.fullName,
      tenantId: req.params.id, tenantName: tenant.name,
      reason: req.body.accessReason || req.headers['x-access-reason'] || 'tenant_status_change',
      ipAddress: req.ip || req.connection.remoteAddress, userAgent: req.get('User-Agent'), endpoint: req.path, method: req.method
    });
    res.json({ success: true, data: tenant, message: 'Tenant status updated successfully' });
  } catch (error) {
    console.error('Update tenant status error:', error);
    res.status(500).json({ message: 'Failed to update tenant status', error: error.message });
  }
});

router.delete('/tenants/cancelled', requirePlatformAdminAccessReason(), async (req, res) => {
  try {
    const cancelledTenants = await Tenant.find({ status: 'cancelled' }).select('_id name slug');
    if (!cancelledTenants || cancelledTenants.length === 0) return res.json({ success: true, message: 'No cancelled tenants found to delete', data: { deleted: [], failed: [], total: 0 } });
    const justification = req.body.justification || req.headers['x-justification'];
    if (!justification || justification.length < 50) return res.status(400).json({ success: false, message: 'Justification is required (minimum 50 characters)', code: 'JUSTIFICATION_REQUIRED', cancelledTenantsCount: cancelledTenants.length });
    const tenantIds = cancelledTenants.map(t => t._id.toString());
    const deletedBy = req.user?._id || req.twsAdmin?._id || 'system';
    const results = await tenantService.deleteTenantsBulk(tenantIds, deletedBy);
    for (const tenantId of results.deleted) {
      const tenant = cancelledTenants.find(t => t._id.toString() === tenantId);
      await platformAdminAccessService.logPlatformAdminAccess({
        platformAdminId: req.user._id, platformAdminEmail: req.user.email, platformAdminName: req.user.fullName,
        tenantId, tenantName: tenant?.name || 'Unknown',
        reason: req.body.accessReason || req.headers['x-access-reason'] || 'bulk_delete_cancelled_tenants',
        ipAddress: req.ip || req.connection.remoteAddress, userAgent: req.get('User-Agent'), endpoint: req.path, method: req.method
      });
    }
    const allOk = results.failed.length === 0;
    res.status(allOk ? 200 : 207).json({ success: allOk, message: allOk ? `${results.deleted.length} cancelled tenant(s) permanently deleted` : `Deleted ${results.deleted.length}; ${results.failed.length} failed`, data: { ...results, totalCancelled: cancelledTenants.length, deletedCount: results.deleted.length, failedCount: results.failed.length } });
  } catch (error) {
    console.error('Delete cancelled tenants error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete cancelled tenants', error: error.message });
  }
});

router.delete('/tenants/bulk', requirePlatformAdminAccessReason(), async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, message: 'Request body must include an array of tenant ids' });
    const justification = req.body.justification || req.headers['x-justification'];
    if (!justification || justification.length < 50) return res.status(400).json({ success: false, message: 'Justification is required (minimum 50 characters)', code: 'JUSTIFICATION_REQUIRED' });
    const deletedBy = req.user?._id || req.twsAdmin?._id || 'system';
    const results = await tenantService.deleteTenantsBulk(ids, deletedBy);
    for (const tenantId of results.deleted) {
      await platformAdminAccessService.logPlatformAdminAccess({
        platformAdminId: req.user._id, platformAdminEmail: req.user.email, platformAdminName: req.user.fullName,
        tenantId, tenantName: 'Bulk Delete',
        reason: req.body.accessReason || req.headers['x-access-reason'] || 'bulk_tenant_deletion',
        ipAddress: req.ip || req.connection.remoteAddress, userAgent: req.get('User-Agent'), endpoint: req.path, method: req.method
      });
    }
    const allOk = results.failed.length === 0;
    res.status(allOk ? 200 : 207).json({ success: allOk, message: allOk ? `${results.deleted.length} tenant(s) deleted successfully` : `Deleted ${results.deleted.length}; ${results.failed.length} failed`, data: results });
  } catch (error) {
    console.error('Bulk delete tenants error:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk delete tenants', error: error.message });
  }
});

router.delete('/tenants/:id', requirePlatformAdminAccessReason(), async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    const justification = req.body.justification || req.headers['x-justification'];
    if (!justification || justification.length < 30) return res.status(400).json({ success: false, message: 'Justification is required (minimum 30 characters)', code: 'JUSTIFICATION_REQUIRED' });
    const deletedBy = req.user?._id || req.twsAdmin?._id || 'system';
    await platformAdminAccessService.logPlatformAdminAccess({
      platformAdminId: req.user._id, platformAdminEmail: req.user.email, platformAdminName: req.user.fullName,
      tenantId: req.params.id, tenantName: tenant.name,
      reason: req.body.accessReason || req.headers['x-access-reason'] || 'tenant_deletion',
      ipAddress: req.ip || req.connection.remoteAddress, userAgent: req.get('User-Agent'), endpoint: req.path, method: req.method
    });
    await tenantService.deleteTenant(req.params.id, deletedBy, true);
    res.json({ success: true, message: 'Tenant and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete tenant', error: error.message });
  }
});

router.put('/tenants/:id/password', [body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')], requirePlatformAdminAccessReason(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    const justification = req.body.justification || req.headers['x-justification'];
    if (!justification || justification.length < 20) return res.status(400).json({ success: false, message: 'Justification is required (minimum 20 characters)', code: 'JUSTIFICATION_REQUIRED' });
    await tenantService.changeTenantOwnerPassword(req.params.id, req.body.newPassword, req.user._id);
    await platformAdminAccessService.logPlatformAdminAccess({
      platformAdminId: req.user._id, platformAdminEmail: req.user.email, platformAdminName: req.user.fullName,
      tenantId: req.params.id, tenantName: tenant.name,
      reason: req.body.accessReason || req.headers['x-access-reason'] || 'password_reset',
      ipAddress: req.ip || req.connection.remoteAddress, userAgent: req.get('User-Agent'), endpoint: req.path, method: req.method
    });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

module.exports = router;
