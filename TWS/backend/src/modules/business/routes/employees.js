const express = require('express');
const { body, query } = require('express-validator');
const { requirePermission } = require('../../../middleware/auth/rbac');
const ErrorHandler = require('../../../middleware/common/errorHandler');
const ValidationMiddleware = require('../../../middleware/validation/validation');
const Employee = require('../../../models/Employee');
const User = require('../../../models/User');
// ✅ IDOR Fix: Resource access validation
const { validateResourceAccess } = require('../../../middleware/security/resourceAccessCheck');

const router = express.Router();

// Get all employees
router.get('/', [
  requirePermission('employees:read'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('department').optional().notEmpty(),
  query('status').optional().isIn(['active', 'probation', 'terminated', 'on-leave'])
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.status) filter.status = req.query.status;

  const employees = await Employee.find(filter)
    .populate('userId', 'fullName email role status')
    .populate('reportingManager', 'fullName email')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Employee.countDocuments(filter);

  res.json({
    success: true,
    data: {
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// Get employee by ID
router.get('/:id', requirePermission('employees:read'), validateResourceAccess('Employee', 'id'), // ✅ IDOR Fix: Validate employee belongs to org
  ErrorHandler.asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('userId', 'fullName email role status')
    .populate('reportingManager', 'fullName email');

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  // Decrypt sensitive data if user has permission
  if (req.user.role === 'hr' || req.user.role === 'admin' || req.user.role === 'owner') {
    employee.decryptSensitiveData();
  }

  res.json({
    success: true,
    data: { employee }
  });
}));

// Create employee
router.post('/', [
  requirePermission('employees:write'),
  body('fullName').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('employeeId').notEmpty().trim(),
  body('jobTitle').notEmpty().trim(),
  body('department').notEmpty().trim(),
  body('password').optional().isLength({ min: 6 }),
  body('salary.base').optional().isNumeric(),
  body('contractType').optional().isIn(['full-time', 'part-time', 'contract', 'intern']),
  body('hireDate').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { 
    fullName, 
    email, 
    employeeId, 
    jobTitle, 
    department, 
    password,
    salary,
    contractType,
    hireDate,
    reportingManager,
    workSchedule,
    benefits,
    skills,
    address,
    emergencyContact,
    phone
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Check if employee ID already exists
  const existingEmployee = await Employee.findOne({ employeeId });
  if (existingEmployee) {
    return res.status(400).json({
      success: false,
      message: 'Employee ID already exists'
    });
  }

  // Ensure the employee gets assigned to the wolfstack organization
  let orgId = req.user.orgId;
  if (!orgId) {
    // Fallback: Find the wolfstack organization
    const Organization = require('../../../models/Organization');
    const wolfstackOrg = await Organization.findOne({ slug: 'wolfstack' });
    if (wolfstackOrg) {
      orgId = wolfstackOrg._id;
    } else {
      return res.status(500).json({
        success: false,
        message: 'Wolfstack organization not found. Please contact administrator.'
      });
    }
  }

  // Create user first (ownership fields injected by middleware)
  const user = new User({
    fullName,
    email,
    phone: req.body.phone,
    password: password || 'tempPassword123',
    role: 'employee',
    orgId: req.body.orgId || orgId,
    status: 'active',
    emailVerified: false,
    createdBy: req.body.createdBy || req.user?._id
  });

  await user.save();

  // Create employee record with comprehensive data (ownership fields injected by middleware)
  const employeeData = {
    userId: user._id,
    employeeId,
    jobTitle,
    department,
    hireDate: hireDate ? new Date(hireDate) : new Date(),
    contractType: contractType || 'full-time',
    orgId: req.body.orgId || orgId,
    createdBy: req.body.createdBy || req.user?._id,
    salary: {
      base: salary?.base || 50000,
      currency: salary?.currency || 'USD',
      payFrequency: salary?.payFrequency || 'monthly',
      components: salary?.components || [],
      bonuses: []
    },
    status: 'active',
    reportingManager: reportingManager || null,
    workSchedule: workSchedule || {
      type: 'standard',
      hoursPerWeek: 40,
      workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'UTC'
    },
    benefits: benefits || {
      healthInsurance: false,
      dentalInsurance: false,
      visionInsurance: false,
      retirementPlan: false,
      lifeInsurance: false,
      disabilityInsurance: false,
      flexibleSpendingAccount: false,
      healthSavingsAccount: false,
      stockOptions: false,
      equityShares: 0
    },
    skills: skills || [],
    address: address || {},
    emergencyContact: emergencyContact || {},
    performanceMetrics: {
      overallRating: 3,
      goals: [],
      competencies: []
    },
    careerDevelopment: {
      careerLevel: 'entry',
      promotionEligibility: false,
      mentorship: {
        isMentor: false,
        isMentee: false
      }
    },
    compliance: {
      backgroundCheck: { status: 'pending' },
      drugTest: { status: 'pending' },
      certifications: []
    }
  };

  const employee = new Employee(employeeData);
  await employee.save();

  // Populate the user data for response
  await employee.populate('userId', 'fullName email role status phone');
  await employee.populate('reportingManager', 'fullName email');

  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: { employee }
  });
}));

// Update employee
router.patch('/:id', [
  requirePermission('employees:write'),
  validateResourceAccess('Employee', 'id'), // ✅ IDOR Fix: Validate employee belongs to org
  body('jobTitle').optional().notEmpty().trim(),
  body('department').optional().notEmpty().trim(),
  body('contractType').optional().isIn(['full-time', 'part-time', 'contract', 'intern']),
  body('salary.base').optional().isNumeric(),
  body('reportingManager').optional().isMongoId(),
  body('status').optional().isIn(['active', 'probation', 'terminated', 'on-leave', 'resigned', 'retired']),
  body('hireDate').optional().isISO8601(),
  body('probationEndDate').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const updates = req.body;
  const employeeId = req.params.id;

  // Handle nested updates properly
  const updateData = {};
  
  // Basic fields
  if (updates.jobTitle) updateData.jobTitle = updates.jobTitle;
  if (updates.department) updateData.department = updates.department;
  if (updates.contractType) updateData.contractType = updates.contractType;
  if (updates.status) updateData.status = updates.status;
  if (updates.hireDate) updateData.hireDate = new Date(updates.hireDate);
  if (updates.probationEndDate) updateData.probationEndDate = new Date(updates.probationEndDate);
  if (updates.reportingManager) updateData.reportingManager = updates.reportingManager;

  // Salary updates
  if (updates.salary) {
    updateData.$set = updateData.$set || {};
    if (updates.salary.base) updateData.$set['salary.base'] = updates.salary.base;
    if (updates.salary.currency) updateData.$set['salary.currency'] = updates.salary.currency;
    if (updates.salary.payFrequency) updateData.$set['salary.payFrequency'] = updates.salary.payFrequency;
    if (updates.salary.components) updateData.$set['salary.components'] = updates.salary.components;
  }

  // Work schedule updates
  if (updates.workSchedule) {
    updateData.$set = updateData.$set || {};
    Object.keys(updates.workSchedule).forEach(key => {
      updateData.$set[`workSchedule.${key}`] = updates.workSchedule[key];
    });
  }

  // Benefits updates
  if (updates.benefits) {
    updateData.$set = updateData.$set || {};
    Object.keys(updates.benefits).forEach(key => {
      updateData.$set[`benefits.${key}`] = updates.benefits[key];
    });
  }

  // Skills updates
  if (updates.skills) {
    updateData.$set = updateData.$set || {};
    updateData.$set['skills'] = updates.skills;
  }

  // Address updates
  if (updates.address) {
    updateData.$set = updateData.$set || {};
    Object.keys(updates.address).forEach(key => {
      updateData.$set[`address.${key}`] = updates.address[key];
    });
  }

  // Emergency contact updates
  if (updates.emergencyContact) {
    updateData.$set = updateData.$set || {};
    Object.keys(updates.emergencyContact).forEach(key => {
      updateData.$set[`emergencyContact.${key}`] = updates.emergencyContact[key];
    });
  }

  // Performance metrics updates
  if (updates.performanceMetrics) {
    updateData.$set = updateData.$set || {};
    Object.keys(updates.performanceMetrics).forEach(key => {
      updateData.$set[`performanceMetrics.${key}`] = updates.performanceMetrics[key];
    });
  }

  // Career development updates
  if (updates.careerDevelopment) {
    updateData.$set = updateData.$set || {};
    Object.keys(updates.careerDevelopment).forEach(key => {
      updateData.$set[`careerDevelopment.${key}`] = updates.careerDevelopment[key];
    });
  }

  // Compliance updates
  if (updates.compliance) {
    updateData.$set = updateData.$set || {};
    Object.keys(updates.compliance).forEach(key => {
      updateData.$set[`compliance.${key}`] = updates.compliance[key];
    });
  }

  const employee = await Employee.findByIdAndUpdate(
    employeeId,
    updateData,
    { new: true, runValidators: true }
  ).populate('userId', 'fullName email role status phone')
   .populate('reportingManager', 'fullName email');

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  res.json({
    success: true,
    message: 'Employee updated successfully',
    data: { employee }
  });
}));

