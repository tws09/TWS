const Meeting = require('../../models/Meeting');
const MeetingAnalytics = require('../../models/MeetingAnalytics');
const User = require('../../models/User');

class MeetingAnalyticsService {
  constructor() {
    this.analyticsCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // Generate comprehensive analytics for a date range
  async generateAnalytics(organizationId, startDate, endDate, forceRefresh = false) {
    const cacheKey = `${organizationId}-${startDate.toISOString()}-${endDate.toISOString()}`;
    
    // Check cache first
    if (!forceRefresh && this.analyticsCache.has(cacheKey)) {
      const cached = this.analyticsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const meetings = await Meeting.find({
        organizationId,
        startTime: { $gte: startDate },
        endTime: { $lte: endDate }
      })
      .populate('organizer', 'name email')
      .populate('attendees.user', 'name email')
      .populate('projectId', 'name')
      .populate('clientId', 'name email');

      const analytics = await this.calculateAnalytics(meetings, startDate, endDate);
      
      // Cache the result
      this.analyticsCache.set(cacheKey, {
        data: analytics,
        timestamp: Date.now()
      });

      return analytics;
    } catch (error) {
      console.error('Error generating analytics:', error);
      throw error;
    }
  }

  // Calculate detailed analytics from meetings data
  async calculateAnalytics(meetings, startDate, endDate) {
    const analytics = {
      overview: this.calculateOverviewMetrics(meetings),
      byType: this.calculateTypeMetrics(meetings),
      byPlatform: this.calculatePlatformMetrics(meetings),
      byTime: this.calculateTimeMetrics(meetings),
      byUser: this.calculateUserMetrics(meetings),
      trends: this.calculateTrends(meetings, startDate, endDate),
      efficiency: this.calculateEfficiencyMetrics(meetings),
      engagement: this.calculateEngagementMetrics(meetings)
    };

    return analytics;
  }

  // Calculate overview metrics
  calculateOverviewMetrics(meetings) {
    const totalMeetings = meetings.length;
    const totalDuration = meetings.reduce((sum, meeting) => sum + (meeting.duration || 0), 0);
    const totalAttendees = meetings.reduce((sum, meeting) => 
      sum + meeting.attendees.length + meeting.externalAttendees.length, 0);
    
    const completedMeetings = meetings.filter(m => m.status === 'completed').length;
    const cancelledMeetings = meetings.filter(m => m.status === 'cancelled').length;
    
    const averageDuration = totalMeetings > 0 ? totalDuration / totalMeetings : 0;
    const averageAttendees = totalMeetings > 0 ? totalAttendees / totalMeetings : 0;
    const completionRate = totalMeetings > 0 ? (completedMeetings / totalMeetings) * 100 : 0;
    const cancellationRate = totalMeetings > 0 ? (cancelledMeetings / totalMeetings) * 100 : 0;

    return {
      totalMeetings,
      totalDuration,
      totalAttendees,
      averageDuration: Math.round(averageDuration),
      averageAttendees: Math.round(averageAttendees * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
      cancellationRate: Math.round(cancellationRate * 10) / 10,
      completedMeetings,
      cancelledMeetings
    };
  }

  // Calculate metrics by meeting type
  calculateTypeMetrics(meetings) {
    const typeMetrics = {};
    
    meetings.forEach(meeting => {
      if (!typeMetrics[meeting.type]) {
        typeMetrics[meeting.type] = {
          count: 0,
          totalDuration: 0,
          totalAttendees: 0,
          averageDuration: 0,
          averageAttendees: 0,
          completionRate: 0,
          cancelledCount: 0
        };
      }
      
      const metrics = typeMetrics[meeting.type];
      metrics.count++;
      metrics.totalDuration += meeting.duration || 0;
      metrics.totalAttendees += meeting.attendees.length + meeting.externalAttendees.length;
      
      if (meeting.status === 'cancelled') {
        metrics.cancelledCount++;
      }
    });

    // Calculate averages and rates
    Object.keys(typeMetrics).forEach(type => {
      const metrics = typeMetrics[type];
      metrics.averageDuration = metrics.count > 0 ? Math.round(metrics.totalDuration / metrics.count) : 0;
      metrics.averageAttendees = metrics.count > 0 ? Math.round((metrics.totalAttendees / metrics.count) * 10) / 10 : 0;
      metrics.completionRate = metrics.count > 0 ? Math.round(((metrics.count - metrics.cancelledCount) / metrics.count) * 100 * 10) / 10 : 0;
    });

    return typeMetrics;
  }

  // Calculate metrics by platform
  calculatePlatformMetrics(meetings) {
    const platformMetrics = {};
    
    meetings.forEach(meeting => {
      const platform = meeting.location?.platform || 'physical';
      
      if (!platformMetrics[platform]) {
        platformMetrics[platform] = {
          count: 0,
          totalDuration: 0,
          totalAttendees: 0,
          averageDuration: 0,
          averageAttendees: 0,
          usageRate: 0
        };
      }
      
      const metrics = platformMetrics[platform];
      metrics.count++;
      metrics.totalDuration += meeting.duration || 0;
      metrics.totalAttendees += meeting.attendees.length + meeting.externalAttendees.length;
    });

    const totalMeetings = meetings.length;
    
    // Calculate averages and usage rates
    Object.keys(platformMetrics).forEach(platform => {
      const metrics = platformMetrics[platform];
      metrics.averageDuration = metrics.count > 0 ? Math.round(metrics.totalDuration / metrics.count) : 0;
      metrics.averageAttendees = metrics.count > 0 ? Math.round((metrics.totalAttendees / metrics.count) * 10) / 10 : 0;
      metrics.usageRate = totalMeetings > 0 ? Math.round((metrics.count / totalMeetings) * 100 * 10) / 10 : 0;
    });

    return platformMetrics;
  }

  // Calculate time-based metrics
  calculateTimeMetrics(meetings) {
    const timeMetrics = {
      byHour: {},
      byDay: {},
      byWeek: {},
      peakHours: [],
      peakDays: []
    };

    meetings.forEach(meeting => {
      const startTime = new Date(meeting.startTime);
      const hour = startTime.getHours();
      const day = startTime.toLocaleDateString('en-US', { weekday: 'long' });
      const week = this.getWeekNumber(startTime);

      // By hour
      if (!timeMetrics.byHour[hour]) {
        timeMetrics.byHour[hour] = 0;
      }
      timeMetrics.byHour[hour]++;

      // By day
      if (!timeMetrics.byDay[day]) {
        timeMetrics.byDay[day] = 0;
      }
      timeMetrics.byDay[day]++;

      // By week
      if (!timeMetrics.byWeek[week]) {
        timeMetrics.byWeek[week] = 0;
      }
      timeMetrics.byWeek[week]++;
    });

    // Find peak hours and days
    timeMetrics.peakHours = Object.entries(timeMetrics.byHour)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    timeMetrics.peakDays = Object.entries(timeMetrics.byDay)
      .sort(([,a], [,b]) => b - a)
      .map(([day, count]) => ({ day, count }));

    return timeMetrics;
  }

  // Calculate user-based metrics
  calculateUserMetrics(meetings) {
    const userMetrics = {
      topOrganizers: [],
      topAttendees: [],
      userEngagement: {}
    };

    const organizerStats = {};
    const attendeeStats = {};

    meetings.forEach(meeting => {
      // Organizer stats
      const organizerId = meeting.organizer._id.toString();
      if (!organizerStats[organizerId]) {
        organizerStats[organizerId] = {
          userId: meeting.organizer._id,
          name: meeting.organizer.name,
          email: meeting.organizer.email,
          meetingCount: 0,
          totalDuration: 0,
          totalAttendees: 0
        };
      }
      
      organizerStats[organizerId].meetingCount++;
      organizerStats[organizerId].totalDuration += meeting.duration || 0;
      organizerStats[organizerId].totalAttendees += meeting.attendees.length + meeting.externalAttendees.length;

      // Attendee stats
      meeting.attendees.forEach(attendee => {
        if (attendee.user) {
          const attendeeId = attendee.user._id.toString();
          if (!attendeeStats[attendeeId]) {
            attendeeStats[attendeeId] = {
              userId: attendee.user._id,
              name: attendee.user.name,
              email: attendee.user.email,
              meetingCount: 0,
              totalDuration: 0,
              acceptedCount: 0,
              declinedCount: 0
            };
          }
          
          attendeeStats[attendeeId].meetingCount++;
          attendeeStats[attendeeId].totalDuration += meeting.duration || 0;
          
          if (attendee.status === 'accepted') {
            attendeeStats[attendeeId].acceptedCount++;
          } else if (attendee.status === 'declined') {
            attendeeStats[attendeeId].declinedCount++;
          }
        }
      });
    });

    // Sort and limit results
    userMetrics.topOrganizers = Object.values(organizerStats)
      .sort((a, b) => b.meetingCount - a.meetingCount)
      .slice(0, 10);

    userMetrics.topAttendees = Object.values(attendeeStats)
      .sort((a, b) => b.meetingCount - a.meetingCount)
      .slice(0, 10);

    // Calculate engagement rates
    Object.keys(attendeeStats).forEach(userId => {
      const stats = attendeeStats[userId];
      stats.engagementRate = stats.meetingCount > 0 ? 
        Math.round((stats.acceptedCount / stats.meetingCount) * 100 * 10) / 10 : 0;
    });

    return userMetrics;
  }

  // Calculate trends over time
  calculateTrends(meetings, startDate, endDate) {
    const trends = {
      daily: {},
      weekly: {},
      monthly: {},
      growthRate: 0,
      durationTrend: 0,
      attendanceTrend: 0
    };

    // Group meetings by time periods
    meetings.forEach(meeting => {
      const date = new Date(meeting.startTime);
      const dayKey = date.toISOString().split('T')[0];
      const weekKey = this.getWeekKey(date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Daily trends
      if (!trends.daily[dayKey]) {
        trends.daily[dayKey] = { count: 0, duration: 0, attendees: 0 };
      }
      trends.daily[dayKey].count++;
      trends.daily[dayKey].duration += meeting.duration || 0;
      trends.daily[dayKey].attendees += meeting.attendees.length + meeting.externalAttendees.length;

      // Weekly trends
      if (!trends.weekly[weekKey]) {
        trends.weekly[weekKey] = { count: 0, duration: 0, attendees: 0 };
      }
      trends.weekly[weekKey].count++;
      trends.weekly[weekKey].duration += meeting.duration || 0;
      trends.weekly[weekKey].attendees += meeting.attendees.length + meeting.externalAttendees.length;

      // Monthly trends
      if (!trends.monthly[monthKey]) {
        trends.monthly[monthKey] = { count: 0, duration: 0, attendees: 0 };
      }
      trends.monthly[monthKey].count++;
      trends.monthly[monthKey].duration += meeting.duration || 0;
      trends.monthly[monthKey].attendees += meeting.attendees.length + meeting.externalAttendees.length;
    });

    // Calculate growth rates
    const dailyValues = Object.values(trends.daily).map(d => d.count);
    if (dailyValues.length > 1) {
      const firstHalf = dailyValues.slice(0, Math.floor(dailyValues.length / 2));
      const secondHalf = dailyValues.slice(Math.floor(dailyValues.length / 2));
      
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      trends.growthRate = firstAvg > 0 ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100 * 10) / 10 : 0;
    }

    return trends;
  }

  // Calculate efficiency metrics
  calculateEfficiencyMetrics(meetings) {
    const efficiency = {
      averagePreparationTime: 0,
      onTimeStartRate: 0,
      durationAccuracy: 0,
      resourceUtilization: 0
    };

    let totalPreparationTime = 0;
    let onTimeStarts = 0;
    let durationAccuracySum = 0;
    let totalResourceTime = 0;

    meetings.forEach(meeting => {
      // Calculate preparation time (time between creation and start)
      if (meeting.createdAt && meeting.startTime) {
        const prepTime = new Date(meeting.startTime) - new Date(meeting.createdAt);
        totalPreparationTime += prepTime;
      }

      // Check if meeting started on time
      if (meeting.analytics?.actualStartTime) {
        const scheduledStart = new Date(meeting.startTime);
        const actualStart = new Date(meeting.analytics.actualStartTime);
        const timeDiff = Math.abs(actualStart - scheduledStart);
        
        if (timeDiff <= 5 * 60 * 1000) { // 5 minutes tolerance
          onTimeStarts++;
        }
      }

      // Calculate duration accuracy
      if (meeting.analytics?.actualDuration && meeting.duration) {
        const accuracy = 1 - Math.abs(meeting.analytics.actualDuration - meeting.duration) / meeting.duration;
        durationAccuracySum += Math.max(0, accuracy);
      }

      // Calculate resource utilization
      const totalAttendees = meeting.attendees.length + meeting.externalAttendees.length;
      totalResourceTime += (meeting.duration || 0) * totalAttendees;
    });

    const totalMeetings = meetings.length;
    
    if (totalMeetings > 0) {
      efficiency.averagePreparationTime = Math.round(totalPreparationTime / totalMeetings / (1000 * 60 * 60 * 24)); // days
      efficiency.onTimeStartRate = Math.round((onTimeStarts / totalMeetings) * 100 * 10) / 10;
      efficiency.durationAccuracy = Math.round((durationAccuracySum / totalMeetings) * 100 * 10) / 10;
      efficiency.resourceUtilization = Math.round(totalResourceTime / (1000 * 60 * 60)); // hours
    }

    return efficiency;
  }

  // Calculate engagement metrics
  calculateEngagementMetrics(meetings) {
    const engagement = {
      averageResponseRate: 0,
      averageAttendanceRate: 0,
      averageRating: 0,
      feedbackRate: 0
    };

    let totalResponseRate = 0;
    let totalAttendanceRate = 0;
    let totalRating = 0;
    let totalFeedback = 0;
    let meetingsWithFeedback = 0;

    meetings.forEach(meeting => {
      const totalAttendees = meeting.attendees.length + meeting.externalAttendees.length;
      
      if (totalAttendees > 0) {
        // Calculate response rate
        const respondedAttendees = meeting.attendees.filter(a => 
          ['accepted', 'declined', 'tentative'].includes(a.status)
        ).length;
        totalResponseRate += (respondedAttendees / totalAttendees) * 100;

        // Calculate attendance rate
        const attendedCount = meeting.attendees.filter(a => a.status === 'accepted').length;
        totalAttendanceRate += (attendedCount / totalAttendees) * 100;
      }

      // Calculate average rating
      if (meeting.feedback && meeting.feedback.length > 0) {
        const meetingRating = meeting.feedback.reduce((sum, fb) => sum + fb.rating, 0) / meeting.feedback.length;
        totalRating += meetingRating;
        totalFeedback += meeting.feedback.length;
        meetingsWithFeedback++;
      }
    });

    const totalMeetings = meetings.length;
    
    if (totalMeetings > 0) {
      engagement.averageResponseRate = Math.round((totalResponseRate / totalMeetings) * 10) / 10;
      engagement.averageAttendanceRate = Math.round((totalAttendanceRate / totalMeetings) * 10) / 10;
      engagement.feedbackRate = Math.round((meetingsWithFeedback / totalMeetings) * 100 * 10) / 10;
    }

    if (meetingsWithFeedback > 0) {
      engagement.averageRating = Math.round((totalRating / meetingsWithFeedback) * 10) / 10;
    }

    return engagement;
  }

  // Helper methods
  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  getWeekKey(date) {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${String(week).padStart(2, '0')}`;
  }

  // Generate report data
  async generateReport(organizationId, startDate, endDate, reportType = 'comprehensive') {
    const analytics = await this.generateAnalytics(organizationId, startDate, endDate);
    
    switch (reportType) {
      case 'overview':
        return {
          overview: analytics.overview,
          byType: analytics.byType,
          byPlatform: analytics.byPlatform
        };
      case 'efficiency':
        return {
          efficiency: analytics.efficiency,
          engagement: analytics.engagement,
          trends: analytics.trends
        };
      case 'user':
        return {
          byUser: analytics.byUser,
          engagement: analytics.engagement
        };
      case 'comprehensive':
      default:
        return analytics;
    }
  }

  // Clear cache
  clearCache() {
    this.analyticsCache.clear();
  }

  // Get cache status
  getCacheStatus() {
    return {
      size: this.analyticsCache.size,
      keys: Array.from(this.analyticsCache.keys())
    };
  }
}

module.exports = new MeetingAnalyticsService();
