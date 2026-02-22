const mongoose = require('mongoose');

/**
 * RoleTransitionRequest Model
 * Manages manual role change approvals (teacher → head_teacher, etc.)
 */
const roleTransitionRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  currentRole: {
    type: String,
    required: true
  },
  requestedRole: {
    type: String,
    required: true
  },
  requestType: {
    type: String,
    enum: ['add_role', 'change_role', 'remove_role'],
    required: true
  },
  reason: {
    type: String, // Why the role change is requested
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
    index: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewComments: {
    type: String // Admin comments on approval/rejection
  },
  // Additional context
  metadata: {
    type: mongoose.Schema.Types.Mixed // Store additional context (department, class assignments, etc.)
  }
});

// Index for efficient queries
roleTransitionRequestSchema.index({ orgId: 1, status: 1 });
roleTransitionRequestSchema.index({ userId: 1, status: 1 });

// Static method to create transition request
roleTransitionRequestSchema.statics.createRequest = async function(data) {
  const {
    userId,
    orgId,
    tenantId,
    currentRole,
    requestedRole,
    requestType,
    reason,
    requestedBy,
    metadata
  } = data;
  
  // Check if there's already a pending request for this user
  const existingRequest = await this.findOne({
    userId,
    status: 'pending',
    requestedRole
  });
  
  if (existingRequest) {
    throw new Error('A pending request for this role already exists');
  }
  
  return await this.create({
    userId,
    orgId,
    tenantId,
    currentRole,
    requestedRole,
    requestType,
    reason,
    requestedBy,
    metadata
  });
};

// Method to approve request
roleTransitionRequestSchema.methods.approve = async function(reviewedBy, comments) {
  this.status = 'approved';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = Date.now();
  this.reviewComments = comments;
  await this.save();
  
  // Update user's role(s) based on request type
  const User = mongoose.model('User');
  const user = await User.findById(this.userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (this.requestType === 'add_role') {
    // Add role to user's roles array
    if (!user.roles) {
      user.roles = [];
    }
    user.roles.push({
      role: this.requestedRole,
      assignedAt: Date.now(),
      assignedBy: reviewedBy,
      status: 'active'
    });
  } else if (this.requestType === 'change_role') {
    // Update primary role
    user.role = this.requestedRole;
    // Also add to roles array if not already present
    if (!user.roles) {
      user.roles = [];
    }
    const roleExists = user.roles.some(r => r.role === this.requestedRole);
    if (!roleExists) {
      user.roles.push({
        role: this.requestedRole,
        assignedAt: Date.now(),
        assignedBy: reviewedBy,
        status: 'active'
      });
    }
  } else if (this.requestType === 'remove_role') {
    // Remove role from roles array
    if (user.roles) {
      user.roles = user.roles.filter(r => r.role !== this.requestedRole);
    }
  }
  
  await user.save();
  return this;
};

// Method to reject request
roleTransitionRequestSchema.methods.reject = async function(reviewedBy, comments) {
  this.status = 'rejected';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = Date.now();
  this.reviewComments = comments;
  await this.save();
  return this;
};

const RoleTransitionRequest = mongoose.model('RoleTransitionRequest', roleTransitionRequestSchema);

module.exports = RoleTransitionRequest;
