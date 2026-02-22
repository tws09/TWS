const express = require('express');
const { body, query, param } = require('express-validator');
const { requirePermission } = require('../../../middleware/auth/rbac');
const { authenticateToken } = require('../../../middleware/auth/auth');
const ErrorHandler = require('../../../middleware/common/errorHandler');
const ValidationMiddleware = require('../../../middleware/validation/validation');
const {
  ShareClass,
  EquityHolder,
  ShareIssuance,
  VestingSchedule,
  OptionPool,
  OptionGrant,
  ConvertibleInstrument,
  ShareTransfer,
  CompanyEquityStructure
} = require('../../../models/Equity');
const equityCalculationService = require('../../../services/equityCalculationService');
const { User } = require('../../../models/User');

const router = express.Router();

// Helper function to extract orgId from user
const getOrgId = (user) => {
  if (!user) return null;
  let orgId = user.orgId;
  if (orgId && typeof orgId === 'object') {
    orgId = orgId._id || orgId;
  }
  if (orgId && orgId.toString) {
    orgId = orgId.toString();
  }
  return orgId;
};

// ============================================================================
// HEALTH CHECK (for testing - no auth required)
// ============================================================================

// Simple health check endpoint (before auth middleware)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Equity API is working',
    timestamp: new Date().toISOString(),
    routes: 'equity routes loaded successfully'
  });
});

// Apply authentication middleware to all other routes
router.use(authenticateToken);

// ============================================================================
// SEED DATA / POPULATION
// ============================================================================

