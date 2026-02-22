const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { requireRole, authenticateToken } = require('../../../middleware/auth/auth');
const { requirePermission } = require('../../../middleware/auth/rbac');
const ErrorHandler = require('../../../middleware/common/errorHandler');
const User = require('../../../models/User');
const Employee = require('../../../models/Employee');

// Validation handler - standalone implementation (same as authentication.js)
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const router = express.Router();

// Get all users
router.get('/', [
  requirePermission('users:read'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['owner', 'admin', 'hr', 'finance', 'manager', 'employee', 'contractor', 'auditor']),
  query('status').optional().isIn(['active', 'suspended', 'inactive']),
  handleValidationErrors,
  ErrorHandler.asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;

  const users = await User.find(filter)
    .select('-password -refreshTokens')
    .populate('managerId', 'fullName email')
    .populate('teamIds', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
})
]);

// Get current user's own profile (must be before /:id)
router.get('/profile', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const user = await User.findById(userId)
    .select('-password -refreshTokens')
    .populate('orgId', 'slug name');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        department: user.department,
        jobTitle: user.jobTitle,
        role: user.role,
        profilePicUrl: user.profilePicUrl,
        status: user.status,
        orgId: user.orgId
      }
    }
  });
}));

// Update current user's own profile (must be before /:id)
router.patch('/profile', [
  authenticateToken,
  body('fullName').optional().trim().notEmpty(),
  body('phone').optional().trim(),
  body('department').optional().trim(),
  body('jobTitle').optional().trim(),
  handleValidationErrors,
  ErrorHandler.asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { fullName, phone, department, jobTitle } = req.body;
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    await user.save();
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          department: user.department,
          jobTitle: user.jobTitle,
          role: user.role,
          profilePicUrl: user.profilePicUrl,
          status: user.status
        }
      }
    });
  })
]);

// Get user by ID
router.get('/:id', requirePermission('users:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshTokens')
    .populate('managerId', 'fullName email')
    .populate('teamIds', 'name');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
}));

// Create user (invite)
router.post('/', [
  requirePermission('users:write'),
  body('email').isEmail().normalizeEmail(),
  body('fullName').notEmpty().trim(),
  body('role').isIn(['owner', 'admin', 'hr', 'finance', 'manager', 'employee', 'contractor', 'auditor']),
  body('department').optional().notEmpty(),
  body('jobTitle').optional().notEmpty(),
  body('managerId').optional().isMongoId(),
  handleValidationErrors,
  ErrorHandler.asyncHandler(async (req, res) => {
  const { email, fullName, role, department, jobTitle, managerId } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  // Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-8);

  const user = new User({
    email,
    password: tempPassword,
    fullName,
    role,
    department,
    jobTitle,
    managerId
  });

  await user.save();

  // TODO: Send invitation email with temporary password

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      user: user.toJSON(),
      tempPassword // Remove this in production
    }
  });
})
]);

// Update user
router.patch('/:id', [
  requirePermission('users:write'),
  body('fullName').optional().notEmpty().trim(),
  body('role').optional().isIn(['owner', 'admin', 'hr', 'finance', 'manager', 'employee', 'contractor', 'auditor']),
  body('status').optional().isIn(['active', 'suspended', 'inactive']),
  body('department').optional().notEmpty(),
  body('jobTitle').optional().notEmpty(),
  body('managerId').optional().isMongoId(),
  body('teamIds').optional().isArray(),
  handleValidationErrors,
  ErrorHandler.asyncHandler(async (req, res) => {
  const updates = req.body;
  delete updates.password; // Prevent password updates through this route
  delete updates.email; // Prevent email updates

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
})
]);

// Delete user
router.delete('/:id', requirePermission('users:write'), ErrorHandler.asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if user has any associated data
  const employee = await Employee.findOne({ userId: user._id });
  if (employee) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete user with employee record. Please delete employee record first.'
    });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// Get user's teams
router.get('/:id/teams', requirePermission('users:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('teamIds', 'name description members')
    .select('teamIds');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: { teams: user.teamIds }
  });
}));

// Update user's teams
router.patch('/:id/teams', [
  requirePermission('users:write'),
  body('teamIds').isArray(),
  handleValidationErrors,
  ErrorHandler.asyncHandler(async (req, res) => {
  const { teamIds } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { teamIds },
    { new: true }
  ).select('-password -refreshTokens');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User teams updated successfully',
    data: { user }
  });
})
]);

module.exports = router;
