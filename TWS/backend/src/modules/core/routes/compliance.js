const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth/auth');
const { 
  requireAdminAccess, 
  requirePermission,
  requireResourcePermission 
} = require('../../../middleware/auth/rbac');
const auditService = require('../../../services/compliance/audit.service');
const retentionService = require('../../../services/compliance/retention.service');
const ErrorHandler = require('../../../middleware/common/errorHandler');

/**
 * Compliance & Security Routes
 * Provides endpoints for audit logging, retention management, and compliance reporting
 */

// Get audit logs with filtering
router.get('/audit-logs', 
  authenticateToken,
  requireResourcePermission('audit', 'read'),
  ErrorHandler.asyncHandler(async (req, res) => {
    const {
      type = 'all', // all, moderation, security, admin
      limit = 50,
      offset = 0,
      startDate,
      endDate,
      action,
      userId
    } = req.query;

    let logs;
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      startDate,
      endDate,
      action
    };

    switch (type) {
      case 'moderation':
        logs = await auditService.getModerationLog(req.user.orgId, options);
        break;
      case 'security':
        logs = await auditService.getSecurityLog(req.user.orgId, options);
        break;
      case 'admin':
        logs = await auditService.getAdminLog(req.user.orgId, options);
        break;
      default:
        if (userId) {
          logs = await auditService.getUserAuditLog(userId, req.user.orgId, options);
        } else {
          logs = await auditService.getModerationLog(req.user.orgId, options);
        }
    }

    // Log the audit log access
    await auditService.logAdminEvent(
      auditService.auditActions.AUDIT_EXPORT,
      req.user._id,
      req.user.orgId,
      {
        reason: 'Audit logs accessed',
        details: {
          type,
          limit,
          offset,
          startDate,
          endDate,
          action,
          userId
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    res.json({
      success: true,
      data: logs,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: logs.length
      }
    });
  })
);

// Export audit logs to CSV
router.get('/audit-logs/export', 
  authenticateToken,
  requireResourcePermission('audit', 'export'),
  ErrorHandler.asyncHandler(async (req, res) => {
    const {
      startDate,
      endDate,
      actions,
      format = 'csv'
    } = req.query;

    const options = {
      startDate,
      endDate,
      actions: actions ? actions.split(',') : null,
      format
    };

    const exportData = await auditService.exportAuditLogs(req.user.orgId, options);

    // Log the export action
    await auditService.logAdminEvent(
      auditService.auditActions.AUDIT_EXPORT,
      req.user._id,
      req.user.orgId,
      {
        reason: 'Audit logs exported',
        details: {
          format,
          startDate,
          endDate,
          actions: options.actions
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(exportData);
    } else {
      res.json({
        success: true,
        data: exportData
      });
    }
  })
);

// Get audit statistics
router.get('/audit-logs/statistics', 
  authenticateToken,
  requireResourcePermission('audit', 'read'),
  ErrorHandler.asyncHandler(async (req, res) => {
    const {
      startDate,
      endDate
    } = req.query;

    const options = {
      startDate,
      endDate
    };

    const statistics = await auditService.getAuditStatistics(req.user.orgId, options);

    res.json({
      success: true,
      data: statistics
    });
  })
);

// Get retention policy
router.get('/retention-policy', 
  authenticateToken,
  requireResourcePermission('retention', 'read'),
  ErrorHandler.asyncHandler(async (req, res) => {
    const policy = await retentionService.getRetentionPolicy(req.user.orgId);

    res.json({
      success: true,
      data: policy
    });
  })
);

// Update retention policy
router.put('/retention-policy', 
  authenticateToken,
  requireResourcePermission('retention', 'write'),
  ErrorHandler.asyncHandler(async (req, res) => {
    const { policies } = req.body;

    if (!policies || typeof policies !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid retention policies'
      });
    }

    const result = await retentionService.updateRetentionPolicy(
      req.user.orgId,
      policies,
      req.user._id
    );

    res.json({
      success: true,
      data: result
    });
  })
);

// Get retention statistics
router.get('/retention-statistics', 
  authenticateToken,
  requireResourcePermission('retention', 'read'),
  ErrorHandler.asyncHandler(async (req, res) => {
    const statistics = await retentionService.getRetentionStatistics(req.user.orgId);

    res.json({
      success: true,
      data: statistics
    });
  })
);

// Generate retention report
router.get('/retention-report', 
  authenticateToken,
  requireResourcePermission('retention', 'read'),
  ErrorHandler.asyncHandler(async (req, res) => {
    const {
      includeDetails = false,
      format = 'json'
    } = req.query;

    const options = {
      includeDetails: includeDetails === 'true',
      format
    };

    const report = await retentionService.generateRetentionReport(req.user.orgId, options);

    if (format === 'csv') {
      // Convert report to CSV format
      const csvData = convertRetentionReportToCSV(report);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="retention-report-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
    } else {
      res.json({
        success: true,
        data: report
      });
    }
  })
);

// Enforce retention policy (admin only)
router.post('/retention-policy/enforce', 
  authenticateToken,
  requireAdminAccess(),
  ErrorHandler.asyncHandler(async (req, res) => {
    const result = await retentionService.enforceRetentionPolicy(req.user.orgId);

    res.json({
      success: true,
      data: result
    });
  })
);

// Soft delete expired messages
router.post('/retention-policy/soft-delete', 
  authenticateToken,
  requireAdminAccess(),
  ErrorHandler.asyncHandler(async (req, res) => {
    const result = await retentionService.softDeleteExpiredMessages(req.user.orgId);

    res.json({
      success: true,
      data: result
    });
  })
);

// Purge deleted messages
router.post('/retention-policy/purge', 
  authenticateToken,
  requireAdminAccess(),
  ErrorHandler.asyncHandler(async (req, res) => {
    const result = await retentionService.purgeDeletedMessages(req.user.orgId);

    res.json({
      success: true,
      data: result
    });
  })
);

// Get user audit log
router.get('/users/:userId/audit-logs', 
  authenticateToken,
  requireResourcePermission('audit', 'read'),
  ErrorHandler.asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const {
      limit = 50,
      offset = 0,
      startDate,
      endDate,
      action
    } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      startDate,
      endDate,
      action
    };

    const logs = await auditService.getUserAuditLog(userId, req.user.orgId, options);

    res.json({
      success: true,
      data: logs,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: logs.length
      }
    });
  })
);

