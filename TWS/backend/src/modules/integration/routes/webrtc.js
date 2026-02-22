const express = require('express');
const { body, param } = require('express-validator');
const { authenticateToken } = require('../../../middleware/auth/auth');
const ErrorHandler = require('../../../middleware/common/errorHandler');
const ValidationMiddleware = require('../../../middleware/validation/validation');
const webrtcService = require('../../../services/integrations/webrtc.service');
const Workspace = require('../../../models/Workspace');
// Chat model removed - messaging features have been removed
// const Chat = require('../../../models/Chat');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get ICE server configuration
router.get('/ice-servers', ErrorHandler.asyncHandler(async (req, res) => {
  const iceServers = webrtcService.getIceServers();
  
  res.json({
    success: true,
    data: { iceServers }
  });
}));

// Get call statistics
router.get('/stats', ErrorHandler.asyncHandler(async (req, res) => {
  const stats = webrtcService.getCallStats();
  
  res.json({
    success: true,
    data: { stats }
  });
}));

// Initiate a call
router.post('/call/initiate', [
  body('targetUserId').isMongoId(),
  body('callType').optional().isIn(['audio', 'video']),
  body('workspaceId').optional().isMongoId(),
  body('channelId').optional().isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { targetUserId, callType = 'video', workspaceId, channelId } = req.body;

  // Verify workspace access if provided
  if (workspaceId) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || (!workspace.isMember(req.user.id) && !workspace.isOwner(req.user.id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this workspace'
      });
    }
  }

  // Messaging features have been removed - channel validation disabled
  // NOTE: channelId is ignored since messaging features are removed
  if (channelId) {
    console.warn('⚠️ channelId provided but messaging features have been removed. Channel validation skipped.');
  }

  // Generate call ID
  const callId = webrtcService.generateCallId();

  // Emit call initiation event
  const io = req.app.get('io');
  if (io) {
    io.emit('webrtc:call:initiate', {
      callId,
      callerId: req.user.id,
      targetUserId,
      callType,
      workspaceId,
      channelId
    });
  }

  res.json({
    success: true,
    message: 'Call initiated successfully',
    data: { callId }
  });
}));

// Join a group call
router.post('/call/join', [
  body('callId').notEmpty(),
  body('workspaceId').optional().isMongoId(),
  body('channelId').optional().isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { callId, workspaceId, channelId } = req.body;

  // Verify workspace access if provided
  if (workspaceId) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || (!workspace.isMember(req.user.id) && !workspace.isOwner(req.user.id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this workspace'
      });
    }
  }

  // Messaging features have been removed - channel validation disabled
  // NOTE: channelId is ignored since messaging features are removed
  if (channelId) {
    console.warn('⚠️ channelId provided but messaging features have been removed. Channel validation skipped.');
  }

  // Emit group call join event
  const io = req.app.get('io');
  if (io) {
    io.emit('webrtc:group:join', {
      callId,
      userId: req.user.id,
      workspaceId,
      channelId
    });
  }

  res.json({
    success: true,
    message: 'Joined group call successfully',
    data: { callId }
  });
}));

// Leave a call
router.post('/call/leave', [
  body('callId').notEmpty()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { callId } = req.body;

  // Emit call leave event
  const io = req.app.get('io');
  if (io) {
    io.emit('webrtc:call:leave', {
      callId,
      userId: req.user.id
    });
  }

  res.json({
    success: true,
    message: 'Left call successfully'
  });
}));

// End a call
router.post('/call/end', [
  body('callId').notEmpty()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { callId } = req.body;

  // Emit call end event
  const io = req.app.get('io');
  if (io) {
    io.emit('webrtc:call:end', {
      callId,
      userId: req.user.id
    });
  }

  res.json({
    success: true,
    message: 'Call ended successfully'
  });
}));

// Start screen sharing
router.post('/screen/start', [
  body('callId').notEmpty()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { callId } = req.body;

  // Emit screen share start event
  const io = req.app.get('io');
  if (io) {
    io.emit('webrtc:screen:start', {
      callId,
      userId: req.user.id
    });
  }

  res.json({
    success: true,
    message: 'Screen sharing started successfully'
  });
}));

// Stop screen sharing
router.post('/screen/stop', [
  body('callId').notEmpty()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { callId } = req.body;

  // Emit screen share stop event
  const io = req.app.get('io');
  if (io) {
    io.emit('webrtc:screen:stop', {
      callId,
      userId: req.user.id
    });
  }

  res.json({
    success: true,
    message: 'Screen sharing stopped successfully'
  });
}));

// Get TURN server configuration (for production)
router.get('/turn-config', ErrorHandler.asyncHandler(async (req, res) => {
  // In production, you would generate temporary TURN credentials
  // For now, return the basic configuration
  const turnConfig = {
    iceServers: webrtcService.getIceServers(),
    iceCandidatePoolSize: 10
  };

  res.json({
    success: true,
    data: { turnConfig }
  });
}));

// WebRTC connection test endpoint
router.post('/test-connection', [
  body('targetUserId').isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;

  // This endpoint can be used to test WebRTC connectivity
  // without actually starting a call
  const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    success: true,
    message: 'Connection test initiated',
    data: { testId }
  });
}));

// Get active calls for user
router.get('/calls/active', ErrorHandler.asyncHandler(async (req, res) => {
  const stats = webrtcService.getCallStats();
  
  // In a real implementation, you would filter calls by user
  // For now, return general stats
  res.json({
    success: true,
    data: { 
      activeCalls: stats.activeCalls,
      connectedUsers: stats.connectedUsers
    }
  });
}));

// WebRTC fallback to external services
router.get('/fallback-options', ErrorHandler.asyncHandler(async (req, res) => {
  const fallbackOptions = {
    jitsi: {
      enabled: process.env.JITSI_ENABLED === 'true',
      domain: process.env.JITSI_DOMAIN || 'meet.jit.si',
      roomPrefix: process.env.JITSI_ROOM_PREFIX || 'tws-'
    },
    twilio: {
      enabled: process.env.TWILIO_ENABLED === 'true',
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      apiKey: process.env.TWILIO_API_KEY,
      apiSecret: process.env.TWILIO_API_SECRET
    },
    zoom: {
      enabled: process.env.ZOOM_ENABLED === 'true',
      apiKey: process.env.ZOOM_API_KEY,
      apiSecret: process.env.ZOOM_API_SECRET
    }
  };

  res.json({
    success: true,
    data: { fallbackOptions }
  });
}));

// Create external meeting room (Jitsi/Zoom fallback)
router.post('/external-meeting', [
  body('type').isIn(['jitsi', 'zoom']),
  body('roomName').optional().isString(),
  body('workspaceId').optional().isMongoId(),
  body('channelId').optional().isMongoId()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { type, roomName, workspaceId, channelId } = req.body;

  let meetingUrl = '';
  let meetingId = '';

  if (type === 'jitsi') {
    const jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si';
    const roomPrefix = process.env.JITSI_ROOM_PREFIX || 'tws-';
    meetingId = roomName || `${roomPrefix}${Date.now()}`;
    meetingUrl = `https://${jitsiDomain}/${meetingId}`;
  } else if (type === 'zoom') {
    // In a real implementation, you would create a Zoom meeting via API
    meetingId = `zoom_${Date.now()}`;
    meetingUrl = `https://zoom.us/j/${meetingId}`;
  }

  res.json({
    success: true,
    message: 'External meeting created successfully',
    data: {
      type,
      meetingId,
      meetingUrl,
      workspaceId,
      channelId
    }
  });
}));

module.exports = router;
