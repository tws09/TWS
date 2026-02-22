const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken, requireRole } = require('../../../middleware/auth/auth');
const { validateTenantAccess } = require('../../../middleware/tenant/tenantValidation');
const gdprExportService = require('../../../services/compliance/gdpr-data-export.service');
const gdprDeletionService = require('../../../services/compliance/gdpr-data-deletion.service');
const ErrorHandler = require('../../../middleware/common/errorHandler');
// Use standardized orgId helper utility
const { ensureOrgId } = require('../../../utils/orgIdHelper');

/**
 * GDPR Routes for Education ERP
 * Implements GDPR compliance features:
 * - Right to Data Portability (export)
 * - Right to Erasure (deletion/anonymization)
 */

// Export student data (GDPR Right to Data Portability)
router.post('/export/student/:studentId',
  authenticateToken,
  validateTenantAccess,
  requireRole(['principal', 'admin', 'student']),
  ErrorHandler.asyncHandler(async (req, res) => {
    const { tenantSlug, studentId } = req.params;
    // Use standardized orgId utility
    const orgId = await ensureOrgId(req);
    const contextTenantSlug = req.tenantSlug || req.tenantContext?.tenantSlug || tenantSlug;
    
    // Students can only export their own data
    if (req.user.role === 'student' && req.user.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'You can only export your own data'
      });
    }

    const format = req.query.format || 'json'; // json or csv
    
    const data = await gdprExportService.exportStudentData(
      studentId,
      contextTenantSlug || tenantSlug,
      orgId
    );

    if (format === 'csv') {
      const csv = gdprExportService.exportToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="student-data-${studentId}.csv"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      data,
      format: 'json',
      gdprCompliant: true
    });
  })
);

// Export tenant data (for tenant admin)
router.post('/export/tenant',
  authenticateToken,
  validateTenantAccess,
  requireRole(['principal', 'admin']),
  ErrorHandler.asyncHandler(async (req, res) => {
    const { tenantSlug } = req.params;
    // Use standardized orgId utility
    const orgId = await ensureOrgId(req);
    const contextTenantSlug = req.tenantSlug || req.tenantContext?.tenantSlug || tenantSlug;
    
    const data = await gdprExportService.exportTenantData(
      contextTenantSlug || tenantSlug,
      orgId
    );

    res.json({
      success: true,
      data,
      format: 'json',
      gdprCompliant: true
    });
  })
);

// Anonymize student data (GDPR Right to Erasure - soft delete)
router.post('/anonymize/student/:studentId',
  authenticateToken,
  validateTenantAccess,
  requireRole(['principal', 'admin']),
  ErrorHandler.asyncHandler(async (req, res) => {
    const { tenantSlug, studentId } = req.params;
    const { org, tenantSlug: contextTenantSlug } = req.tenantContext || {};
    
    // Check if data can be deleted
    const canDelete = await gdprDeletionService.canDeleteData(studentId);
    if (!canDelete && !req.body.force) {
      return res.status(400).json({
        success: false,
        message: 'Data cannot be deleted yet. Student data must be retained for 7 years after graduation. Use force=true to override.'
      });
    }

    const anonymizedStudent = await gdprDeletionService.anonymizeStudentData(
      studentId,
      contextTenantSlug || tenantSlug,
      org?._id
    );

    res.json({
      success: true,
      message: 'Student data anonymized successfully',
      data: {
        studentId: anonymizedStudent.studentId,
        anonymizedAt: anonymizedStudent.anonymizedAt
      }
    });
  })
);

// Delete student data (GDPR Right to Erasure - hard delete)
router.delete('/student/:studentId',
  authenticateToken,
  validateTenantAccess,
  requireRole(['principal', 'admin']),
  ErrorHandler.asyncHandler(async (req, res) => {
    const { tenantSlug, studentId } = req.params;
    const { org, tenantSlug: contextTenantSlug } = req.tenantContext || {};
    
    // Check if data can be deleted
    const canDelete = await gdprDeletionService.canDeleteData(studentId);
    if (!canDelete && !req.body.force) {
      return res.status(400).json({
        success: false,
        message: 'Data cannot be deleted yet. Student data must be retained for 7 years after graduation. Use force=true to override.'
      });
    }

    await gdprDeletionService.deleteStudentData(
      studentId,
      contextTenantSlug || tenantSlug,
      org?._id
    );

    res.json({
      success: true,
      message: 'Student data deleted successfully'
    });
  })
);

module.exports = router;