// Get compliance dashboard data
router.get('/dashboard', 
  authenticateToken,
  requireResourcePermission('audit', 'read'),
  ErrorHandler.asyncHandler(async (req, res) => {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      endDate = new Date()
    } = req.query;

    // Get audit statistics
    const auditStats = await auditService.getAuditStatistics(req.user.orgId, {
      startDate,
      endDate
    });

    // Get retention statistics
    const retentionStats = await retentionService.getRetentionStatistics(req.user.orgId);

    // Get recent security events
    const securityLogs = await auditService.getSecurityLog(req.user.orgId, {
      limit: 10,
      startDate,
      endDate
    });

    // Get recent moderation events
    const moderationLogs = await auditService.getModerationLog(req.user.orgId, {
      limit: 10,
      startDate,
      endDate
    });

    const dashboard = {
      auditStatistics: auditStats,
      retentionStatistics: retentionStats,
      recentSecurityEvents: securityLogs,
      recentModerationEvents: moderationLogs,
      period: {
        startDate,
        endDate
      }
    };

    res.json({
      success: true,
      data: dashboard
    });
  })
);

// Clean up old audit logs
router.post('/audit-logs/cleanup', 
  authenticateToken,
  requireAdminAccess(),
  ErrorHandler.asyncHandler(async (req, res) => {
    const { retentionDays = 365 } = req.body;

    const deletedCount = await auditService.cleanupOldLogs(req.user.orgId, retentionDays);

    res.json({
      success: true,
      data: {
        deletedCount,
        message: `Cleaned up ${deletedCount} old audit logs`
      }
    });
  })
);

// Helper function to convert retention report to CSV
function convertRetentionReportToCSV(report) {
  const headers = [
    'Generated At',
    'Organization',
    'Total Messages',
    'Active Messages',
    'Deleted Messages',
    'Expired Messages',
    'Expired Deleted Messages',
    'Retention Days',
    'Cutoff Date'
  ];

  const rows = [[
    report.generatedAt.toISOString(),
    report.organization,
    report.statistics.totalMessages,
    report.statistics.activeMessages,
    report.statistics.deletedMessages,
    report.statistics.expiredMessages,
    report.statistics.expiredDeletedMessages,
    report.statistics.retentionDays,
    report.statistics.cutoffDate.toISOString()
  ]];

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}

module.exports = router;
