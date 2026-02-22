const mongoose = require('mongoose');

const meetingAnalyticsSchema = new mongoose.Schema({
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  metrics: {
    totalMeetings: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number, // in minutes
      default: 0
    },
    averageDuration: {
      type: Number,
      default: 0
    },
    totalAttendees: {
      type: Number,
      default: 0
    },
    averageAttendees: {
      type: Number,
      default: 0
    },
    noShowRate: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    }
  },
  byType: {
    client_meeting: {
      count: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      attendees: { type: Number, default: 0 }
    },
    interview: {
      count: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      attendees: { type: Number, default: 0 }
    },
    team_meeting: {
      count: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      attendees: { type: Number, default: 0 }
    },
    cross_department: {
      count: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      attendees: { type: Number, default: 0 }
    },
    performance_review: {
      count: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      attendees: { type: Number, default: 0 }
    },
    sales_pitch: {
      count: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      attendees: { type: Number, default: 0 }
    },
    onboarding: {
      count: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      attendees: { type: Number, default: 0 }
    },
    other: {
      count: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      attendees: { type: Number, default: 0 }
    }
  },
  byPlatform: {
    google_meet: {
      count: { type: Number, default: 0 },
      duration: { type: Number, default: 0 }
    },
    zoom: {
      count: { type: Number, default: 0 },
      duration: { type: Number, default: 0 }
    },
    teams: {
      count: { type: Number, default: 0 },
      duration: { type: Number, default: 0 }
    },
    physical: {
      count: { type: Number, default: 0 },
      duration: { type: Number, default: 0 }
    }
  },
  topOrganizers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    meetingCount: Number,
    totalDuration: Number
  }],
  topAttendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    meetingCount: Number,
    totalDuration: Number
  }],
  peakHours: [{
    hour: Number,
    meetingCount: Number
  }],
  peakDays: [{
    day: String,
    meetingCount: Number
  }]
}, {
  timestamps: true
});

// Indexes
meetingAnalyticsSchema.index({ organizationId: 1, date: 1 });
meetingAnalyticsSchema.index({ meetingId: 1 });

// Static method to generate analytics for a date range
meetingAnalyticsSchema.statics.generateAnalytics = async function(organizationId, startDate, endDate) {
  const Meeting = mongoose.model('Meeting');
  
  const meetings = await Meeting.find({
    organizationId,
    startTime: { $gte: startDate },
    endTime: { $lte: endDate }
  }).populate('organizer', 'name').populate('attendees.user', 'name');

  const analytics = {
    organizationId,
    date: startDate,
    metrics: {
      totalMeetings: meetings.length,
      totalDuration: meetings.reduce((sum, meeting) => sum + (meeting.duration || 0), 0),
      totalAttendees: meetings.reduce((sum, meeting) => sum + meeting.attendees.length, 0),
      noShowRate: 0,
      completionRate: 0,
      averageRating: 0
    },
    byType: {},
    byPlatform: {},
    topOrganizers: [],
    topAttendees: [],
    peakHours: [],
    peakDays: []
  };

  // Calculate averages
  if (meetings.length > 0) {
    analytics.metrics.averageDuration = analytics.metrics.totalDuration / meetings.length;
    analytics.metrics.averageAttendees = analytics.metrics.totalAttendees / meetings.length;
  }

  // Group by type and platform
  meetings.forEach(meeting => {
    // By type
    if (!analytics.byType[meeting.type]) {
      analytics.byType[meeting.type] = { count: 0, duration: 0, attendees: 0 };
    }
    analytics.byType[meeting.type].count += 1;
    analytics.byType[meeting.type].duration += meeting.duration || 0;
    analytics.byType[meeting.type].attendees += meeting.attendees.length;

    // By platform
    const platform = meeting.location?.platform || 'physical';
    if (!analytics.byPlatform[platform]) {
      analytics.byPlatform[platform] = { count: 0, duration: 0 };
    }
    analytics.byPlatform[platform].count += 1;
    analytics.byPlatform[platform].duration += meeting.duration || 0;
  });

  return analytics;
};

module.exports = mongoose.model('MeetingAnalytics', meetingAnalyticsSchema);