// Seed equity data for development/demo
router.post('/seed', requirePermission('finance:write'), ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID required',
      debug: {
        user: req.user ? { id: req.user._id, role: req.user.role, orgId: req.user.orgId } : 'not found'
      }
    });
  }

  // Check if data already exists
  const existingHolders = await EquityHolder.countDocuments({ orgId });
  if (existingHolders > 0) {
    return res.status(400).json({
      success: false,
      message: 'Equity data already exists. Use /reset to clear first.'
    });
  }

  try {
    // 1. Create Company Equity Structure
    const structure = new CompanyEquityStructure({
      orgId,
      authorizedShares: 10000000, // 10M
      issuedShares: 0,
      outstandingShares: 0,
      reservedShares: 0,
      parValue: 0.0001,
      lastValuation: {
        amount: 5000000, // $5M pre-money
        date: new Date('2024-01-01'),
        valuationType: 'pre_money'
      }
    });
    await structure.save();

    // 2. Create Share Classes
    const commonClass = new ShareClass({
      name: 'Common Stock',
      type: 'common',
      description: 'Common shares with voting rights',
      rights: {
        voting: true,
        dividend: false,
        liquidationPreference: 1.0,
        participation: false
      },
      orgId
    });
    await commonClass.save();

    const preferredClass = new ShareClass({
      name: 'Preferred Series A',
      type: 'preferred_a',
      description: 'Preferred shares with 1x liquidation preference',
      rights: {
        voting: true,
        dividend: true,
        liquidationPreference: 1.0,
        participation: false,
        antiDilution: 'weighted_average'
      },
      orgId
    });
    await preferredClass.save();

    const optionsClass = new ShareClass({
      name: 'Employee Stock Options',
      type: 'options',
      description: 'Employee stock option pool',
      rights: {
        voting: false,
        dividend: false
      },
      orgId
    });
    await optionsClass.save();

    // 3. Create Equity Holders (Based on worked example)
    const founderA = new EquityHolder({
      name: 'Founder A',
      type: 'founder',
      email: 'founder-a@company.com',
      orgId
    });
    await founderA.save();

    const founderB = new EquityHolder({
      name: 'Founder B',
      type: 'founder',
      email: 'founder-b@company.com',
      orgId
    });
    await founderB.save();

    const founderC = new EquityHolder({
      name: 'Founder C',
      type: 'cofounder',
      email: 'founder-c@company.com',
      orgId
    });
    await founderC.save();

    const investor = new EquityHolder({
      name: 'Seed Investor Fund',
      type: 'investor',
      email: 'investor@fund.com',
      orgId
    });
    await investor.save();

    // 4. Create Share Issuances (Based on worked example)
    const issuance1 = new ShareIssuance({
      issuanceNumber: `ISS-${Date.now()}-1`,
      holderId: founderA._id,
      shareClassId: commonClass._id,
      numberOfShares: 6000000, // 6M shares
      issuePrice: 0.0001,
      issueDate: new Date('2023-01-01'),
      status: 'issued',
      orgId,
      createdBy: req.user?.id
    });
    await issuance1.save();

    const issuance2 = new ShareIssuance({
      issuanceNumber: `ISS-${Date.now()}-2`,
      holderId: founderB._id,
      shareClassId: commonClass._id,
      numberOfShares: 2500000, // 2.5M shares
      issuePrice: 0.0001,
      issueDate: new Date('2023-01-01'),
      status: 'issued',
      orgId,
      createdBy: req.user?.id
    });
    await issuance2.save();

    const issuance3 = new ShareIssuance({
      issuanceNumber: `ISS-${Date.now()}-3`,
      holderId: founderC._id,
      shareClassId: commonClass._id,
      numberOfShares: 1500000, // 1.5M shares
      issuePrice: 0.0001,
      issueDate: new Date('2023-01-01'),
      status: 'issued',
      orgId,
      createdBy: req.user?.id
    });
    await issuance3.save();

    const issuance4 = new ShareIssuance({
      issuanceNumber: `ISS-${Date.now()}-4`,
      holderId: investor._id,
      shareClassId: preferredClass._id,
      numberOfShares: 2000000, // 2M shares (post-money)
      issuePrice: 0.0025, // $0.0025 per share
      issueDate: new Date('2024-01-15'),
      status: 'issued',
      orgId,
      createdBy: req.user?.id
    });
    await issuance4.save();

    // 5. Create Option Pool
    const optionPool = new OptionPool({
      name: 'Employee Option Pool 2024',
      poolSize: 1000000, // 1M shares
      reservedShares: 0,
      grantedShares: 0,
      availableShares: 1000000,
      shareClassId: optionsClass._id,
      creationDate: new Date('2024-01-01'),
      orgId
    });
    await optionPool.save();

    // 6. Create Vesting Schedules
    const vestingSchedule1 = new VestingSchedule({
      name: 'Founder A Vesting',
      holderId: founderA._id,
      issuanceId: issuance1._id,
      grantDate: new Date('2023-01-01'),
      cliffMonths: 12,
      vestingMonths: 48,
      vestingType: 'monthly',
      totalShares: 6000000,
      vestedShares: 1500000, // 25% vested after 1 year
      orgId
    });
    await vestingSchedule1.save();

    // 7. Update Company Structure
    await CompanyEquityStructure.findOneAndUpdate(
      { orgId },
      {
        issuedShares: 12000000, // 6M + 2.5M + 1.5M + 2M
        outstandingShares: 12000000,
        reservedShares: 1000000 // Option pool
      }
    );

    res.json({
      success: true,
      message: 'Equity data seeded successfully',
      data: {
        structure,
        shareClasses: [commonClass, preferredClass, optionsClass],
        holders: [founderA, founderB, founderC, investor],
        issuances: [issuance1, issuance2, issuance3, issuance4],
        optionPool,
        vestingSchedules: [vestingSchedule1]
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding equity data',
      error: error.message
    });
  }
}));

// Reset equity data (for testing)
router.delete('/reset', requirePermission('finance:write'), ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  await Promise.all([
    ShareIssuance.deleteMany({ orgId }),
    VestingSchedule.deleteMany({ orgId }),
    OptionGrant.deleteMany({ orgId }),
    OptionPool.deleteMany({ orgId }),
    ConvertibleInstrument.deleteMany({ orgId }),
    ShareTransfer.deleteMany({ orgId }),
    EquityHolder.deleteMany({ orgId }),
    ShareClass.deleteMany({ orgId }),
    CompanyEquityStructure.deleteMany({ orgId })
  ]);

  res.json({
    success: true,
    message: 'Equity data reset successfully'
  });
}));

// ============================================================================
// COMPANY EQUITY STRUCTURE
// ============================================================================

