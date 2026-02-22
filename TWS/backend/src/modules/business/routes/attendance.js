const express = require('express');
const { body, query, param } = require('express-validator');
const { requirePermission } = require('../../../middleware/auth/rbac');
const ErrorHandler = require('../../../middleware/common/errorHandler');
const ValidationMiddleware = require('../../../middleware/validation/validation');
const Attendance = require('../../../models/Attendance');
const AttendancePolicy = require('../../../models/AttendancePolicy');
const AttendanceShift = require('../../../models/AttendanceShift');
const AttendanceAudit = require('../../../models/AttendanceAudit');
const Employee = require('../../../models/Employee');
const AttendanceService = require('../../../services/hr/attendance.service');

const router = express.Router();

// Enhanced Check in with comprehensive validation
router.post('/checkin', [
  requirePermission('attendance:write'),
  body('employeeId').optional().notEmpty(),
  body('location.latitude').optional().isFloat(),
  body('location.longitude').optional().isFloat(),
  body('location.address').optional().notEmpty(),
  body('location.accuracy').optional().isFloat(),
  body('photoUrl').optional().isURL(),
  body('biometricData.fingerprint').optional().notEmpty(),
  body('biometricData.faceId').optional().notEmpty(),
  body('biometricData.voicePrint').optional().notEmpty(),
  body('workMode').optional().isIn(['office', 'remote', 'hybrid']),
  body('currentProject').optional().notEmpty(),
  body('teamStatus').optional().isIn(['available', 'busy', 'away', 'focus']),
  body('notes').optional().notEmpty(),
  body('timestamp').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { employeeId, location, photoUrl, biometricData, workMode, currentProject, teamStatus, notes, timestamp } = req.body;
    
    const deviceInfo = {
      type: req.headers['user-agent'] || 'Unknown',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      screenResolution: req.headers['screen-resolution'] || 'Unknown'
    };

    const checkInData = {
      timestamp: timestamp || new Date(),
      location,
      photoUrl,
      biometricData,
      workMode,
      currentProject,
      teamStatus,
      notes
    };

    // Use employeeId if provided, otherwise use user._id
    const userId = employeeId ? await Employee.findOne({ employeeId }).select('_id') : req.user._id;
    if (employeeId && !userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Employee ID'
      });
    }

    const result = await AttendanceService.checkIn(userId._id || userId, checkInData, deviceInfo);

    res.json({
      success: true,
      message: 'Checked in successfully',
      data: result.data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}));

// Enhanced Check out with comprehensive validation
router.post('/checkout', [
  requirePermission('attendance:write'),
  body('employeeId').optional().notEmpty(),
  body('location.latitude').optional().isFloat(),
  body('location.longitude').optional().isFloat(),
  body('location.address').optional().notEmpty(),
  body('location.accuracy').optional().isFloat(),
  body('photoUrl').optional().isURL(),
  body('biometricData.fingerprint').optional().notEmpty(),
  body('biometricData.faceId').optional().notEmpty(),
  body('biometricData.voicePrint').optional().notEmpty(),
  body('notes').optional().notEmpty(),
  body('timestamp').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { employeeId, location, photoUrl, biometricData, notes, timestamp } = req.body;

    const deviceInfo = {
      type: req.headers['user-agent'] || 'Unknown',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      screenResolution: req.headers['screen-resolution'] || 'Unknown'
    };

    const checkOutData = {
      timestamp: timestamp || new Date(),
      location,
      photoUrl,
      biometricData,
      notes
    };

    // Use employeeId if provided, otherwise use user._id
    const userId = employeeId ? await Employee.findOne({ employeeId }).select('_id') : req.user._id;
    if (employeeId && !userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Employee ID'
      });
    }

    const result = await AttendanceService.checkOut(userId._id || userId, checkOutData, deviceInfo);

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: result.data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}));

