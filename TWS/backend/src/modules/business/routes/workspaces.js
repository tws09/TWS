const express = require('express');
const mongoose = require('mongoose');
const { body, query, param } = require('express-validator');
const { authenticateToken } = require('../../../middleware/auth/auth');
const ErrorHandler = require('../../../middleware/common/errorHandler');
const ValidationMiddleware = require('../../../middleware/validation/validation');
const Workspace = require('../../../models/Workspace');
const User = require('../../../models/User');
// Messaging feature removed - Chat model disabled
// const Chat = require('../../../models/Chat');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all workspaces for the authenticated user
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Development mode: Return mock workspaces if database is not available
  if (process.env.NODE_ENV !== 'production' && !mongoose.connection.readyState) {
    const mockWorkspaces = [
      {
        _id: 'mock-workspace-1',
        name: 'Development Workspace',
        description: 'A workspace for development and testing',
        type: 'internal',
        slug: 'development-workspace',
        orgId: req.user.orgId,
        ownerId: {
          _id: req.user.id,
          fullName: req.user.fullName,
          email: req.user.email
        },
        members: [{
          userId: {
            _id: req.user.id,
            fullName: req.user.fullName,
            email: req.user.email
          },
          role: 'owner',
          joinedAt: new Date(),
          status: 'active'
        }],
        settings: {
          allowGuestAccess: false,
          defaultChannel: 'general',
          timezone: 'UTC'
        },
        usage: {
          boards: 3,
          members: 1,
          storage: 1024
        },
        analytics: {
          completionRate: 85,
          avgTaskCompletionTime: 2.5,
          memberActivity: {}
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date()
      }
    ];

    return res.json({
      success: true,
      message: 'Workspaces retrieved successfully (development mode)',
      data: {
        workspaces: mockWorkspaces,
        pagination: {
          page,
          limit,
          total: mockWorkspaces.length,
          pages: Math.ceil(mockWorkspaces.length / limit)
        }
      }
    });
  }

  // Find workspaces where user is a member
  const workspaces = await Workspace.find({
    $or: [
      { ownerId: req.user.id },
      { 'members.userId': req.user.id, 'members.status': 'active' }
    ],
    status: 'active'
  })
    .populate('ownerId', 'fullName email profilePicUrl')
    .populate('members.userId', 'fullName email profilePicUrl')
    .populate('members.invitedBy', 'fullName')
    .skip(skip)
    .limit(limit)
    .sort({ updatedAt: -1 });

  const total = await Workspace.countDocuments({
    $or: [
      { ownerId: req.user.id },
      { 'members.userId': req.user.id, 'members.status': 'active' }
    ],
    status: 'active'
  });

  res.json({
    success: true,
    data: {
      workspaces,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// Get workspace by ID
router.get('/:id', [
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id)
    .populate('ownerId', 'fullName email profilePicUrl')
    .populate('members.userId', 'fullName email profilePicUrl')
    .populate('members.invitedBy', 'fullName');

  if (!workspace) {
    return res.status(404).json({
      success: false,
      message: 'Workspace not found'
    });
  }

  // Check if user has access to this workspace
  if (!workspace.isMember(req.user.id) && !workspace.isOwner(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this workspace'
    });
  }

  res.json({
    success: true,
    data: { workspace }
  });
}));

// Create new workspace
router.post('/', [
  body('name').notEmpty().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('type').optional().isIn(['internal', 'client', 'partner', 'agency'])
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { name, description, type = 'internal' } = req.body;

  // Development mode: Return mock workspace if database is not available
  if (process.env.NODE_ENV !== 'production' && !mongoose.connection.readyState) {
    const mockWorkspace = {
      _id: 'mock-workspace-' + Date.now(),
      name,
      description,
      type,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      orgId: req.user.orgId,
      ownerId: req.user.id,
      members: [{
        userId: req.user.id,
        role: 'owner',
        joinedAt: new Date(),
        status: 'active'
      }],
      settings: {
        allowGuestAccess: false,
        defaultChannel: 'general',
        timezone: 'UTC'
      },
      usage: {
        boards: 0,
        members: 1,
        storage: 0
      },
      analytics: {
        completionRate: 0,
        avgTaskCompletionTime: 0,
        memberActivity: {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return res.status(201).json({
      success: true,
      message: 'Workspace created successfully (development mode)',
      data: { workspace: mockWorkspace }
    });
  }

  // Generate unique slug
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let slug = baseSlug;
  let counter = 1;
  
  while (await Workspace.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const workspace = new Workspace({
    orgId: req.user.orgId,
    name,
    slug,
    description,
    type,
    ownerId: req.user.id,
    members: [{
      userId: req.user.id,
      role: 'owner',
      joinedAt: new Date(),
      status: 'active'
    }]
  });

  await workspace.save();

  // Create default channels - DISABLED: Messaging feature removed
  // const defaultChannels = [
  //   { name: 'general', description: 'General discussion for the workspace', isPrivate: false },
  //   { name: 'announcements', description: 'Important announcements and updates', isPrivate: false }
  // ];

  // for (const channelData of defaultChannels) {
  //   const channel = new Chat({
  //     name: channelData.name,
  //     type: 'channel',
  //     description: channelData.description,
  //     workspaceId: workspace._id,
  //     organization: req.user.orgId,
  //     createdBy: req.user.id,
  //     isPrivate: channelData.isPrivate,
  //     members: [{
  //       user: req.user.id,
  //       role: 'owner',
  //       joinedAt: new Date()
  //     }]
  //   });
  //   await channel.save();
  // }

  await workspace.populate('ownerId', 'fullName email profilePicUrl');
  await workspace.populate('members.userId', 'fullName email profilePicUrl');

  res.status(201).json({
    success: true,
    message: 'Workspace created successfully',
    data: { workspace }
  });
}));

// Update workspace
router.patch('/:id', [
  param('id').isMongoId(),
  body('name').optional().notEmpty().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('color').optional().isHexColor()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    return res.status(404).json({
      success: false,
      message: 'Workspace not found'
    });
  }

  // Check if user can update workspace
  if (!workspace.isAdmin(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions to update workspace'
    });
  }

  const updates = req.body;
  delete updates.ownerId; // Prevent changing owner
  delete updates.members; // Use separate endpoints for member management

  // Update slug if name changed
  if (updates.name && updates.name !== workspace.name) {
    const baseSlug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    let counter = 1;
    
    while (await Workspace.findOne({ slug, _id: { $ne: workspace._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    updates.slug = slug;
  }

  const updatedWorkspace = await Workspace.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  )
    .populate('ownerId', 'fullName email profilePicUrl')
    .populate('members.userId', 'fullName email profilePicUrl')
    .populate('members.invitedBy', 'fullName');

  res.json({
    success: true,
    message: 'Workspace updated successfully',
    data: { workspace: updatedWorkspace }
  });
}));

// Delete workspace
router.delete('/:id', [
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    return res.status(404).json({
      success: false,
      message: 'Workspace not found'
    });
  }

  // Only owner can delete workspace
  if (!workspace.isOwner(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Only workspace owner can delete the workspace'
    });
  }

  // Archive all channels in the workspace - DISABLED: Messaging feature removed
  // await Chat.updateMany(
  //   { workspaceId: workspace._id },
  //   { 
  //     isArchived: true, 
  //     archivedAt: new Date(), 
  //     archivedBy: req.user.id 
  //   }
  // );

  // Archive the workspace
  workspace.status = 'archived';
  workspace.archived = true;
  workspace.archivedAt = new Date();
  await workspace.save();

  res.json({
    success: true,
    message: 'Workspace deleted successfully'
  });
}));

// Invite member to workspace
router.post('/:id/invite', [
  param('id').isMongoId(),
  body('email').isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'member'])
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { email, role = 'member' } = req.body;
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    return res.status(404).json({
      success: false,
      message: 'Workspace not found'
    });
  }

  // Check if user can invite members
  if (!workspace.canInviteMembers(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions to invite members'
    });
  }

  // Find user by email
  const user = await User.findOne({ email, orgId: req.user.orgId });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found in organization'
    });
  }

  // Check if user is already a member
  if (workspace.isMember(user._id)) {
    return res.status(400).json({
      success: false,
      message: 'User is already a member of this workspace'
    });
  }

  // Check workspace member limit
  if (!workspace.canAddMember()) {
    return res.status(400).json({
      success: false,
      message: 'Workspace member limit reached'
    });
  }

  // Add member to workspace
  await workspace.addMember(user._id, role, req.user.id);

  // Add user to default channels - DISABLED: Messaging feature removed
  // const defaultChannels = await Chat.find({
  //   workspaceId: workspace._id,
  //   type: 'channel',
  //   isPrivate: false
  // });

  // for (const channel of defaultChannels) {
  //   await channel.addMember(user._id, 'member');
  // }

  await workspace.populate('members.userId', 'fullName email profilePicUrl');
  await workspace.populate('members.invitedBy', 'fullName');

  res.json({
    success: true,
    message: 'Member invited successfully',
    data: { workspace }
  });
}));

