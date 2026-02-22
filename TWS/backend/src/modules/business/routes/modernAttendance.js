const express = require('express');
const router = express.Router();
const Attendance = require('../../../models/Attendance');
const Employee = require('../../../models/Employee');
const { authenticateToken, requirePermission } = require('../../../middleware/auth/auth');
const ErrorHandler = require('../../../middleware/common/errorHandler');

// Get trending metrics for dashboard
router.get('/trending-metrics', authenticateToken, requirePermission(['hr', 'admin', 'owner']), ErrorHandler.asyncHandler(async (req, res) => {
  const { range = '7d' } = req.query;
  
  // Calculate date range
  const now = new Date();
  let startDate;
  switch (range) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Get current period data
  const currentData = await Attendance.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: now },
        organizationId: req.user.organizationId
      }
    },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        presentCount: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        lateCount: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        absentCount: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        totalHours: { $sum: { $divide: ['$durationMinutes', 60] } },
        overtimeHours: { $sum: { $divide: ['$overtimeMinutes', 60] } }
      }
    }
  ]);

  // Get previous period data for comparison
  const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
  const previousData = await Attendance.aggregate([
    {
      $match: {
        date: { $gte: previousStartDate, $lt: startDate },
        organizationId: req.user.organizationId
      }
    },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        presentCount: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        lateCount: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        absentCount: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        totalHours: { $sum: { $divide: ['$durationMinutes', 60] } },
        overtimeHours: { $sum: { $divide: ['$overtimeMinutes', 60] } }
      }
    }
  ]);

  const current = currentData[0] || { totalRecords: 0, presentCount: 0, lateCount: 0, absentCount: 0, totalHours: 0, overtimeHours: 0 };
  const previous = previousData[0] || { totalRecords: 0, presentCount: 0, lateCount: 0, absentCount: 0, totalHours: 0, overtimeHours: 0 };

  // Calculate metrics
  const attendanceRate = current.totalRecords > 0 ? Math.round((current.presentCount / current.totalRecords) * 100) : 0;
  const previousAttendanceRate = previous.totalRecords > 0 ? Math.round((previous.presentCount / previous.totalRecords) * 100) : 0;
  
  const punctuality = current.totalRecords > 0 ? Math.round(((current.presentCount - current.lateCount) / current.totalRecords) * 100) : 0;
  const previousPunctuality = previous.totalRecords > 0 ? Math.round(((previous.presentCount - previous.lateCount) / previous.totalRecords) * 100) : 0;

  const productivity = Math.min(100, Math.round(attendanceRate * 0.8 + punctuality * 0.2));
  const previousProductivity = Math.min(100, Math.round(previousAttendanceRate * 0.8 + previousPunctuality * 0.2));

  const remoteWork = Math.round(Math.random() * 20 + 40); // Simulate remote work percentage
  const previousRemoteWork = Math.round(Math.random() * 20 + 35);

  const overtime = current.totalHours > 0 ? Math.round((current.overtimeHours / current.totalHours) * 100) : 0;
  const previousOvertime = previous.totalHours > 0 ? Math.round((previous.overtimeHours / previous.totalHours) * 100) : 0;

  const absenteeism = current.totalRecords > 0 ? Math.round((current.absentCount / current.totalRecords) * 100) : 0;
  const previousAbsenteeism = previous.totalRecords > 0 ? Math.round((previous.absentCount / previous.totalRecords) * 100) : 0;

  res.json({
    success: true,
    data: {
      attendanceRate: {
        current: attendanceRate,
        previous: previousAttendanceRate,
        trend: attendanceRate > previousAttendanceRate ? 'up' : attendanceRate < previousAttendanceRate ? 'down' : 'stable'
      },
      punctuality: {
        current: punctuality,
        previous: previousPunctuality,
        trend: punctuality > previousPunctuality ? 'up' : punctuality < previousPunctuality ? 'down' : 'stable'
      },
      productivity: {
        current: productivity,
        previous: previousProductivity,
        trend: productivity > previousProductivity ? 'up' : productivity < previousProductivity ? 'down' : 'stable'
      },
      remoteWork: {
        current: remoteWork,
        previous: previousRemoteWork,
        trend: remoteWork > previousRemoteWork ? 'up' : remoteWork < previousRemoteWork ? 'down' : 'stable'
      },
      overtime: {
        current: overtime,
        previous: previousOvertime,
        trend: overtime > previousOvertime ? 'up' : overtime < previousOvertime ? 'down' : 'stable'
      },
      absenteeism: {
        current: absenteeism,
        previous: previousAbsenteeism,
        trend: absenteeism > previousAbsenteeism ? 'up' : absenteeism < previousAbsenteeism ? 'down' : 'stable'
      }
    }
  });
}));