// Get or create company equity structure
router.get('/structure', requirePermission('finance:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID required'
    });
  }
  
  let structure = await CompanyEquityStructure.findOne({ orgId });
  
  if (!structure) {
    // Create default structure
    structure = new CompanyEquityStructure({
      orgId,
      authorizedShares: 10000000, // 10M default
      issuedShares: 0,
      outstandingShares: 0,
      reservedShares: 0,
      parValue: 0.0001
    });
    await structure.save();
  }

  res.json({
    success: true,
    data: { structure }
  });
}));

// Update company equity structure
router.put('/structure', [
  requirePermission('finance:write'),
  body('authorizedShares').optional().isInt({ min: 0 }),
  body('parValue').optional().isFloat({ min: 0 })
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID required'
    });
  }
  
  const structure = await CompanyEquityStructure.findOneAndUpdate(
    { orgId },
    { ...req.body, lastUpdated: new Date() },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    message: 'Equity structure updated successfully',
    data: { structure }
  });
}));

// ============================================================================
// ANALYTICS & DASHBOARD
// ============================================================================

// Get equity dashboard summary
router.get('/dashboard', requirePermission('finance:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID required'
    });
  }
  
  // Get cap table
  const issuances = await ShareIssuance.find({ orgId, status: { $ne: 'cancelled' } })
    .populate('holderId', 'name type email')
    .populate('shareClassId', 'name type');

  const holdingsMap = new Map();
  issuances.forEach(issuance => {
    const holderId = issuance.holderId._id.toString();
    if (!holdingsMap.has(holderId)) {
      holdingsMap.set(holderId, {
        holderId,
        holderName: issuance.holderId.name,
        type: issuance.holderId.type,
        shares: 0
      });
    }
    holdingsMap.get(holderId).shares += issuance.numberOfShares;
  });

  const holdings = Array.from(holdingsMap.values());
  const capTable = equityCalculationService.calculateCapTable(holdings);

  // Get statistics
  const totalHolders = await EquityHolder.countDocuments({ orgId, isActive: true });
  const totalIssuances = await ShareIssuance.countDocuments({ orgId });
  const activeVestingSchedules = await VestingSchedule.countDocuments({ orgId, status: 'active' });
  const optionPools = await OptionPool.find({ orgId, isActive: true });
  const totalOptionPools = optionPools.reduce((sum, pool) => sum + pool.poolSize, 0);
  const grantedOptions = optionPools.reduce((sum, pool) => sum + pool.grantedShares, 0);
  const structure = await CompanyEquityStructure.findOne({ orgId });

  // Recent activity
  const recentIssuances = await ShareIssuance.find({ orgId })
    .populate('holderId', 'name')
    .populate('shareClassId', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      summary: {
        totalHolders,
        totalIssuances,
        activeVestingSchedules,
        totalOptionPools,
        grantedOptions,
        availableOptions: totalOptionPools - grantedOptions,
        authorizedShares: structure?.authorizedShares || 0,
        issuedShares: structure?.issuedShares || 0,
        outstandingShares: structure?.outstandingShares || 0
      },
      capTable,
      recentActivity: recentIssuances,
      optionPools: optionPools.map(pool => ({
        ...pool.toObject(),
        utilization: pool.poolSize > 0 ? ((pool.grantedShares + pool.reservedShares) / pool.poolSize) * 100 : 0
      }))
    }
  });
}));

// ============================================================================
// SHARE CLASSES
// ============================================================================

// Get all share classes
router.get('/share-classes', requirePermission('finance:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const shareClasses = await ShareClass.find({ orgId, isActive: true }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { shareClasses }
  });
}));

// Get share class by ID
router.get('/share-classes/:id', [
  requirePermission('finance:read'),
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const shareClass = await ShareClass.findOne({ _id: req.params.id, orgId });

  if (!shareClass) {
    return res.status(404).json({
      success: false,
      message: 'Share class not found'
    });
  }

  res.json({
    success: true,
    data: { shareClass }
  });
}));

// Create share class
router.post('/share-classes', [
  requirePermission('finance:write'),
  body('name').notEmpty().trim(),
  body('type').isIn(['common', 'preferred_a', 'preferred_b', 'preferred_c', 'options', 'rsu', 'warrant', 'convertible_note'])
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  const shareClass = new ShareClass({
    ...req.body,
    orgId
  });
  await shareClass.save();

  res.status(201).json({
    success: true,
    message: 'Share class created successfully',
    data: { shareClass }
  });
}));

