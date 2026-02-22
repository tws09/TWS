const mongoose = require('mongoose');

/**
 * SchoolRoleConfig Model
 * Manages school-level role configuration (enable/disable roles, custom labels)
 */
const schoolRoleConfigSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    unique: true,
    index: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  enabledRoles: [{
    role: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true // Display name (e.g., 'Lab Instructor')
    },
    enabled: {
      type: Boolean,
      default: true // School can enable/disable
    },
    customLabel: {
      type: String // Optional: school-specific name (e.g., 'Science Lab Teacher')
    },
    description: {
      type: String // Role description for school admins
    }
  }],
  defaultRoles: {
    type: [String], // Roles enabled by default
    default: ['principal', 'head_teacher', 'teacher', 'student']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Update timestamp on save
schoolRoleConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get or create default config
schoolRoleConfigSchema.statics.getOrCreateDefault = async function(orgId, tenantId) {
  let config = await this.findOne({ orgId });
  
  if (!config) {
    // Default enabled roles for all schools
    const defaultEnabledRoles = [
      { role: 'principal', label: 'Principal', enabled: true },
      { role: 'head_teacher', label: 'Head Teacher', enabled: true },
      { role: 'teacher', label: 'Teacher', enabled: true },
      { role: 'student', label: 'Student', enabled: true },
      { role: 'academic_coordinator', label: 'Academic Coordinator', enabled: false },
      { role: 'counselor', label: 'Counselor', enabled: false },
      { role: 'lab_instructor', label: 'Lab Instructor', enabled: false },
      { role: 'assistant_teacher', label: 'Assistant Teacher', enabled: false },
      { role: 'librarian', label: 'Librarian', enabled: false },
      { role: 'sports_coach', label: 'Sports Coach', enabled: false },
      { role: 'admin_staff', label: 'Admin Staff', enabled: false }
    ];
    
    config = await this.create({
      orgId,
      tenantId,
      enabledRoles: defaultEnabledRoles,
      defaultRoles: ['principal', 'head_teacher', 'teacher', 'student']
    });
  }
  
  return config;
};

// Method to check if role is enabled for this school
schoolRoleConfigSchema.methods.isRoleEnabled = function(role) {
  // Check if role is in default roles (always enabled)
  if (this.defaultRoles.includes(role)) {
    return true;
  }
  
  // Check enabledRoles array
  const roleConfig = this.enabledRoles.find(r => r.role === role);
  return roleConfig ? roleConfig.enabled : false;
};

// Method to get custom label for role
schoolRoleConfigSchema.methods.getRoleLabel = function(role) {
  const roleConfig = this.enabledRoles.find(r => r.role === role);
  if (roleConfig && roleConfig.customLabel) {
    return roleConfig.customLabel;
  }
  if (roleConfig) {
    return roleConfig.label;
  }
  return role; // Fallback to role key
};

const SchoolRoleConfig = mongoose.model('SchoolRoleConfig', schoolRoleConfigSchema);

module.exports = SchoolRoleConfig;