// Get AI insights
router.get('/insights', authenticateToken, requirePermission(['hr', 'admin', 'owner']), ErrorHandler.asyncHandler(async (req, res) => {
  const { range = '7d' } = req.query;
  
  // Get top performers
  const topPerformers = await Attendance.aggregate([
    {
      $match: {
        organizationId: req.user.organizationId,
        status: 'present'
      }
    },
    {
      $group: {
        _id: '$employeeId',
        attendanceCount: { $sum: 1 },
        totalDays: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: '_id',
        as: 'employee'
      }
    },
    {
      $unwind: '$employee'
    },
    {
      $project: {
        name: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] },
        department: '$employee.department',
        score: { $round: [{ $multiply: [{ $divide: ['$attendanceCount', '$totalDays'] }, 100] }, 0] }
      }
    },
    {
      $sort: { score: -1 }
    },
    {
      $limit: 5
    }
  ]);

  // Generate mock insights
  const insights = {
    topPerformers: topPerformers,
    attendanceAlerts: [
      {
        message: 'Engineering team showing 15% increase in late arrivals',
        time: '2 hours ago',
        type: 'alert',
        priority: 'medium'
      },
      {
        message: 'Remote work productivity up 8% this week',
        time: '4 hours ago',
        type: 'alert',
        priority: 'low'
      },
      {
        message: 'Overtime hours exceeded policy limits for 3 employees',
        time: '6 hours ago',
        type: 'alert',
        priority: 'high'
      }
    ],
    productivityInsights: [
      {
        title: 'Peak Productivity Hours',
        description: '10 AM - 2 PM shows highest productivity scores',
        value: '89%',
        type: 'performance'
      },
      {
        title: 'Team Collaboration Score',
        description: 'Cross-department collaboration increased by 12%',
        value: '78%',
        type: 'performance'
      },
      {
        title: 'Focus Time Optimization',
        description: 'Uninterrupted work time improved by 18%',
        value: '82%',
        type: 'performance'
      }
    ],
    complianceIssues: [
      {
        title: 'Overtime Policy Violation',
        description: '3 employees exceeded maximum overtime hours',
        timestamp: '1 hour ago',
        type: 'compliance',
        priority: 'high'
      },
      {
        title: 'Break Time Compliance',
        description: 'All employees meeting break time requirements',
        timestamp: '2 hours ago',
        type: 'compliance',
        priority: 'low'
      }
    ],
    recommendations: [
      {
        title: 'Implement Flexible Hours',
        description: 'Allow flexible start times to reduce late arrivals',
        timestamp: '3 hours ago',
        type: 'recommendation',
        priority: 'medium'
      },
      {
        title: 'Remote Work Optimization',
        description: 'Enhance remote work tools and policies',
        timestamp: '5 hours ago',
        type: 'recommendation',
        priority: 'medium'
      }
    ]
  };

  res.json({
    success: true,
    data: insights
  });
}));

// Get real-time data
router.get('/realtime', authenticateToken, requirePermission(['hr', 'admin', 'owner']), ErrorHandler.asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Get current active employees
  const activeEmployees = await Attendance.countDocuments({
    organizationId: req.user.organizationId,
    date: { $gte: todayStart },
    status: 'present',
    'checkOut.timestamp': { $exists: false }
  });

  // Get active sessions (employees currently checked in)
  const activeSessions = await Attendance.countDocuments({
    organizationId: req.user.organizationId,
    date: { $gte: todayStart },
    'checkIn.timestamp': { $exists: true },
    'checkOut.timestamp': { $exists: false }
  });

  // Get location distribution
  const locationStats = await Attendance.aggregate([
    {
      $match: {
        organizationId: req.user.organizationId,
        date: { $gte: todayStart },
        status: 'present'
      }
    },
    {
      $group: {
        _id: '$checkIn.location',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 1
    }
  ]);

  const currentLocation = locationStats.length > 0 ? locationStats[0]._id || 'Office' : 'Office';

  res.json({
    success: true,
    data: {
      liveEmployees: activeEmployees,
      activeSessions: activeSessions,
      currentLocation: currentLocation,
      systemHealth: 'excellent'
    }
  });
}));

module.exports = router;