// Update share class
router.put('/share-classes/:id', [
  requirePermission('finance:write'),
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  const shareClass = await ShareClass.findOneAndUpdate(
    { _id: req.params.id, orgId },
    req.body,
    { new: true }
  );

  if (!shareClass) {
    return res.status(404).json({
      success: false,
      message: 'Share class not found'
    });
  }

  res.json({
    success: true,
    message: 'Share class updated successfully',
    data: { shareClass }
  });
}));

// Delete share class
router.delete('/share-classes/:id', [
  requirePermission('finance:write'),
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  const shareClass = await ShareClass.findOneAndUpdate(
    { _id: req.params.id, orgId },
    { isActive: false },
    { new: true }
  );

  if (!shareClass) {
    return res.status(404).json({
      success: false,
      message: 'Share class not found'
    });
  }

  res.json({
    success: true,
    message: 'Share class deactivated successfully'
  });
}));

// ============================================================================
// EQUITY HOLDERS
// ============================================================================

// Get all equity holders
router.get('/holders', requirePermission('finance:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const holders = await EquityHolder.find({ orgId, isActive: true })
    .populate('userId', 'fullName email')
    .populate('employeeId', 'fullName email')
    .sort({ createdAt: -1 });

  // Get share counts for each holder
  const holdersWithShares = await Promise.all(holders.map(async (holder) => {
    const issuances = await ShareIssuance.find({ 
      holderId: holder._id, 
      status: { $ne: 'cancelled' } 
    });
    const totalShares = issuances.reduce((sum, iss) => sum + iss.numberOfShares, 0);
    
    return {
      ...holder.toObject(),
      totalShares
    };
  }));

  res.json({
    success: true,
    data: { holders: holdersWithShares }
  });
}));

// Get holder by ID
router.get('/holders/:id', [
  requirePermission('finance:read'),
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const holder = await EquityHolder.findOne({ _id: req.params.id, orgId })
    .populate('userId', 'fullName email')
    .populate('employeeId', 'fullName email');

  if (!holder) {
    return res.status(404).json({
      success: false,
      message: 'Equity holder not found'
    });
  }

  // Get all issuances for this holder
  const issuances = await ShareIssuance.find({ holderId: holder._id })
    .populate('shareClassId', 'name type')
    .populate('vestingScheduleId')
    .sort({ issueDate: -1 });

  res.json({
    success: true,
    data: { 
      holder,
      issuances,
      totalShares: issuances.reduce((sum, iss) => sum + (iss.status !== 'cancelled' ? iss.numberOfShares : 0), 0)
    }
  });
}));

// Create equity holder
router.post('/holders', [
  requirePermission('finance:write'),
  body('name').notEmpty().trim(),
  body('type').isIn(['founder', 'cofounder', 'employee', 'investor', 'advisor', 'consultant', 'other'])
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  const holder = new EquityHolder({
    ...req.body,
    orgId
  });
  await holder.save();

  res.status(201).json({
    success: true,
    message: 'Equity holder created successfully',
    data: { holder }
  });
}));

// Update equity holder
router.put('/holders/:id', [
  requirePermission('finance:write'),
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  const holder = await EquityHolder.findOneAndUpdate(
    { _id: req.params.id, orgId },
    req.body,
    { new: true }
  );

  if (!holder) {
    return res.status(404).json({
      success: false,
      message: 'Equity holder not found'
    });
  }

  res.json({
    success: true,
    message: 'Equity holder updated successfully',
    data: { holder }
  });
}));

// Delete equity holder
router.delete('/holders/:id', [
  requirePermission('finance:write'),
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  const holder = await EquityHolder.findOneAndUpdate(
    { _id: req.params.id, orgId },
    { isActive: false },
    { new: true }
  );

  if (!holder) {
    return res.status(404).json({
      success: false,
      message: 'Equity holder not found'
    });
  }

  res.json({
    success: true,
    message: 'Equity holder deactivated successfully'
  });
}));