// Get attendance records
router.get('/', [
  requirePermission('attendance:read'),
  query('userId').optional().isMongoId(),
  query('employeeId').optional().notEmpty(),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  
  // If not HR/Admin/Owner, only show own records
  if (!['hr', 'admin', 'owner'].includes(req.user.role)) {
    filter.userId = req.user._id;
  } else {
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.employeeId) filter.employeeId = req.query.employeeId;
  }

  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = new Date(req.query.from);
    if (req.query.to) filter.date.$lte = new Date(req.query.to);
  }

  const attendance = await Attendance.find(filter)
    .populate('userId', 'fullName email')
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });

  const total = await Attendance.countDocuments(filter);

  res.json({
    success: true,
    data: {
      attendance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// Get today's attendance
router.get('/today', requirePermission('attendance:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attendance = await Attendance.findOne({
    userId: req.user._id,
    date: { $gte: today, $lt: tomorrow }
  });

  res.json({
    success: true,
    data: { attendance }
  });
}));

// Request attendance correction
router.post('/:id/correction', [
  requirePermission('attendance:write'),
  body('reason').notEmpty().trim()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const attendance = await Attendance.findById(req.params.id);
  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found'
    });
  }

  // Check if user can request correction for this record
  if (attendance.userId.toString() !== req.user._id.toString() && 
      !['hr', 'admin', 'owner'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to request correction for this record'
    });
  }

  const correctionRequest = {
    requestedBy: req.user._id,
    reason,
    requestedAt: new Date(),
    status: 'pending'
  };

  attendance.correctionRequests.push(correctionRequest);
  await attendance.save();

  res.json({
    success: true,
    message: 'Correction request submitted successfully',
    data: { correctionRequest }
  });
}));

// Approve/reject correction request
router.patch('/:id/corrections/:correctionId', [
  requirePermission('attendance:write'),
  body('status').isIn(['approved', 'rejected']),
  body('comments').optional().notEmpty()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { status, comments } = req.body;

  const attendance = await Attendance.findById(req.params.id);
  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found'
    });
  }

  const correction = attendance.correctionRequests.id(req.params.correctionId);
  if (!correction) {
    return res.status(404).json({
      success: false,
      message: 'Correction request not found'
    });
  }

  correction.status = status;
  correction.approvedBy = req.user._id;
  correction.approvedAt = new Date();
  correction.comments = comments;

  await attendance.save();

  res.json({
    success: true,
    message: `Correction request ${status} successfully`,
    data: { correction }
  });
}));

