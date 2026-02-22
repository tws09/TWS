const mongoose = require('mongoose');
const crypto = require('crypto');

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  jobTitle: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  hireDate: {
    type: Date,
    required: true
  },
  contractType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'intern'],
    default: 'full-time'
  },
  salary: {
    base: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    payFrequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'annually'],
      default: 'monthly'
    },
    components: [{
      name: String,
      amount: Number,
      type: {
        type: String,
        enum: ['allowance', 'deduction', 'bonus', 'commission', 'overtime', 'benefit'],
        default: 'allowance'
      },
      isRecurring: {
        type: Boolean,
        default: true
      },
      effectiveDate: Date,
      endDate: Date
    }],
    bonuses: [{
      type: {
        type: String,
        enum: ['performance', 'annual', 'project', 'retention', 'signing', 'referral'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      description: String,
      awardedDate: {
        type: Date,
        default: Date.now
      },
      awardedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'paid'],
        default: 'pending'
      }
    }],
    totalCompensation: {
      type: Number,
      default: function() {
        return this.salary.base + (this.salary.components?.reduce((sum, comp) => sum + (comp.amount || 0), 0) || 0);
      }
    }
  },
  bankDetails: {
    accountNumber: {
      type: String,
      encrypted: true
    },
    bankName: String,
    routingNumber: {
      type: String,
      encrypted: true
    },
    accountType: {
      type: String,
      enum: ['checking', 'savings']
    }
  },
  taxId: {
    type: String,
    encrypted: true
  },
  documents: [{
    fileId: String,
    fileName: String,
    fileUrl: String,
    type: {
      type: String,
      enum: ['contract', 'id', 'certificate', 'other']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    version: {
      type: Number,
      default: 1
    }
  }],
  leaveBalance: {
    annual: {
      type: Number,
      default: 20
    },
    sick: {
      type: Number,
      default: 10
    },
    personal: {
      type: Number,
      default: 5
    }
  },
  performanceNotes: [{
    date: Date,
    note: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    category: {
      type: String,
      enum: ['technical', 'soft', 'language', 'certification'],
      default: 'technical'
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedDate: Date
  }],
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  probationEndDate: Date,
  status: {
    type: String,
    enum: ['active', 'probation', 'terminated', 'on-leave', 'resigned', 'retired'],
    default: 'active'
  },
  benefits: {
    healthInsurance: {
      type: Boolean,
      default: false
    },
    dentalInsurance: {
      type: Boolean,
      default: false
    },
    visionInsurance: {
      type: Boolean,
      default: false
    },
    retirementPlan: {
      type: Boolean,
      default: false
    },
    lifeInsurance: {
      type: Boolean,
      default: false
    },
    disabilityInsurance: {
      type: Boolean,
      default: false
    },
    flexibleSpendingAccount: {
      type: Boolean,
      default: false
    },
    healthSavingsAccount: {
      type: Boolean,
      default: false
    },
    stockOptions: {
      type: Boolean,
      default: false
    },
    equityShares: {
      type: Number,
      default: 0
    }
  },
  // Software House Attendance Engine: category drives punch rules, reports, approvals
  attendanceCategory: {
    type: String,
    enum: ['fixed_shift', 'flexible_shift', 'field_worker', 'remote_worker', 'hybrid_worker', 'exempt'],
    default: 'hybrid_worker'
  },
  isAttendanceExempt: {
    type: Boolean,
    default: false
  },
  workSchedule: {
    type: {
      type: String,
      enum: ['standard', 'flexible', 'remote', 'hybrid', 'shift'],
      default: 'standard'
    },
    hoursPerWeek: {
      type: Number,
      default: 40
    },
    workDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: String,
    endTime: String,
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  performanceMetrics: {
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    lastReviewDate: Date,
    nextReviewDate: Date,
    goals: [{
      title: String,
      description: String,
      targetDate: Date,
      status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed', 'cancelled'],
        default: 'not-started'
      },
      progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    }],
    competencies: [{
      name: String,
      level: {
        type: Number,
        min: 1,
        max: 5
      },
      assessedDate: Date,
      assessedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    // Enhanced productivity tracking
    productivityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 75
    },
    billableUtilization: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    revenueGenerated: {
      type: Number,
      default: 0
    },
    costPerHour: {
      type: Number,
      default: 0
    },
    lastCalculated: {
      type: Date,
      default: Date.now
    }
  },
  careerDevelopment: {
    careerLevel: {
      type: String,
      enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'principal', 'director', 'executive'],
      default: 'entry'
    },
    promotionEligibility: {
      type: Boolean,
      default: false
    },
    nextPromotionDate: Date,
    careerPath: String,
    mentorship: {
      isMentor: {
        type: Boolean,
        default: false
      },
      isMentee: {
        type: Boolean,
        default: false
      },
      mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      menteeIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }
  },
  compliance: {
    backgroundCheck: {
      status: {
        type: String,
        enum: ['pending', 'passed', 'failed'],
        default: 'pending'
      },
      completedDate: Date,
      expiryDate: Date
    },
    drugTest: {
      status: {
        type: String,
        enum: ['pending', 'passed', 'failed'],
        default: 'pending'
      },
      completedDate: Date,
      expiryDate: Date
    },
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date,
      status: {
        type: String,
        enum: ['active', 'expired', 'pending'],
        default: 'active'
      }
    }]
  }
}, {
  timestamps: true
});

// Index for performance
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ userId: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ organizationId: 1 });
employeeSchema.index({ orgId: 1 });

// Encrypt sensitive fields
employeeSchema.pre('save', function(next) {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  
  if (this.isModified('bankDetails.accountNumber') && this.bankDetails.accountNumber) {
    const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
    let encrypted = cipher.update(this.bankDetails.accountNumber, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    this.bankDetails.accountNumber = encrypted;
  }
  
  if (this.isModified('bankDetails.routingNumber') && this.bankDetails.routingNumber) {
    const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
    let encrypted = cipher.update(this.bankDetails.routingNumber, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    this.bankDetails.routingNumber = encrypted;
  }
  
  if (this.isModified('taxId') && this.taxId) {
    const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
    let encrypted = cipher.update(this.taxId, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    this.taxId = encrypted;
  }
  
  next();
});

// Decrypt sensitive fields when retrieving
employeeSchema.methods.decryptSensitiveData = function() {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  
  if (this.bankDetails.accountNumber) {
    const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
    let decrypted = decipher.update(this.bankDetails.accountNumber, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    this.bankDetails.accountNumber = decrypted;
  }
  
  if (this.bankDetails.routingNumber) {
    const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
    let decrypted = decipher.update(this.bankDetails.routingNumber, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    this.bankDetails.routingNumber = decrypted;
  }
  
  if (this.taxId) {
    const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
    let decrypted = decipher.update(this.taxId, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    this.taxId = decrypted;
  }
  
  return this;
};

module.exports = mongoose.model('Employee', employeeSchema);