// Get employee documents
router.get('/:id/documents', requirePermission('employees:read'), validateResourceAccess('Employee', 'id'), // ✅ IDOR Fix: Validate employee belongs to org
  ErrorHandler.asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id).select('documents');
  
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  res.json({
    success: true,
    data: { documents: employee.documents }
  });
}));

// Upload document
router.post('/:id/documents', [
  requirePermission('employees:write'),
  validateResourceAccess('Employee', 'id'), // ✅ IDOR Fix: Validate employee belongs to org
  body('fileId').notEmpty(),
  body('fileName').notEmpty(),
  body('fileUrl').notEmpty(),
  body('type').isIn(['contract', 'id', 'certificate', 'other'])
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { fileId, fileName, fileUrl, type } = req.body;

  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  const document = {
    fileId,
    fileName,
    fileUrl,
    type,
    uploadedAt: new Date(),
    version: 1
  };

  employee.documents.push(document);
  await employee.save();

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    data: { document }
  });
}));

// Delete document
router.delete('/:id/documents/:docId', requirePermission('employees:write'), validateResourceAccess('Employee', 'id'), // ✅ IDOR Fix: Validate employee belongs to org
  ErrorHandler.asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  employee.documents = employee.documents.filter(doc => doc._id.toString() !== req.params.docId);
  await employee.save();

  res.json({
    success: true,
    message: 'Document deleted successfully'
  });
}));