// ============================================================================
// SHARE ISSUANCES
// ============================================================================

// Get all share issuances
router.get('/issuances', requirePermission('finance:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const { page = 1, limit = 20, holderId, shareClassId, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { orgId };
  if (holderId) filter.holderId = holderId;
  if (shareClassId) filter.shareClassId = shareClassId;
  if (status) filter.status = status;

  const issuances = await ShareIssuance.find(filter)
    .populate('holderId', 'name type email')
    .populate('shareClassId', 'name type')
    .populate('vestingScheduleId')
    .populate('createdBy', 'fullName email')
    .sort({ issueDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ShareIssuance.countDocuments(filter);

  res.json({
    success: true,
    data: { 
      issuances,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// Get issuance by ID
router.get('/issuances/:id', [
  requirePermission('finance:read'),
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const issuance = await ShareIssuance.findOne({ _id: req.params.id, orgId })
    .populate('holderId', 'name type email')
    .populate('shareClassId', 'name type')
    .populate('vestingScheduleId')
    .populate('createdBy', 'fullName email')
    .populate('approvedBy', 'fullName email');

  if (!issuance) {
    return res.status(404).json({
      success: false,
      message: 'Share issuance not found'
    });
  }

  res.json({
    success: true,
    data: { issuance }
  });
}));

// Create share issuance
router.post('/issuances', [
  requirePermission('finance:write'),
  body('holderId').isMongoId(),
  body('shareClassId').isMongoId(),
  body('numberOfShares').isInt({ min: 1 }),
  body('issueDate').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  // Generate issuance number
  const issuanceCount = await ShareIssuance.countDocuments({ orgId });
  const issuanceNumber = `ISS-${Date.now()}-${issuanceCount + 1}`;

  const issuance = new ShareIssuance({
    ...req.body,
    issuanceNumber,
    orgId,
    createdBy: req.user?.id,
    approvedBy: req.user?.id,
    approvalDate: new Date()
  });
  await issuance.save();

  // Update company equity structure
  await CompanyEquityStructure.findOneAndUpdate(
    { orgId },
    {
      $inc: {
        issuedShares: req.body.numberOfShares,
        outstandingShares: req.body.numberOfShares
      }
    }
  );

  // Populate related data
  await issuance.populate('holderId', 'name type');
  await issuance.populate('shareClassId', 'name type');

  res.status(201).json({
    success: true,
    message: 'Share issuance created successfully',
    data: { issuance }
  });
}));

// Update share issuance
router.put('/issuances/:id', [
  requirePermission('finance:write'),
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const oldIssuance = await ShareIssuance.findOne({ _id: req.params.id, orgId });

  if (!oldIssuance) {
    return res.status(404).json({
      success: false,
      message: 'Share issuance not found'
    });
  }

  const issuance = await ShareIssuance.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate('holderId', 'name type').populate('shareClassId', 'name type');

  // Update company structure if shares changed
  if (req.body.numberOfShares && req.body.numberOfShares !== oldIssuance.numberOfShares) {
    const diff = req.body.numberOfShares - oldIssuance.numberOfShares;
    await CompanyEquityStructure.findOneAndUpdate(
      { orgId },
      {
        $inc: {
          issuedShares: diff,
          outstandingShares: diff
        }
      }
    );
  }

  res.json({
    success: true,
    message: 'Share issuance updated successfully',
    data: { issuance }
  });
}));

// Cancel share issuance
router.delete('/issuances/:id', [
  requirePermission('finance:write'),
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const issuance = await ShareIssuance.findOne({ _id: req.params.id, orgId });

  if (!issuance) {
    return res.status(404).json({
      success: false,
      message: 'Share issuance not found'
    });
  }

  issuance.status = 'cancelled';
  await issuance.save();

  // Update company structure
  await CompanyEquityStructure.findOneAndUpdate(
    { orgId },
    {
      $inc: {
        issuedShares: -issuance.numberOfShares,
        outstandingShares: -issuance.numberOfShares
      }
    }
  );

  res.json({
    success: true,
    message: 'Share issuance cancelled successfully'
  });
}));

// ============================================================================
// VESTING SCHEDULES
// ============================================================================

// Get all vesting schedules
router.get('/vesting-schedules', requirePermission('finance:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const schedules = await VestingSchedule.find({ orgId })
    .populate('holderId', 'name type')
    .sort({ grantDate: -1 });

  // Calculate vested shares for each schedule
  const schedulesWithVesting = await Promise.all(schedules.map(async (schedule) => {
    const vestingInfo = equityCalculationService.calculateVestedShares(schedule.toObject());
    return {
      ...schedule.toObject(),
      vestingInfo
    };
  }));

  res.json({
    success: true,
    data: { schedules: schedulesWithVesting }
  });
}));

// Get vesting schedule by ID
router.get('/vesting-schedules/:id', [
  requirePermission('finance:read'),
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const schedule = await VestingSchedule.findOne({ _id: req.params.id, orgId })
    .populate('holderId', 'name type email');

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Vesting schedule not found'
    });
  }

  const vestingInfo = equityCalculationService.calculateVestedShares(schedule.toObject());

  res.json({
    success: true,
    data: { 
      schedule,
      vestingInfo
    }
  });
}));