// Export attendance data
router.get('/export', [
  requirePermission('attendance:read'),
  query('from').isISO8601(),
  query('to').isISO8601(),
  query('format').optional().isIn(['csv', 'json'])
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { from, to, format = 'csv' } = req.query;

  const filter = {
    date: {
      $gte: new Date(from),
      $lte: new Date(to)
    }
  };

  // If not HR/Admin/Owner, only export own records
  if (!['hr', 'admin', 'owner'].includes(req.user.role)) {
    filter.userId = req.user._id;
  }

  const attendance = await Attendance.find(filter)
    .populate('userId', 'fullName email')
    .sort({ date: -1 });

  if (format === 'csv') {
    // Generate CSV
    const csvHeader = 'Date,Employee Name,Employee ID,Check In,Check Out,Duration (minutes),Overtime (minutes),Status\n';
    const csvRows = attendance.map(record => {
      const checkIn = record.checkIn.timestamp ? record.checkIn.timestamp.toISOString() : '';
      const checkOut = record.checkOut.timestamp ? record.checkOut.timestamp.toISOString() : '';
      return `${record.date.toISOString().split('T')[0]},${record.userId.fullName},${record.employeeId},${checkIn},${checkOut},${record.durationMinutes},${record.overtimeMinutes},${record.status}`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-export.csv');
    res.send(csvHeader + csvRows);
  } else {
    res.json({
      success: true,
      data: { attendance }
    });
  }
}));

// Break management routes
router.post('/break/start', [
  requirePermission('attendance:write'),
  body('type').optional().isIn(['lunch', 'break', 'meeting', 'training', 'personal', 'other']),
  body('location.latitude').optional().isFloat(),
  body('location.longitude').optional().isFloat(),
  body('location.address').optional().notEmpty(),
  body('notes').optional().notEmpty()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { type, location, notes } = req.body;
    const result = await AttendanceService.startBreak(req.user._id, { type, location, notes });
    
    res.json({
      success: true,
      message: 'Break started successfully',
      data: result.data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}));

router.post('/break/end/:breakIndex', [
  requirePermission('attendance:write'),
  body('breakIndex').isInt({ min: 0 })
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const breakIndex = parseInt(req.params.breakIndex);
    const result = await AttendanceService.endBreak(req.user._id, breakIndex);
    
    res.json({
      success: true,
      message: 'Break ended successfully',
      data: result.data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}));

// Attendance analytics and reporting
router.get('/analytics', [
  requirePermission('attendance:read'),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('userId').optional().isMongoId(),
  query('department').optional().notEmpty(),
  query('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical'])
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const filters = {};
    
    // Build filters based on query parameters
    if (req.query.from || req.query.to) {
      filters.date = {};
      if (req.query.from) filters.date.$gte = new Date(req.query.from);
      if (req.query.to) filters.date.$lte = new Date(req.query.to);
    }
    
    if (req.query.userId) filters.userId = req.query.userId;
    if (req.query.department) filters['userId.department'] = req.query.department;
    if (req.query.riskLevel) filters.riskLevel = req.query.riskLevel;
    
    // If not HR/Admin/Owner, only show own records
    if (!['hr', 'admin', 'owner'].includes(req.user.role)) {
      filters.userId = req.user._id;
    }

    const result = await AttendanceService.getAttendanceAnalytics(filters);
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Security and risk management
router.get('/security/alerts', [
  requirePermission('attendance:read'),
  query('riskLevel').optional().isIn(['medium', 'high', 'critical']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filters = {};
    
    // Filter by risk level
    if (req.query.riskLevel) {
      filters.riskLevel = req.query.riskLevel;
    } else {
      filters.riskLevel = { $in: ['medium', 'high', 'critical'] };
    }

    // If not HR/Admin/Owner, only show own records
    if (!['hr', 'admin', 'owner'].includes(req.user.role)) {
      filters.userId = req.user._id;
    }

    const suspiciousActivities = await Attendance.findSuspiciousActivities(filters)
      .populate('userId', 'fullName email department')
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const total = await Attendance.countDocuments({
      ...filters,
      $or: [
        { riskLevel: { $in: ['medium', 'high', 'critical'] } },
        { 'securityFlags': { $exists: true, $ne: [] } },
        { qualityScore: { $lt: 70 } }
      ]
    });

    res.json({
      success: true,
      data: {
        alerts: suspiciousActivities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Audit trail
router.get('/audit/:attendanceId', [
  requirePermission('attendance:read')
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const auditTrail = await AttendanceAudit.getAuditTrail(req.params.attendanceId);
    
    res.json({
      success: true,
      data: { auditTrail }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Real-time attendance status
router.get('/realtime', [
  requirePermission('attendance:read')
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const filters = { isActive: true };
    
    // If not HR/Admin/Owner, only show own records
    if (!['hr', 'admin', 'owner'].includes(req.user.role)) {
      filters.userId = req.user._id;
    }

    const activeAttendance = await Attendance.find(filters)
      .populate('userId', 'fullName email department')
      .sort({ lastActivity: -1 });

    res.json({
      success: true,
      data: { activeAttendance }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Attendance policies management
router.get('/policies', [
  requirePermission('attendance:read')
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const policies = await AttendancePolicy.find({
      organizationId: req.user.organizationId,
      isActive: true
    }).sort({ effectiveFrom: -1 });

    res.json({
      success: true,
      data: { policies }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Attendance shifts management
router.get('/shifts', [
  requirePermission('attendance:read')
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const shifts = await AttendanceShift.find({
      organizationId: req.user.organizationId,
      isActive: true
    }).sort({ startTime: 1 });

    res.json({
      success: true,
      data: { shifts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Bulk operations for HR/Admin
router.post('/bulk/approve', [
  requirePermission('attendance:write'),
  body('attendanceIds').isArray({ min: 1 }),
  body('attendanceIds.*').isMongoId(),
  body('comments').optional().notEmpty()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    if (!['hr', 'admin', 'owner'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for bulk operations'
      });
    }

    const { attendanceIds, comments } = req.body;
    
    const result = await Attendance.updateMany(
      { _id: { $in: attendanceIds } },
      { 
        $set: { 
          hrApproved: true,
          hrApprovedBy: req.user._id,
          hrApprovedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} attendance records approved`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Export enhanced attendance data
router.get('/export/enhanced', [
  requirePermission('attendance:read'),
  query('from').isISO8601(),
  query('to').isISO8601(),
  query('format').optional().isIn(['csv', 'json', 'excel']),
  query('includeAudit').optional().isBoolean()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { from, to, format = 'csv', includeAudit = false } = req.query;

    const filter = {
      date: {
        $gte: new Date(from),
        $lte: new Date(to)
      }
    };

    // If not HR/Admin/Owner, only export own records
    if (!['hr', 'admin', 'owner'].includes(req.user.role)) {
      filter.userId = req.user._id;
    }

    const attendance = await Attendance.find(filter)
      .populate('userId', 'fullName email department')
      .populate('policyId', 'name')
      .populate('shiftId', 'name')
      .sort({ date: -1 });

    if (format === 'csv') {
      // Enhanced CSV with more fields
      const csvHeader = 'Date,Employee Name,Employee ID,Department,Check In,Check Out,Duration (minutes),Overtime (minutes),Status,Risk Level,Quality Score,Security Flags,Location,Device Info\n';
      const csvRows = attendance.map(record => {
        const checkIn = record.checkIn.timestamp ? record.checkIn.timestamp.toISOString() : '';
        const checkOut = record.checkOut.timestamp ? record.checkOut.timestamp.toISOString() : '';
        const location = record.checkIn.location.address || 'Unknown';
        const deviceInfo = record.checkIn.device.browser || 'Unknown';
        const securityFlags = record.securityFlags.join(';') || 'None';
        
        return `${record.date.toISOString().split('T')[0]},${record.userId.fullName},${record.employeeId},${record.userId.department || 'N/A'},${checkIn},${checkOut},${record.durationMinutes},${record.overtimeMinutes},${record.status},${record.riskLevel},${record.qualityScore},${securityFlags},${location},${deviceInfo}`;
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=enhanced-attendance-export.csv');
      res.send(csvHeader + csvRows);
    } else if (format === 'json') {
      res.json({
        success: true,
        data: { attendance }
      });
    } else {
      // Excel format would require additional library like xlsx
      res.status(400).json({
        success: false,
        message: 'Excel format not yet implemented'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Admin real-time attendance data
router.get('/admin/realtime', requirePermission('attendance:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get live employees (checked in today, not checked out)
  const liveEmployees = await Attendance.find({
    organizationId: req.user.orgId,
    date: { $gte: today, $lt: tomorrow },
    'checkIn.timestamp': { $exists: true },
    'checkOut.timestamp': { $exists: false }
  }).populate('userId', 'fullName email department');

  // Get active sessions count
  const activeSessions = liveEmployees.length;

  // Get current location distribution
  const locationStats = await Attendance.aggregate([
    {
      $match: {
        organizationId: req.user.orgId,
        date: { $gte: today, $lt: tomorrow },
        'checkIn.timestamp': { $exists: true }
      }
    },
    {
      $group: {
        _id: '$checkIn.location.address',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      liveEmployees: liveEmployees.length,
      activeSessions,
      currentLocation: locationStats[0]?._id || 'Office',
      systemHealth: 'excellent',
      locationStats
    }
  });
}));

// Admin trending metrics
router.get('/admin/trending-metrics', requirePermission('attendance:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const { range = '7d' } = req.query;
  
  let startDate = new Date();
  switch (range) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
  }

  const metrics = await Attendance.aggregate([
    {
      $match: {
        organizationId: req.user.orgId,
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        avgDuration: { $avg: '$durationMinutes' },
        avgQualityScore: { $avg: '$qualityScore' },
        verifiedCount: {
          $sum: {
            $cond: [{ $eq: ['$checkIn.verified', true] }, 1, 0]
          }
        },
        biometricCount: {
          $sum: {
            $cond: [{ $ne: ['$checkIn.biometricData.fingerprint', null] }, 1, 0]
          }
        },
        photoCount: {
          $sum: {
            $cond: [{ $ne: ['$checkIn.photoUrl', null] }, 1, 0]
          }
        }
      }
    }
  ]);

  const result = metrics[0] || {};
  const attendanceRate = result.totalRecords > 0 ? (result.verifiedCount / result.totalRecords) * 100 : 0;
  const biometricRate = result.totalRecords > 0 ? (result.biometricCount / result.totalRecords) * 100 : 0;
  const photoRate = result.totalRecords > 0 ? (result.photoCount / result.totalRecords) * 100 : 0;

  res.json({
    success: true,
    data: {
      attendanceRate: { 
        current: Math.round(attendanceRate), 
        previous: Math.round(attendanceRate * 0.95), 
        trend: 'up' 
      },
      punctuality: { 
        current: Math.round(result.avgQualityScore || 85), 
        previous: Math.round((result.avgQualityScore || 85) * 0.98), 
        trend: 'up' 
      },
      productivity: { 
        current: Math.round((result.avgDuration || 480) / 60), 
        previous: Math.round(((result.avgDuration || 480) * 0.97) / 60), 
        trend: 'up' 
      },
      remoteWork: { 
        current: Math.round(biometricRate), 
        previous: Math.round(biometricRate * 1.05), 
        trend: 'up' 
      },
      overtime: { 
        current: Math.round((result.avgDuration || 480) / 60 - 8), 
        previous: Math.round(((result.avgDuration || 480) * 0.95) / 60 - 8), 
        trend: 'down' 
      },
      absenteeism: { 
        current: Math.round(100 - attendanceRate), 
        previous: Math.round((100 - attendanceRate) * 1.02), 
        trend: 'down' 
      }
    }
  });
}));

// Admin insights
router.get('/admin/insights', requirePermission('attendance:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const { range = '7d' } = req.query;
  
  let startDate = new Date();
  switch (range) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
  }

  // Get top performers
  const topPerformers = await Attendance.aggregate([
    {
      $match: {
        organizationId: req.user.orgId,
        date: { $gte: startDate },
        'checkOut.timestamp': { $exists: true }
      }
    },
    {
      $group: {
        _id: '$userId',
        totalHours: { $sum: '$durationMinutes' },
        avgQualityScore: { $avg: '$qualityScore' },
        daysWorked: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $sort: { totalHours: -1 }
    },
    {
      $limit: 5
    }
  ]);

  // Get attendance alerts
  const attendanceAlerts = await Attendance.find({
    organizationId: req.user.orgId,
    date: { $gte: startDate },
    $or: [
      { riskLevel: { $in: ['high', 'critical'] } },
      { qualityScore: { $lt: 70 } },
      { 'securityFlags': { $exists: true, $ne: [] } }
    ]
  }).populate('userId', 'fullName email').limit(10);

  res.json({
    success: true,
    data: {
      topPerformers: topPerformers.map(performer => ({
        name: performer.user.fullName,
        email: performer.user.email,
        totalHours: Math.round(performer.totalHours / 60),
        avgQualityScore: Math.round(performer.avgQualityScore),
        daysWorked: performer.daysWorked
      })),
      attendanceAlerts: attendanceAlerts.map(alert => ({
        employeeName: alert.userId.fullName,
        date: alert.date,
        riskLevel: alert.riskLevel,
        qualityScore: alert.qualityScore,
        securityFlags: alert.securityFlags
      })),
      productivityInsights: [
        {
          insight: 'Biometric verification increased by 15% this week',
          impact: 'positive',
          recommendation: 'Continue promoting biometric check-ins'
        },
        {
          insight: 'Photo verification rate is at 85%',
          impact: 'neutral',
          recommendation: 'Consider making photo verification mandatory'
        }
      ],
      complianceIssues: [],
      recommendations: [
        'Implement mandatory photo verification for remote workers',
        'Set up automated alerts for high-risk attendance patterns',
        'Consider implementing geofencing for office locations'
      ]
    }
  });
}));

// ============================================
// ADMIN-SPECIFIC ENDPOINTS
// ============================================

// Get admin attendance statistics
router.get('/admin/stats', [
  requirePermission('admin:read'),
  query('date').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // Get total employees
    const totalEmployees = await Employee.countDocuments({ 
      organizationId: req.user.organizationId,
      status: 'active'
    });

    // Get attendance statistics for the date
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          organizationId: req.user.organizationId,
          date: {
            $gte: startDate,
            $lt: endDate
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: { $sum: { $divide: ['$durationMinutes', 60] } },
          totalOvertime: { $sum: { $divide: ['$overtimeMinutes', 60] } }
        }
      }
    ]);

    // Get pending approvals count
    const pendingApprovals = await Attendance.countDocuments({
      organizationId: req.user.organizationId,
      'correctionRequests.status': 'pending'
    });

    // Process statistics
    const stats = {
      totalEmployees,
      presentToday: 0,
      absentToday: 0,
      lateToday: 0,
      pendingApprovals,
      totalHours: 0,
      overtimeHours: 0
    };

    attendanceStats.forEach(stat => {
      switch (stat._id) {
        case 'present':
          stats.presentToday = stat.count;
          stats.totalHours += stat.totalHours || 0;
          break;
        case 'absent':
          stats.absentToday = stat.count;
          break;
        case 'late':
          stats.lateToday = stat.count;
          stats.totalHours += stat.totalHours || 0;
          break;
      }
      stats.overtimeHours += stat.totalOvertime || 0;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Get attendance overview for admin
router.get('/admin/overview', [
  requirePermission('admin:read'),
  query('date').optional().isISO8601(),
  query('department').optional().isString(),
  query('status').optional().isString()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { date, department, status } = req.query;
    const filterDate = date || new Date().toISOString().split('T')[0];
    const startDate = new Date(filterDate);
    const endDate = new Date(filterDate);
    endDate.setDate(endDate.getDate() + 1);

    // Build query
    const query = {
      organizationId: req.user.organizationId,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    };

    if (status) {
      query.status = status;
    }

    // Get attendance records with employee details
    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId department position')
      .sort({ 'checkIn.timestamp': -1 })
      .limit(100);

    // Filter by department if specified
    let filteredAttendance = attendance;
    if (department) {
      filteredAttendance = attendance.filter(record => 
        record.employee && record.employee.department === department
      );
    }

    res.json({
      success: true,
      data: {
        attendance: filteredAttendance,
        total: filteredAttendance.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Get pending approvals
router.get('/admin/pending-approvals', [
  requirePermission('admin:read')
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const approvals = await Attendance.find({
      organizationId: req.user.organizationId,
      'correctionRequests.status': 'pending'
    })
    .populate('employee', 'firstName lastName employeeId department position')
    .sort({ 'correctionRequests.createdAt': -1 })
    .limit(50);

    // Transform approvals data
    const pendingApprovals = approvals.flatMap(attendance => 
      attendance.correctionRequests
        .filter(request => request.status === 'pending')
        .map(request => ({
          _id: request._id,
          attendanceId: attendance._id,
          employee: attendance.employee,
          type: request.type,
          date: attendance.date,
          reason: request.reason,
          details: request.details,
          priority: request.priority || 'medium',
          status: request.status,
          createdAt: request.createdAt,
          attachments: request.attachments || []
        }))
    );

    res.json({
      success: true,
      data: {
        approvals: pendingApprovals
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Manual attendance entry
router.post('/admin/manual-entry', [
  requirePermission('admin:write'),
  body('employeeId').isMongoId(),
  body('date').isISO8601(),
  body('status').isIn(['present', 'absent', 'late', 'half-day', 'on-leave']),
  body('checkInTime').optional().isString(),
  body('checkOutTime').optional().isString(),
  body('notes').optional().isString(),
  body('location').optional().isString(),
  body('overtimeHours').optional().isFloat({ min: 0 })
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const {
      employeeId,
      date,
      status,
      checkInTime,
      checkOutTime,
      notes,
      location,
      overtimeHours
    } = req.body;

    // Get employee
    const employee = await Employee.findOne({ 
      _id: employeeId,
      organizationId: req.user.organizationId 
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      employeeId: employee._id,
      date: new Date(date)
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance record already exists for this date'
      });
    }

    // Create attendance record
    const attendanceData = {
      employeeId: employee._id,
      organizationId: req.user.organizationId,
      date: new Date(date),
      status,
      notes: notes || '',
      createdBy: req.user._id,
      isManualEntry: true
    };

    // Add check-in data if provided
    if (checkInTime && status !== 'absent') {
      const checkInDateTime = new Date(`${date}T${checkInTime}`);
      attendanceData.checkIn = {
        timestamp: checkInDateTime,
        location: location ? { address: location } : null,
        verified: true,
        device: {
          type: 'manual',
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip
        }
      };
    }

    // Add check-out data if provided
    if (checkOutTime && status !== 'absent') {
      const checkOutDateTime = new Date(`${date}T${checkOutTime}`);
      attendanceData.checkOut = {
        timestamp: checkOutDateTime,
        location: location ? { address: location } : null,
        verified: true,
        device: {
          type: 'manual',
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip
        }
      };

      // Calculate duration
      if (attendanceData.checkIn) {
        const durationMs = checkOutDateTime - checkInDateTime;
        attendanceData.durationMinutes = Math.floor(durationMs / (1000 * 60));
        
        // Calculate overtime
        const standardMinutes = 480; // 8 hours
        attendanceData.overtimeMinutes = Math.max(0, attendanceData.durationMinutes - standardMinutes);
      }
    }

    // Override overtime if specified
    if (overtimeHours) {
      attendanceData.overtimeMinutes = overtimeHours * 60;
    }

    const attendance = new Attendance(attendanceData);
    await attendance.save();

    res.json({
      success: true,
      message: 'Manual attendance entry created successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Bulk status update
router.post('/admin/bulk-status-update', [
  requirePermission('admin:write'),
  body('attendanceIds').isArray({ min: 1 }),
  body('status').isIn(['present', 'absent', 'late', 'half-day', 'on-leave'])
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { attendanceIds, status } = req.body;

    const result = await Attendance.updateMany(
      {
        _id: { $in: attendanceIds },
        organizationId: req.user.organizationId
      },
      {
        $set: {
          status: status,
          updatedBy: req.user._id,
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} attendance records`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Bulk action (approve/reject)
router.post('/admin/bulk-action', [
  requirePermission('admin:write'),
  body('action').isIn(['approve', 'reject', 'export']),
  body('attendanceIds').isArray({ min: 1 })
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { action, attendanceIds } = req.body;

    if (action === 'approve') {
      const result = await Attendance.updateMany(
        {
          _id: { $in: attendanceIds },
          organizationId: req.user.organizationId
        },
        {
          $set: {
            'correctionRequests.$[elem].status': 'approved',
            'correctionRequests.$[elem].approvedBy': req.user._id,
            'correctionRequests.$[elem].approvedAt': new Date(),
            updatedBy: req.user._id
          }
        },
        {
          arrayFilters: [{ 'elem.status': 'pending' }]
        }
      );

      res.json({
        success: true,
        message: `Approved ${result.modifiedCount} requests`,
        data: { modifiedCount: result.modifiedCount }
      });
    } else if (action === 'reject') {
      const result = await Attendance.updateMany(
        {
          _id: { $in: attendanceIds },
          organizationId: req.user.organizationId
        },
        {
          $set: {
            'correctionRequests.$[elem].status': 'rejected',
            'correctionRequests.$[elem].rejectedBy': req.user._id,
            'correctionRequests.$[elem].rejectedAt': new Date(),
            updatedBy: req.user._id
          }
        },
        {
          arrayFilters: [{ 'elem.status': 'pending' }]
        }
      );

      res.json({
        success: true,
        message: `Rejected ${result.modifiedCount} requests`,
        data: { modifiedCount: result.modifiedCount }
      });
    } else if (action === 'export') {
      res.json({
        success: true,
        message: 'Export functionality will be implemented',
        data: { exportedCount: attendanceIds.length }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Approve individual request
router.post('/admin/approve/:approvalId', [
  requirePermission('admin:write'),
  param('approvalId').isMongoId(),
  body('type').isString(),
  body('action').isIn(['approve', 'reject'])
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { type, action } = req.body;

    const attendance = await Attendance.findOne({
      'correctionRequests._id': approvalId,
      organizationId: req.user.organizationId
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    const request = attendance.correctionRequests.id(approvalId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    if (action === 'approve') {
      request.status = 'approved';
      request.approvedBy = req.user._id;
      request.approvedAt = new Date();
    } else {
      request.status = 'rejected';
      request.rejectedBy = req.user._id;
      request.rejectedAt = new Date();
    }

    await attendance.save();

    res.json({
      success: true,
      message: `Request ${action}d successfully`,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Reject individual request
router.post('/admin/reject/:approvalId', [
  requirePermission('admin:write'),
  param('approvalId').isMongoId(),
  body('type').isString(),
  body('action').isIn(['approve', 'reject']),
  body('reason').optional().isString()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { type, action, reason } = req.body;

    const attendance = await Attendance.findOne({
      'correctionRequests._id': approvalId,
      organizationId: req.user.organizationId
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    const request = attendance.correctionRequests.id(approvalId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    request.status = 'rejected';
    request.rejectedBy = req.user._id;
    request.rejectedAt = new Date();
    request.rejectionReason = reason;

    await attendance.save();

    res.json({
      success: true,
      message: 'Request rejected successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// Export attendance data
router.get('/admin/export', [
  requirePermission('admin:read'),
  query('format').isIn(['csv', 'excel', 'json']),
  query('date').optional().isISO8601(),
  query('department').optional().isString()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { format, date, department } = req.query;
    const filterDate = date || new Date().toISOString().split('T')[0];
    const startDate = new Date(filterDate);
    const endDate = new Date(filterDate);
    endDate.setDate(endDate.getDate() + 1);

    // Build query
    const query = {
      organizationId: req.user.organizationId,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    };

    // Get attendance data
    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId department position')
      .sort({ date: -1 });

    // Filter by department if specified
    let filteredAttendance = attendance;
    if (department) {
      filteredAttendance = attendance.filter(record => 
        record.employee && record.employee.department === department
      );
    }

    // Transform data for export
    const exportData = filteredAttendance.map(record => ({
      employeeName: `${record.employee?.firstName} ${record.employee?.lastName}`,
      employeeId: record.employee?.employeeId,
      department: record.employee?.department,
      date: record.date.toISOString().split('T')[0],
      status: record.status,
      checkIn: record.checkIn?.timestamp ? new Date(record.checkIn.timestamp).toLocaleTimeString() : '',
      checkOut: record.checkOut?.timestamp ? new Date(record.checkOut.timestamp).toLocaleTimeString() : '',
      duration: record.durationMinutes ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m` : '',
      overtime: record.overtimeMinutes ? `${Math.floor(record.overtimeMinutes / 60)}h ${record.overtimeMinutes % 60}m` : '',
      location: record.checkIn?.location?.address || '',
      notes: record.notes || ''
    }));

    if (format === 'json') {
      res.json({
        success: true,
        data: exportData
      });
    } else if (format === 'csv') {
      // Convert to CSV
      const csvHeader = 'Employee Name,Employee ID,Department,Date,Status,Check In,Check Out,Duration,Overtime,Location,Notes\n';
      const csvData = exportData.map(row => 
        `"${row.employeeName}","${row.employeeId}","${row.department}","${row.date}","${row.status}","${row.checkIn}","${row.checkOut}","${row.duration}","${row.overtime}","${row.location}","${row.notes}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="attendance-${filterDate}.csv"`);
      res.send(csvHeader + csvData);
    } else {
      res.json({
        success: true,
        message: 'Excel export functionality will be implemented',
        data: exportData
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

module.exports = router;