// Add performance note
router.post('/:id/performance', [
  requirePermission('employees:write'),
  validateResourceAccess('Employee', 'id'), // ✅ IDOR Fix: Validate employee belongs to org
  body('note').notEmpty().trim(),
  body('rating').optional().isInt({ min: 1, max: 5 })
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { note, rating } = req.body;

  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  const performanceNote = {
    date: new Date(),
    note,
    rating,
    reviewedBy: req.user._id
  };

  employee.performanceNotes.push(performanceNote);
  await employee.save();

  res.status(201).json({
    success: true,
    message: 'Performance note added successfully',
    data: { performanceNote }
  });
}));

// Update leave balance
router.patch('/:id/leave-balance', [
  requirePermission('employees:write'),
  validateResourceAccess('Employee', 'id'), // ✅ IDOR Fix: Validate employee belongs to org
  body('annual').optional().isNumeric(),
  body('sick').optional().isNumeric(),
  body('personal').optional().isNumeric()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { annual, sick, personal } = req.body;

  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  if (annual !== undefined) employee.leaveBalance.annual = annual;
  if (sick !== undefined) employee.leaveBalance.sick = sick;
  if (personal !== undefined) employee.leaveBalance.personal = personal;

  await employee.save();

  res.json({
    success: true,
    message: 'Leave balance updated successfully',
    data: { leaveBalance: employee.leaveBalance }
  });
}));