// Create vesting schedule
router.post('/vesting-schedules', [
  requirePermission('finance:write'),
  body('holderId').isMongoId(),
  body('totalShares').isInt({ min: 1 }),
  body('vestingMonths').isInt({ min: 1 }),
  body('grantDate').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  const schedule = new VestingSchedule({
    ...req.body,
    orgId,
    grantDate: req.body.grantDate || new Date()
  });
  await schedule.save();

  await schedule.populate('holderId', 'name type');

  res.status(201).json({
    success: true,
    message: 'Vesting schedule created successfully',
    data: { schedule }
  });
}));

// Update vesting schedule
router.put('/vesting-schedules/:id', [
  requirePermission('finance:write'),
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const schedule = await VestingSchedule.findOneAndUpdate(
    { _id: req.params.id, orgId },
    req.body,
    { new: true }
  ).populate('holderId', 'name type');

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Vesting schedule not found'
    });
  }

  res.json({
    success: true,
    message: 'Vesting schedule updated successfully',
    data: { schedule }
  });
}));

// Calculate vested shares for a schedule
router.get('/vesting-schedules/:id/vested', [
  requirePermission('finance:read'),
  param('id').isMongoId(),
  query('asOfDate').optional().isISO8601()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const schedule = await VestingSchedule.findOne({ _id: req.params.id, orgId });

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Vesting schedule not found'
    });
  }

  const asOfDate = req.query.asOfDate ? new Date(req.query.asOfDate) : new Date();
  const vestingInfo = equityCalculationService.calculateVestedShares(schedule.toObject(), asOfDate);

  res.json({
    success: true,
    data: { vestingInfo, schedule }
  });
}));

// ============================================================================
// OPTION POOLS
// ============================================================================

// Get all option pools
router.get('/option-pools', requirePermission('finance:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const pools = await OptionPool.find({ orgId, isActive: true })
    .populate('shareClassId', 'name type')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { pools }
  });
}));

// Get option pool by ID
router.get('/option-pools/:id', [
  requirePermission('finance:read'),
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const pool = await OptionPool.findOne({ _id: req.params.id, orgId })
    .populate('shareClassId', 'name type');

  if (!pool) {
    return res.status(404).json({
      success: false,
      message: 'Option pool not found'
    });
  }

  // Get grants from this pool
  const grants = await OptionGrant.find({ optionPoolId: pool._id })
    .populate('holderId', 'name type')
    .sort({ grantDate: -1 });

  res.json({
    success: true,
    data: { 
      pool,
      grants
    }
  });
}));

// Create option pool
router.post('/option-pools', [
  requirePermission('finance:write'),
  body('name').notEmpty().trim(),
  body('poolSize').isInt({ min: 1 }),
  body('shareClassId').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  const pool = new OptionPool({
    ...req.body,
    orgId,
    availableShares: req.body.poolSize - (req.body.reservedShares || 0)
  });
  await pool.save();

  // Update company structure
  await CompanyEquityStructure.findOneAndUpdate(
    { orgId },
    {
      $inc: {
        reservedShares: req.body.poolSize
      }
    }
  );

  await pool.populate('shareClassId', 'name type');

  res.status(201).json({
    success: true,
    message: 'Option pool created successfully',
    data: { pool }
  });
}));

