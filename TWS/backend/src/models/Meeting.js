const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['client_meeting', 'interview', 'team_meeting', 'cross_department', 'performance_review', 'sales_pitch', 'onboarding', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  location: {
    type: {
      type: String,
      enum: ['physical', 'virtual', 'hybrid'],
      default: 'virtual'
    },
    address: String,
    room: String,
    platform: {
      type: String,
      enum: ['google_meet', 'zoom', 'teams', 'other'],
      default: 'google_meet'
    },
    meetingUrl: String,
    meetingId: String,
    passcode: String
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    name: String,
    role: String,
    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined', 'tentative', 'no_show'],
      default: 'invited'
    },
    responseTime: Date,
    reminderSent: {
      type: Boolean,
      default: false
    }
  }],
  externalAttendees: [{
    name: String,
    email: String,
    company: String,
    role: String,
    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined', 'tentative', 'no_show'],
      default: 'invited'
    },
    responseTime: Date
  }],
  agenda: [{
    item: String,
    duration: Number,
    presenter: String,
    description: String
  }],
  meetingTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeetingTemplate'
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push'],
      default: 'email'
    },
    timeBefore: Number, // minutes before meeting
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  }],
  calendarIntegration: {
    googleCalendar: {
      eventId: String,
      synced: {
        type: Boolean,
        default: false
      },
      lastSync: Date
    },
    outlook: {
      eventId: String,
      synced: {
        type: Boolean,
        default: false
      },
      lastSync: Date
    }
  },
  recording: {
    available: {
      type: Boolean,
      default: false
    },
    url: String,
    duration: Number,
    transcript: String,
    summary: String
  },
  notes: {
    type: String
  },
  outcomes: [{
    action: String,
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    }
  }],
  feedback: [{
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: Number,
    endDate: Date,
    occurrences: Number,
    parentMeeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting'
    }
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'team'],
    default: 'team'
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  analytics: {
    actualStartTime: Date,
    actualEndTime: Date,
    actualDuration: Number,
    attendanceRate: Number,
    noShowCount: Number,
    averageRating: Number
  }
}, {
  timestamps: true
});

// Indexes for better performance
meetingSchema.index({ startTime: 1, endTime: 1 });
meetingSchema.index({ organizer: 1 });
meetingSchema.index({ organizationId: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ type: 1 });
meetingSchema.index({ 'attendees.user': 1 });

// Virtual for checking if meeting is in the past
meetingSchema.virtual('isPast').get(function() {
  return this.endTime < new Date();
});

// Virtual for checking if meeting is currently happening
meetingSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.startTime <= now && this.endTime >= now;
});

// Virtual for getting total attendees count
meetingSchema.virtual('totalAttendees').get(function() {
  return this.attendees.length + this.externalAttendees.length;
});

// Pre-save middleware to calculate duration
meetingSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  next();
});

// Method to check if user is an attendee
meetingSchema.methods.isAttendee = function(userId) {
  return this.attendees.some(attendee => 
    attendee.user && attendee.user.toString() === userId.toString()
  );
};

// Method to get attendee by user ID
meetingSchema.methods.getAttendee = function(userId) {
  return this.attendees.find(attendee => 
    attendee.user && attendee.user.toString() === userId.toString()
  );
};

// Method to update attendee status
meetingSchema.methods.updateAttendeeStatus = function(userId, status) {
  const attendee = this.getAttendee(userId);
  if (attendee) {
    attendee.status = status;
    attendee.responseTime = new Date();
    return this.save();
  }
  return Promise.reject(new Error('Attendee not found'));
};

// Static method to find meetings by date range
meetingSchema.statics.findByDateRange = function(startDate, endDate, organizationId) {
  return this.find({
    organizationId,
    startTime: { $gte: startDate },
    endTime: { $lte: endDate }
  }).populate('organizer', 'name email').populate('attendees.user', 'name email');
};

// Static method to find user's meetings
meetingSchema.statics.findUserMeetings = function(userId, startDate, endDate) {
  return this.find({
    $or: [
      { organizer: userId },
      { 'attendees.user': userId }
    ],
    startTime: { $gte: startDate },
    endTime: { $lte: endDate }
  }).populate('organizer', 'name email').populate('attendees.user', 'name email');
};

module.exports = mongoose.model('Meeting', meetingSchema);
