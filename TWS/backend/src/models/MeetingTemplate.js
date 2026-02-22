const mongoose = require('mongoose');

const meetingTemplateSchema = new mongoose.Schema({
  name: {
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
  defaultDuration: {
    type: Number, // in minutes
    required: true
  },
  defaultLocation: {
    type: {
      type: String,
      enum: ['physical', 'virtual', 'hybrid'],
      default: 'virtual'
    },
    platform: {
      type: String,
      enum: ['google_meet', 'zoom', 'teams', 'other'],
      default: 'google_meet'
    },
    address: String,
    room: String
  },
  defaultAgenda: [{
    item: String,
    duration: Number,
    presenter: String,
    description: String,
    required: {
      type: Boolean,
      default: false
    }
  }],
  defaultReminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push'],
      default: 'email'
    },
    timeBefore: Number // minutes before meeting
  }],
  requiredAttendees: [{
    role: String,
    department: String,
    required: {
      type: Boolean,
      default: true
    }
  }],
  defaultTags: [String],
  defaultPriority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  defaultVisibility: {
    type: String,
    enum: ['public', 'private', 'team'],
    default: 'team'
  },
  instructions: {
    type: String
  },
  checklist: [{
    item: String,
    required: {
      type: Boolean,
      default: false
    },
    assignee: String
  }],
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
meetingTemplateSchema.index({ organizationId: 1 });
meetingTemplateSchema.index({ type: 1 });
meetingTemplateSchema.index({ isActive: 1 });

// Method to increment usage count
meetingTemplateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Static method to find templates by type
meetingTemplateSchema.statics.findByType = function(type, organizationId) {
  return this.find({
    type,
    organizationId,
    isActive: true
  }).sort({ usageCount: -1 });
};

module.exports = mongoose.model('MeetingTemplate', meetingTemplateSchema);