// Add salary component
router.post('/:id/salary/components', [
  requirePermission('employees:write'),
  body('name').notEmpty().trim(),
  body('amount').isNumeric(),
  body('type').isIn(['allowance', 'deduction', 'bonus', 'commission', 'overtime', 'benefit']),
  body('isRecurring').optional().isBoolean(),
  body('effectiveDate').optional().isISO8601(),
  body('endDate').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { name, amount, type, isRecurring, effectiveDate, endDate } = req.body;

  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  const component = {
    name,
    amount,
    type,
    isRecurring: isRecurring !== undefined ? isRecurring : true,
    effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
    endDate: endDate ? new Date(endDate) : null
  };

  employee.salary.components.push(component);
  await employee.save();

  res.status(201).json({
    success: true,
    message: 'Salary component added successfully',
    data: { component }
  });
}));

// Add bonus
router.post('/:id/salary/bonuses', [
  requirePermission('employees:write'),
  validateResourceAccess('Employee', 'id'), // ✅ IDOR Fix: Validate employee belongs to org
  body('type').isIn(['performance', 'annual', 'project', 'retention', 'signing', 'referral']),
  body('amount').isNumeric(),
  body('description').optional().trim(),
  body('awardedDate').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { type, amount, description, awardedDate } = req.body;

  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  const bonus = {
    type,
    amount,
    description,
    awardedDate: awardedDate ? new Date(awardedDate) : new Date(),
    awardedBy: req.user._id,
    status: 'pending'
  };

  employee.salary.bonuses.push(bonus);
  await employee.save();

  res.status(201).json({
    success: true,
    message: 'Bonus added successfully',
    data: { bonus }
  });
}));

// Update bonus status
router.patch('/:id/salary/bonuses/:bonusId', [
  requirePermission('employees:write'),
  validateResourceAccess('Employee', 'id'), // ✅ IDOR Fix: Validate employee belongs to org
  body('status').isIn(['pending', 'approved', 'paid'])
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id, bonusId } = req.params;

  const employee = await Employee.findById(id);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  const bonus = employee.salary.bonuses.id(bonusId);
  if (!bonus) {
    return res.status(404).json({
      success: false,
      message: 'Bonus not found'
    });
  }

  bonus.status = status;
  await employee.save();

  res.json({
    success: true,
    message: 'Bonus status updated successfully',
    data: { bonus }
  });
}));

// Get salary history
router.get('/:id/salary/history', requirePermission('employees:read'), validateResourceAccess('Employee', 'id'), // ✅ IDOR Fix: Validate employee belongs to org
  ErrorHandler.asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id).select('salary');
  
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  res.json({
    success: true,
    data: {
      salary: employee.salary,
      totalCompensation: employee.salary.base + employee.salary.components.reduce((sum, comp) => sum + comp.amount, 0)
    }
  });
}));

// Update performance metrics
router.patch('/:id/performance', [
  requirePermission('employees:write'),
  validateResourceAccess('Employee', 'id'), // ✅ IDOR Fix: Validate employee belongs to org
  body('overallRating').optional().isInt({ min: 1, max: 5 }),
  body('lastReviewDate').optional().isISO8601(),
  body('nextReviewDate').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { overallRating, lastReviewDate, nextReviewDate } = req.body;

  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  if (overallRating !== undefined) employee.performanceMetrics.overallRating = overallRating;
  if (lastReviewDate) employee.performanceMetrics.lastReviewDate = new Date(lastReviewDate);
  if (nextReviewDate) employee.performanceMetrics.nextReviewDate = new Date(nextReviewDate);

  await employee.save();

  res.json({
    success: true,
    message: 'Performance metrics updated successfully',
    data: { performanceMetrics: employee.performanceMetrics }
  });
}));

// Add performance goal
router.post('/:id/performance/goals', [
  requirePermission('employees:write'),
  validateResourceAccess('Employee', 'id'), // ✅ IDOR Fix: Validate employee belongs to org
  body('title').notEmpty().trim(),
  body('description').optional().trim(),
  body('targetDate').isISO8601(),
  body('progress').optional().isInt({ min: 0, max: 100 })
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { title, description, targetDate, progress } = req.body;

  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  const goal = {
    title,
    description,
    targetDate: new Date(targetDate),
    status: 'not-started',
    progress: progress || 0
  };

  employee.performanceMetrics.goals.push(goal);
  await employee.save();

  res.status(201).json({
    success: true,
    message: 'Performance goal added successfully',
    data: { goal }
  });
}));