// Update option pool
router.put('/option-pools/:id', [
  requirePermission('finance:write'),
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const pool = await OptionPool.findOneAndUpdate(
    { _id: req.params.id, orgId },
    req.body,
    { new: true }
  ).populate('shareClassId', 'name type');

  if (!pool) {
    return res.status(404).json({
      success: false,
      message: 'Option pool not found'
    });
  }

  // Recalculate available shares
  pool.availableShares = pool.poolSize - pool.reservedShares - pool.grantedShares;
  await pool.save();

  res.json({
    success: true,
    message: 'Option pool updated successfully',
    data: { pool }
  });
}));

// ============================================================================
// CAP TABLE CALCULATIONS
// ============================================================================

// Get cap table with ownership percentages
router.get('/cap-table', requirePermission('finance:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const { includeOptions = 'false', includeConvertibles = 'false' } = req.query;

  // Get all share issuances
  const issuances = await ShareIssuance.find({ orgId, status: { $ne: 'cancelled' } })
    .populate('holderId', 'name type email')
    .populate('shareClassId', 'name type');

  // Aggregate shares by holder
  const holdingsMap = new Map();
  
  issuances.forEach(issuance => {
    const holderId = issuance.holderId._id.toString();
    const holderName = issuance.holderId.name;
    const holderType = issuance.holderId.type;

    if (!holdingsMap.has(holderId)) {
      holdingsMap.set(holderId, {
        holderId,
        holderName,
        type: holderType,
        shares: 0,
        issuances: []
      });
    }

    const holding = holdingsMap.get(holderId);
    holding.shares += issuance.numberOfShares;
    holding.issuances.push(issuance);
  });

  const holdings = Array.from(holdingsMap.values());

  // Calculate cap table
  const capTable = equityCalculationService.calculateCapTable(holdings);

  // Validate
  const validation = equityCalculationService.validateCapTable(capTable);

  // Get fully diluted if requested
  let fullyDiluted = null;
  if (includeOptions === 'true' || includeConvertibles === 'true') {
    const optionGrants = includeOptions === 'true' 
      ? await OptionGrant.find({ orgId, status: { $in: ['granted', 'vesting'] } })
        .populate('holderId', 'name')
      : [];

    const convertibles = includeConvertibles === 'true'
      ? await ConvertibleInstrument.find({ orgId, status: 'issued' })
        .populate('holderId', 'name')
      : [];

    fullyDiluted = equityCalculationService.calculateFullyDilutedCapTable(
      holdings,
      optionGrants,
      convertibles
    );
  }

  res.json({
    success: true,
    data: {
      capTable,
      validation,
      fullyDiluted,
      summary: {
        totalHolders: capTable.length,
        totalShares: validation.totalShares,
        totalOwnership: validation.totalPercent
      }
    }
  });
}));

// Calculate dilution impact
router.post('/dilution/calculate', [
  requirePermission('finance:read'),
  body('currentShares').isInt({ min: 0 }),
  body('preMoneyTotal').isInt({ min: 1 }),
  body('newSharesIssued').isInt({ min: 1 })
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { currentShares, preMoneyTotal, newSharesIssued } = req.body;
  
  const impact = equityCalculationService.calculateDilutionImpact(
    currentShares,
    preMoneyTotal,
    newSharesIssued
  );

  res.json({
    success: true,
    data: { impact }
  });
}));

