const express = require('express');
const { body, query } = require('express-validator');
const { requirePermission } = require('../../../middleware/auth/rbac');
const ErrorHandler = require('../../../middleware/common/errorHandler');
const ValidationMiddleware = require('../../../middleware/validation/validation');
const Attendance = require('../../../models/Attendance');
const Employee = require('../../../models/Employee');

const router = express.Router();

// Simple Employee Check In
router.post('/checkin', [
  requirePermission('attendance:write'),
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('timestamp').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { employeeId, timestamp } = req.body;
    
    // Find employee by employeeId
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee not found with the provided Employee ID'
      });
    }

    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = await Attendance.findOne({
      userId: employee._id,
      date: today
    });

    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    const checkInData = {
      timestamp: timestamp || new Date(),
      verified: true,
      verificationMethod: 'employee_id'
    };

    if (existingAttendance) {
      // Update existing record
      existingAttendance.checkIn = checkInData;
      existingAttendance.status = 'present';
      existingAttendance.isActive = true;
      await existingAttendance.save();
    } else {
      // Create new attendance record
      const attendance = new Attendance({
        userId: employee._id,
        employeeId: employeeId,
        organizationId: employee.organizationId,
        date: today,
        checkIn: checkInData,
        status: 'present',
        isActive: true
      });
      await attendance.save();
    }

    res.json({
      success: true,
      message: 'Checked in successfully',
      data: {
        employeeId,
        checkInTime: checkInData.timestamp,
        status: 'checked_in'
      }
    });
  } catch (error) {
    console.error('Simple check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Check-in failed',
      error: error.message
    });
  }
}));

// Simple Employee Check Out
router.post('/checkout', [
  requirePermission('attendance:write'),
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('timestamp').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { employeeId, timestamp } = req.body;
    
    // Find employee by employeeId
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee not found with the provided Employee ID'
      });
    }

    // Find today's attendance record
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({
      userId: employee._id,
      date: today
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    const checkOutTime = timestamp || new Date();
    const checkInTime = new Date(attendance.checkIn.timestamp);
    const durationMinutes = Math.round((checkOutTime - checkInTime) / (1000 * 60));

    attendance.checkOut = {
      timestamp: checkOutTime,
      verified: true,
      verificationMethod: 'employee_id'
    };
    attendance.durationMinutes = durationMinutes;
    attendance.status = 'present';
    attendance.isActive = false;
    
    await attendance.save();

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: {
        employeeId,
        checkInTime: attendance.checkIn.timestamp,
        checkOutTime: checkOutTime,
        durationMinutes,
        status: 'checked_out'
      }
    });
  } catch (error) {
    console.error('Simple check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Check-out failed',
      error: error.message
    });
  }
}));

// Simple Admin Check In
router.post('/admin/checkin', [
  requirePermission('attendance:write'),
  body('adminId').notEmpty().withMessage('Admin ID is required'),
  body('timestamp').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { adminId, timestamp } = req.body;
    
    // Find admin by adminId or employeeId
    const admin = await Employee.findOne({ 
      $or: [
        { adminId: adminId },
        { employeeId: adminId }
      ]
    });
    
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Admin not found with the provided Admin ID'
      });
    }

    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = await Attendance.findOne({
      userId: admin._id,
      date: today
    });

    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    const checkInData = {
      timestamp: timestamp || new Date(),
      verified: true,
      verificationMethod: 'admin_id'
    };

    if (existingAttendance) {
      // Update existing record
      existingAttendance.checkIn = checkInData;
      existingAttendance.status = 'present';
      existingAttendance.isActive = true;
      await existingAttendance.save();
    } else {
      // Create new attendance record
      const attendance = new Attendance({
        userId: admin._id,
        employeeId: adminId,
        organizationId: admin.organizationId,
        date: today,
        checkIn: checkInData,
        status: 'present',
        isActive: true,
        isAdmin: true
      });
      await attendance.save();
    }

    res.json({
      success: true,
      message: 'Admin checked in successfully',
      data: {
        adminId,
        checkInTime: checkInData.timestamp,
        status: 'checked_in'
      }
    });
  } catch (error) {
    console.error('Simple admin check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin check-in failed',
      error: error.message
    });
  }
}));

// Simple Admin Check Out
router.post('/admin/checkout', [
  requirePermission('attendance:write'),
  body('adminId').notEmpty().withMessage('Admin ID is required'),
  body('timestamp').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const { adminId, timestamp } = req.body;
    
    // Find admin by adminId or employeeId
    const admin = await Employee.findOne({ 
      $or: [
        { adminId: adminId },
        { employeeId: adminId }
      ]
    });
    
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Admin not found with the provided Admin ID'
      });
    }

    // Find today's attendance record
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({
      userId: admin._id,
      date: today
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    const checkOutTime = timestamp || new Date();
    const checkInTime = new Date(attendance.checkIn.timestamp);
    const durationMinutes = Math.round((checkOutTime - checkInTime) / (1000 * 60));

    attendance.checkOut = {
      timestamp: checkOutTime,
      verified: true,
      verificationMethod: 'admin_id'
    };
    attendance.durationMinutes = durationMinutes;
    attendance.status = 'present';
    attendance.isActive = false;
    
    await attendance.save();

    res.json({
      success: true,
      message: 'Admin checked out successfully',
      data: {
        adminId,
        checkInTime: attendance.checkIn.timestamp,
        checkOutTime: checkOutTime,
        durationMinutes,
        status: 'checked_out'
      }
    });
  } catch (error) {
    console.error('Simple admin check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin check-out failed',
      error: error.message
    });
  }
}));

// Get today's attendance for current user
router.get('/today', [
  requirePermission('attendance:read')
], ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    res.json({
      success: true,
      data: {
        attendance: attendance || null
      }
    });
  } catch (error) {
    console.error('Failed to fetch today attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today attendance',
      error: error.message
    });
  }
}));

// Get simple employee records for admin
router.get('/admin/simple/records', [
  requirePermission('attendance:read')
], ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get all attendance records for today
    const attendanceRecords = await Attendance.find({ date: today })
      .populate('userId', 'name email employeeId adminId')
      .sort({ 'checkIn.timestamp': -1 });

    // Format the response
    const formattedRecords = attendanceRecords.map(record => ({
      _id: record._id,
      employeeName: record.userId?.name || 'Unknown',
      employeeId: record.userId?.employeeId || record.employeeId,
      adminId: record.userId?.adminId,
      isAdmin: record.isAdmin || false,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.checkOut ? 'checked_out' : record.checkIn ? 'checked_in' : 'not_checked_in',
      durationMinutes: record.durationMinutes,
      createdAt: record.createdAt
    }));

    res.json({
      success: true,
      data: formattedRecords
    });
  } catch (error) {
    console.error('Failed to fetch simple employee records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee records',
      error: error.message
    });
  }
}));

module.exports = router;