// Remove member from workspace
router.delete('/:id/members/:userId', [
  param('id').isMongoId(),
  param('userId').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    return res.status(404).json({
      success: false,
      message: 'Workspace not found'
    });
  }

  // Check if user can manage members
  if (!workspace.isAdmin(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions to remove members'
    });
  }

  const targetUserId = req.params.userId;

  // Prevent removing workspace owner
  if (workspace.isOwner(targetUserId)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot remove workspace owner'
    });
  }

  // Remove member from workspace
  await workspace.removeMember(targetUserId);

  // Remove user from all channels in the workspace
  await Chat.updateMany(
    { workspaceId: workspace._id },
    { $pull: { members: { user: targetUserId } } }
  );

  await workspace.populate('members.userId', 'fullName email profilePicUrl');
  await workspace.populate('members.invitedBy', 'fullName');

  res.json({
    success: true,
    message: 'Member removed successfully',
    data: { workspace }
  });
}));

// Update member role
router.patch('/:id/members/:userId', [
  param('id').isMongoId(),
  param('userId').isMongoId(),
  body('role').isIn(['admin', 'member'])
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { role } = req.body;
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    return res.status(404).json({
      success: false,
      message: 'Workspace not found'
    });
  }

  // Check if user can manage members
  if (!workspace.isAdmin(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions to update member roles'
    });
  }

  const targetUserId = req.params.userId;

  // Prevent changing workspace owner role
  if (workspace.isOwner(targetUserId)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot change workspace owner role'
    });
  }

  // Update member role
  await workspace.updateMemberRole(targetUserId, role);

  await workspace.populate('members.userId', 'fullName email profilePicUrl');
  await workspace.populate('members.invitedBy', 'fullName');

  res.json({
    success: true,
    message: 'Member role updated successfully',
    data: { workspace }
  });
}));

// Get workspace channels
router.get('/:id/channels', [
  param('id').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    return res.status(404).json({
      success: false,
      message: 'Workspace not found'
    });
  }

  // Check if user has access to this workspace
  if (!workspace.isMember(req.user.id) && !workspace.isOwner(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this workspace'
    });
  }

  // DISABLED: Messaging feature removed
  // const channels = await Chat.findChannelsInWorkspace(workspace._id, req.user.id);

  res.json({
    success: true,
    data: { channels: [] } // Return empty array since messaging is disabled
  });
}));

module.exports = router;
