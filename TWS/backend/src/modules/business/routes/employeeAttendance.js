const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth/auth');
const Attendance = require('../../../models/Attendance');
const ErrorHandler = require('../../../middleware/common/errorHandler');

// Get employee's own attendance records
router.get('/employee', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, startDate, endDate } = req.query;
  
  const filter = {
    userId: req.user._id
  };
  
  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const attendance = await Attendance.find(filter)
    .sort({ date: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  res.json({
    success: true,
    data: attendance
  });
}));

// Get today's attendance for employee
router.get('/employee/today', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const attendance = await Attendance.findOne({
    userId: req.user._id,
    date: {
      $gte: today,
      $lt: tomorrow
    }
  });
  
  res.json({
    success: true,
    data: attendance
  });
}));

// Check in for employee
router.post('/check-in', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { 
    location, 
    notes, 
    timestamp, 
    verificationMethod,
    photoUrl,
    photoHash,
    biometricData,
    device
  } = req.body;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Check if already checked in today
  const existingAttendance = await Attendance.findOne({
    userId: req.user._id,
    date: {
      $gte: today,
      $lt: tomorrow
    }
  });
  
  if (existingAttendance && existingAttendance.checkIn) {
    return res.status(400).json({
      success: false,
      message: 'Already checked in today'
    });
  }
  
  const checkInTime = timestamp ? new Date(timestamp) : new Date();
  
  // Build check-in data
  const checkInData = {
    timestamp: checkInTime,
    location: {
      address: location || 'Office',
      verified: false
    },
    notes: notes || '',
    verified: false,
    verificationMethod: verificationMethod || 'manual'
  };

  // Add verification data based on method
  if (verificationMethod === 'photo' && photoUrl) {
    checkInData.photoUrl = photoUrl;
    checkInData.photoHash = photoHash;
    checkInData.verified = true;
  } else if (verificationMethod === 'fingerprint' && biometricData) {
    checkInData.biometricData = {
      fingerprint: biometricData.fingerprint,
      quality: biometricData.quality
    };
    checkInData.verified = true;
  } else if (verificationMethod === 'location' && req.body.location) {
    checkInData.location = {
      ...req.body.location,
      verified: true
    };
    checkInData.verified = true;
  }

  // Add device information
  if (device) {
    checkInData.device = {
      type: device.type || 'web',
      userAgent: device.userAgent || req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      deviceId: `web_${req.user._id}_${Date.now()}`,
      browser: device.browser,
      os: device.os,
      screenResolution: device.screenResolution
    };
  }
  
  if (existingAttendance) {
    // Update existing record
    existingAttendance.checkIn = checkInData;
    existingAttendance.status = 'present';
    await existingAttendance.save();
  } else {
    // Create new record
    const attendance = new Attendance({
      userId: req.user._id,
      employeeId: req.user.employeeId || req.user._id.toString(),
      organizationId: req.user.orgId,
      date: today,
      checkIn: checkInData,
      status: 'present'
    });
    await attendance.save();
  }
  
  res.json({
    success: true,
    message: 'Checked in successfully',
    data: {
      verificationMethod,
      verified: checkInData.verified,
      timestamp: checkInTime
    }
  });
}));

// Check out for employee
router.post('/check-out', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { timestamp } = req.body;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const attendance = await Attendance.findOne({
    userId: req.user._id,
    date: {
      $gte: today,
      $lt: tomorrow
    }
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
  
  const checkOutTime = timestamp ? new Date(timestamp) : new Date();
  
  attendance.checkOut = {
    timestamp: checkOutTime
  };
  attendance.status = 'present';
  
  // Calculate duration
  const durationMs = checkOutTime - attendance.checkIn.timestamp;
  attendance.durationMinutes = Math.round(durationMs / (1000 * 60));
  
  await attendance.save();
  
  res.json({
    success: true,
    message: 'Checked out successfully'
  });
}));

// Get weekly stats for employee
router.get('/employee/stats/weekly', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const attendance = await Attendance.find({
    userId: req.user._id,
    date: { $gte: startOfWeek },
    checkOut: { $exists: true }
  });
  
  const totalHours = attendance.reduce((sum, record) => {
    return sum + (record.durationMinutes || 0);
  }, 0) / 60;
  
  const daysWorked = attendance.length;
  const averageHours = daysWorked > 0 ? totalHours / daysWorked : 0;
  
  res.json({
    success: true,
    data: {
      totalHours: Math.round(totalHours * 100) / 100,
      daysWorked,
      averageHours: Math.round(averageHours * 100) / 100
    }
  });
}));

// Get monthly stats for employee
router.get('/employee/stats/monthly', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const attendance = await Attendance.find({
    userId: req.user._id,
    date: { $gte: startOfMonth },
    checkOut: { $exists: true }
  });
  
  const totalHours = attendance.reduce((sum, record) => {
    return sum + (record.durationMinutes || 0);
  }, 0) / 60;
  
  const daysWorked = attendance.length;
  const averageHours = daysWorked > 0 ? totalHours / daysWorked : 0;
  
  res.json({
    success: true,
    data: {
      totalHours: Math.round(totalHours * 100) / 100,
      daysWorked,
      averageHours: Math.round(averageHours * 100) / 100
    }
  });
}));

module.exports = router;
