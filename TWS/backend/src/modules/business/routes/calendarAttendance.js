const express = require('express');
const { query, body } = require('express-validator');
const { requirePermission } = require('../../../middleware/auth/rbac');
const ErrorHandler = require('../../../middleware/common/errorHandler');
const ValidationMiddleware = require('../../../middleware/validation/validation');
const Attendance = require('../../../models/Attendance');
const Employee = require('../../../models/Employee');

const router = express.Router();

// Get attendance calendar data
router.get('/calendar', [
  requirePermission('attendance:read'),
  query('year').isInt({ min: 2020, max: 2030 }),
  query('month').isInt({ min: 1, max: 12 }),
  query('userId').optional().isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { year, month, userId } = req.query;
    const targetUserId = userId || req.user._id;
    
    // Get start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Fetch attendance records for the month
    const attendanceRecords = await Attendance.find({
      userId: targetUserId,
      date: {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0]
      }
    }).sort({ date: 1 });

    // Process records and determine status
    const calendarData = {};
    
    attendanceRecords.forEach(record => {
      const dateStr = record.date;
      let status = 'absent';
      
      if (record.checkIn && record.checkOut) {
        // Check if on time (within 30 minutes of 9 AM)
        const checkInTime = new Date(record.checkIn.timestamp);
        const expectedTime = new Date(checkInTime);
        expectedTime.setHours(9, 0, 0, 0);
        
        const timeDiff = Math.abs(checkInTime - expectedTime);
        const minutesDiff = timeDiff / (1000 * 60);
        
        if (minutesDiff <= 30) {
          status = 'on_time';
        } else {
          status = 'late';
        }
      } else if (record.checkIn && !record.checkOut) {
        // Checked in but not out - could be present or half day
        const checkInTime = new Date(record.checkIn.timestamp);
        const expectedTime = new Date(checkInTime);
        expectedTime.setHours(9, 0, 0, 0);
        
        const timeDiff = Math.abs(checkInTime - expectedTime);
        const minutesDiff = timeDiff / (1000 * 60);
        
        if (minutesDiff <= 30) {
          status = 'present';
        } else {
          status = 'late';
        }
      }
      
      calendarData[dateStr] = {
        status,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        durationMinutes: record.durationMinutes
      };
    });

    res.json({
      success: true,
      data: calendarData
    });
  } catch (error) {
    console.error('Failed to fetch calendar data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar data',
      error: error.message
    });
  }
}));

// Get employee records for admin
router.get('/admin/records', [
  requirePermission('attendance:read'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['present', 'late', 'absent', 'half_day']),
  query('date').optional().isISO8601(),
  query('search').optional().isString()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      date,
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      query.date = date;
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'employees',
          localField: 'userId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' }
    ];

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'employee.name': { $regex: search, $options: 'i' } },
            { 'employee.employeeId': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add sorting and pagination
    pipeline.push(
      { $sort: { date: -1, 'checkIn.timestamp': -1 } },
      {
        $facet: {
          records: [
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    );

    const result = await Attendance.aggregate(pipeline);
    const records = result[0].records;
    const total = result[0].totalCount[0]?.count || 0;

    // Format the response
    const formattedRecords = records.map(record => ({
      _id: record._id,
      employeeName: record.employee.name,
      employeeId: record.employee.employeeId,
      adminId: record.employee.adminId,
      isAdmin: record.isAdmin || false,
      date: record.date,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status,
      durationMinutes: record.durationMinutes,
      createdAt: record.createdAt
    }));

    res.json({
      success: true,
      data: {
        records: formattedRecords,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch employee records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee records',
      error: error.message
    });
  }
}));

// Update attendance record status
router.put('/admin/records/:recordId/status', [
  requirePermission('attendance:write'),
  body('status').isIn(['present', 'late', 'absent', 'half_day'])
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { recordId } = req.params;
    const { status } = req.body;

    const record = await Attendance.findByIdAndUpdate(
      recordId,
      { status },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: record
    });
  } catch (error) {
    console.error('Failed to update record status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update record status',
      error: error.message
    });
  }
}));

// Export employee records
router.get('/admin/records/export', [
  requirePermission('attendance:read'),
  query('status').optional().isIn(['present', 'late', 'absent', 'half_day']),
  query('date').optional().isISO8601(),
  query('search').optional().isString()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { status, date, search } = req.query;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      query.date = date;
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'employees',
          localField: 'userId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' }
    ];

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'employee.name': { $regex: search, $options: 'i' } },
            { 'employee.employeeId': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push({ $sort: { date: -1, 'checkIn.timestamp': -1 } });

    const records = await Attendance.aggregate(pipeline);

    // Format CSV data
    const csvHeader = 'Date,Employee Name,Employee ID,Check In,Check Out,Duration (Hours),Status\n';
    const csvData = records.map(record => {
      const checkIn = record.checkIn ? new Date(record.checkIn.timestamp).toLocaleString() : 'Not checked in';
      const checkOut = record.checkOut ? new Date(record.checkOut.timestamp).toLocaleString() : 'Not checked out';
      const duration = record.durationMinutes ? (record.durationMinutes / 60).toFixed(2) : '0';
      
      return `${record.date},${record.employee.name},${record.employee.employeeId},${checkIn},${checkOut},${duration},${record.status}`;
    }).join('\n');

    const csvContent = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=employee-records-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Failed to export records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export records',
      error: error.message
    });
  }
}));

module.exports = router;