// Get dashboard data
router.get('/dashboard', requirePermission('employees:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const timeRange = req.query.timeRange || '30d';
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get basic stats
  const totalEmployees = await Employee.countDocuments();
  const activeEmployees = await Employee.countDocuments({ status: 'active' });
  
  // Get new hires in time range
  const newHires = await Employee.countDocuments({
    hireDate: { $gte: startDate }
  });

  // Get departures in time range
  const departures = await Employee.countDocuments({
    status: { $in: ['terminated', 'resigned'] },
    updatedAt: { $gte: startDate }
  });

  // Calculate average salary
  const salaryAggregation = await Employee.aggregate([
    { $group: { _id: null, averageSalary: { $avg: '$salary.base' } } }
  ]);
  const averageSalary = salaryAggregation.length > 0 ? Math.round(salaryAggregation[0].averageSalary) : 0;

  // Department distribution
  const departmentStats = await Employee.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { name: '$_id', count: 1, _id: 0 } }
  ]);

  // Performance stats
  const performanceStats = await Employee.aggregate([
    { $group: { _id: '$performanceMetrics.overallRating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
    { $project: { rating: '$_id', count: 1, _id: 0 } }
  ]);

  // Recent hires
  const recentHires = await Employee.find({
    hireDate: { $gte: startDate }
  })
    .populate('userId', 'fullName email')
    .sort({ hireDate: -1 })
    .limit(5);

  // Upcoming reviews
  const upcomingReviews = await Employee.find({
    'performanceMetrics.nextReviewDate': { 
      $gte: new Date(),
      $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
    }
  })
    .populate('userId', 'fullName email')
    .sort({ 'performanceMetrics.nextReviewDate': 1 })
    .limit(5);

  // Salary distribution
  const salaryDistribution = await Employee.aggregate([
    {
      $bucket: {
        groupBy: '$salary.base',
        boundaries: [0, 30000, 50000, 75000, 100000, 150000, 200000, Infinity],
        default: '200000+',
        output: {
          count: { $sum: 1 },
          range: { $push: '$salary.base' }
        }
      }
    }
  ]);

  // Skills gaps (simplified)
  const skillsGaps = await Employee.aggregate([
    { $unwind: '$skills' },
    { $match: { 'skills.level': { $in: ['beginner'] } } },
    { $group: { _id: '$skills.name', gapCount: { $sum: 1 } } },
    { $sort: { gapCount: -1 } },
    { $limit: 5 },
    { $project: { skill: '$_id', gapCount: 1, priority: 'High', _id: 0 } }
  ]);

  // Compliance alerts (simplified)
  const complianceAlerts = [];
  
  // Check for expired background checks
  const expiredBackgroundChecks = await Employee.countDocuments({
    'compliance.backgroundCheck.expiryDate': { $lt: new Date() }
  });
  
  if (expiredBackgroundChecks > 0) {
    complianceAlerts.push({
      title: 'Expired Background Checks',
      description: `${expiredBackgroundChecks} employees have expired background checks`
    });
  }

  // Check for expired drug tests
  const expiredDrugTests = await Employee.countDocuments({
    'compliance.drugTest.expiryDate': { $lt: new Date() }
  });
  
  if (expiredDrugTests > 0) {
    complianceAlerts.push({
      title: 'Expired Drug Tests',
      description: `${expiredDrugTests} employees have expired drug tests`
    });
  }

  res.json({
    success: true,
    data: {
      totalEmployees,
      activeEmployees,
      newHires,
      departures,
      averageSalary,
      departmentStats,
      performanceStats,
      recentHires,
      upcomingReviews,
      salaryDistribution,
      skillsGaps,
      complianceAlerts
    }
  });
}));

module.exports = router;