// Simulate investment round
router.post('/dilution/simulate', [
  requirePermission('finance:read'),
  body('newShares').optional().isInt({ min: 1 }),
  body('targetPercent').optional().isFloat({ min: 0, max: 100 }),
  body('amount').optional().isFloat({ min: 0 }),
  body('preMoneyValuation').optional().isFloat({ min: 0 })
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  // Get current holdings
  const issuances = await ShareIssuance.find({ orgId, status: { $ne: 'cancelled' } })
    .populate('holderId', 'name type');

  const holdingsMap = new Map();
  issuances.forEach(issuance => {
    const holderId = issuance.holderId._id.toString();
    if (!holdingsMap.has(holderId)) {
      holdingsMap.set(holderId, {
        holderId,
        holderName: issuance.holderId.name,
        type: issuance.holderId.type,
        shares: 0
      });
    }
    holdingsMap.get(holderId).shares += issuance.numberOfShares;
  });

  const currentHoldings = Array.from(holdingsMap.values());

  // Simulate round
  const simulation = equityCalculationService.simulateInvestmentRound(
    currentHoldings,
    req.body,
    {
      includeOptionPool: req.body.includeOptionPool || false,
      optionPoolSize: req.body.optionPoolSize || 0
    }
  );

  res.json({
    success: true,
    data: { simulation }
  });
}));

// ============================================================================
// OPTION GRANTS
// ============================================================================

// Get all option grants
router.get('/option-grants', requirePermission('finance:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const grants = await OptionGrant.find({ orgId })
    .populate('holderId', 'name type email')
    .populate('optionPoolId', 'name poolSize')
    .populate('vestingScheduleId')
    .sort({ grantDate: -1 });

  res.json({
    success: true,
    data: { grants }
  });
}));

// Create option grant
router.post('/option-grants', [
  requirePermission('finance:write'),
  body('holderId').isMongoId(),
  body('optionPoolId').isMongoId(),
  body('numberOfOptions').isInt({ min: 1 }),
  body('strikePrice').isFloat({ min: 0 }),
  body('expirationDate').isISO8601(),
  body('vestingScheduleId').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  
  // Check option pool availability
  const pool = await OptionPool.findOne({ _id: req.body.optionPoolId, orgId });
  if (!pool) {
    return res.status(404).json({
      success: false,
      message: 'Option pool not found'
    });
  }

  if (pool.availableShares < req.body.numberOfOptions) {
    return res.status(400).json({
      success: false,
      message: `Insufficient shares in option pool. Available: ${pool.availableShares}, Requested: ${req.body.numberOfOptions}`
    });
  }

  // Generate grant number
  const grantCount = await OptionGrant.countDocuments({ orgId });
  const grantNumber = `OPT-${Date.now()}-${grantCount + 1}`;

  const grant = new OptionGrant({
    ...req.body,
    grantNumber,
    orgId
  });
  await grant.save();

  // Update option pool
  await OptionPool.findByIdAndUpdate(pool._id, {
    $inc: {
      grantedShares: req.body.numberOfOptions,
      availableShares: -req.body.numberOfOptions
    }
  });

  await grant.populate('holderId', 'name type');
  await grant.populate('optionPoolId', 'name');

  res.status(201).json({
    success: true,
    message: 'Option grant created successfully',
    data: { grant }
  });
}));

// ============================================================================
// EXPORT CAP TABLE
// ============================================================================

// Export cap table to CSV/Excel
router.get('/cap-table/export', requirePermission('finance:read'), ErrorHandler.asyncHandler(async (req, res) => {
  const orgId = getOrgId(req.user);
  const { format = 'csv' } = req.query;

  // Get cap table
  const issuances = await ShareIssuance.find({ orgId, status: { $ne: 'cancelled' } })
    .populate('holderId', 'name type email')
    .populate('shareClassId', 'name type');

  const holdingsMap = new Map();
  issuances.forEach(issuance => {
    const holderId = issuance.holderId._id.toString();
    if (!holdingsMap.has(holderId)) {
      holdingsMap.set(holderId, {
        holderName: issuance.holderId.name,
        type: issuance.holderId.type,
        shares: 0
      });
    }
    holdingsMap.get(holderId).shares += issuance.numberOfShares;
  });

  const holdings = Array.from(holdingsMap.values());
  const capTable = equityCalculationService.calculateCapTable(holdings);

  if (format === 'csv') {
    // Generate CSV
    const csvHeaders = 'Holder Name,Type,Shares,Ownership %\n';
    const csvRows = capTable.map(holder => 
      `"${holder.holderName}","${holder.type}",${holder.shares},${holder.ownershipPercent}%`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=cap-table.csv');
    res.send(csvHeaders + csvRows);
  } else {
    // Return JSON
    res.json({
      success: true,
      data: { capTable }
    });
  }
}));

module.exports = router;
