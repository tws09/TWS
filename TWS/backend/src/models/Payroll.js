const mongoose = require('mongoose');

const payrollRecordSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  payPeriod: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'quarterly'],
    default: 'monthly'
  },
  components: [{
    name: String,
    amount: Number,
    type: {
      type: String,
      enum: ['earnings', 'deduction', 'tax', 'benefit'],
      default: 'earnings'
    },
    taxable: {
      type: Boolean,
      default: true
    }
  }],
  grossPay: {
    type: Number,
    required: true
  },
  deductions: {
    federalTax: Number,
    stateTax: Number,
    socialSecurity: Number,
    medicare: Number,
    other: Number,
    total: Number
  },
  netPay: {
    type: Number,
    required: true
  },
  hoursWorked: {
    regular: Number,
    overtime: Number,
    total: Number
  },
  overtimeRate: Number,
  hourlyRate: Number,
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'paid', 'cancelled'],
    default: 'draft'
  },
  payslipPdfUrl: String,
  payslipGeneratedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  paidAt: Date,
  paymentMethod: {
    type: String,
    enum: ['bank-transfer', 'check', 'cash'],
    default: 'bank-transfer'
  },
  notes: String,
  attachments: [{
    fileId: String,
    fileName: String,
    fileUrl: String,
    type: String
  }]
}, {
  timestamps: true
});

const payrollRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['tax', 'deduction', 'allowance', 'overtime'],
    required: true
  },
  calculation: {
    method: {
      type: String,
      enum: ['percentage', 'fixed', 'formula'],
      required: true
    },
    value: Number,
    formula: String,
    conditions: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed
    }]
  },
  applicableTo: {
    roles: [String],
    departments: [String],
    employees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }]
  },
  effectiveFrom: Date,
  effectiveTo: Date,
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const payrollCycleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'quarterly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  payDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'completed', 'cancelled'],
    default: 'draft'
  },
  employees: [{
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    included: {
      type: Boolean,
      default: true
    }
  }],
  totalGrossPay: Number,
  totalNetPay: Number,
  totalDeductions: Number,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date
}, {
  timestamps: true
});

// Index for performance
payrollRecordSchema.index({ employeeId: 1, periodStart: 1, periodEnd: 1 });
payrollRecordSchema.index({ status: 1 });
payrollRecordSchema.index({ periodStart: 1, periodEnd: 1 });

payrollRuleSchema.index({ type: 1, active: 1 });
payrollRuleSchema.index({ effectiveFrom: 1, effectiveTo: 1 });

payrollCycleSchema.index({ startDate: 1, endDate: 1 });
payrollCycleSchema.index({ status: 1 });

module.exports = {
  PayrollRecord: mongoose.model('PayrollRecord', payrollRecordSchema),
  PayrollRule: mongoose.model('PayrollRule', payrollRuleSchema),
  PayrollCycle: mongoose.model('PayrollCycle', payrollCycleSchema)
};
