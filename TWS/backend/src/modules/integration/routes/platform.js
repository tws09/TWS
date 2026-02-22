const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth/auth');
const ErrorHandler = require('../../../middleware/common/errorHandler');
const platformIntegration = require('../../../services/integrations/platform-integration.service');

// Create meeting on platform
router.post('/create/:platform', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { platform } = req.params;
  const { meetingId } = req.body;

  const Meeting = require('../../../models/Meeting');
  const meeting = await Meeting.findById(meetingId).populate('organizer');

  if (!meeting) {
    return res.status(404).json({
      success: false,
      message: 'Meeting not found'
    });
  }

  if (meeting.organizer._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  try {
    const platformData = await platformIntegration.createMeeting(meeting, platform);
    
    // Update meeting with platform data
    meeting.location.meetingUrl = platformData.meetingUrl;
    meeting.location.meetingId = platformData.meetingId;
    meeting.location.passcode = platformData.passcode;
    
    if (platformData.dialInNumbers) {
      meeting.location.dialInNumbers = platformData.dialInNumbers;
    }

    await meeting.save();

    res.json({
      success: true,
      message: `Meeting created on ${platform}`,
      data: platformData
    });
  } catch (error) {
    console.error(`Error creating ${platform} meeting:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to create meeting on ${platform}`
    });
  }
}));

// Update meeting on platform
router.put('/update/:platform/:meetingId', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { platform, meetingId } = req.params;

  const Meeting = require('../../../models/Meeting');
  const meeting = await Meeting.findById(meetingId).populate('organizer');

  if (!meeting) {
    return res.status(404).json({
      success: false,
      message: 'Meeting not found'
    });
  }

  if (meeting.organizer._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  try {
    const platformMeetingId = meeting.location.meetingId;
    const result = await platformIntegration.updateMeeting(meeting, platform, platformMeetingId);

    res.json({
      success: true,
      message: `Meeting updated on ${platform}`,
      data: result
    });
  } catch (error) {
    console.error(`Error updating ${platform} meeting:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to update meeting on ${platform}`
    });
  }
}));

// Delete meeting from platform
router.delete('/delete/:platform/:meetingId', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { platform, meetingId } = req.params;

  const Meeting = require('../../../models/Meeting');
  const meeting = await Meeting.findById(meetingId).populate('organizer');

  if (!meeting) {
    return res.status(404).json({
      success: false,
      message: 'Meeting not found'
    });
  }

  if (meeting.organizer._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  try {
    const platformMeetingId = meeting.location.meetingId;
    const accessToken = meeting.organizer[`${platform}AccessToken`];
    
    await platformIntegration.deleteMeeting(platform, platformMeetingId, accessToken);

    // Clear platform data from meeting
    meeting.location.meetingUrl = '';
    meeting.location.meetingId = '';
    meeting.location.passcode = '';
    meeting.location.dialInNumbers = [];

    await meeting.save();

    res.json({
      success: true,
      message: `Meeting deleted from ${platform}`
    });
  } catch (error) {
    console.error(`Error deleting ${platform} meeting:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to delete meeting from ${platform}`
    });
  }
}));

// Get meeting details from platform
router.get('/details/:platform/:meetingId', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { platform, meetingId } = req.params;

  const Meeting = require('../../../models/Meeting');
  const meeting = await Meeting.findById(meetingId).populate('organizer');

  if (!meeting) {
    return res.status(404).json({
      success: false,
      message: 'Meeting not found'
    });
  }

  if (meeting.organizer._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  try {
    const platformMeetingId = meeting.location.meetingId;
    const accessToken = meeting.organizer[`${platform}AccessToken`];
    
    const details = await platformIntegration.getMeetingDetails(platform, platformMeetingId, accessToken);

    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error(`Error getting ${platform} meeting details:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to get meeting details from ${platform}`
    });
  }
}));

// Get meeting participants from platform
router.get('/participants/:platform/:meetingId', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { platform, meetingId } = req.params;

  const Meeting = require('../../../models/Meeting');
  const meeting = await Meeting.findById(meetingId).populate('organizer');

  if (!meeting) {
    return res.status(404).json({
      success: false,
      message: 'Meeting not found'
    });
  }

  if (meeting.organizer._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  try {
    const platformMeetingId = meeting.location.meetingId;
    const accessToken = meeting.organizer[`${platform}AccessToken`];
    
    const participants = await platformIntegration.getMeetingParticipants(platform, platformMeetingId, accessToken);

    res.json({
      success: true,
      data: participants
    });
  } catch (error) {
    console.error(`Error getting ${platform} meeting participants:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to get meeting participants from ${platform}`
    });
  }
}));

// Validate platform credentials
router.post('/validate/:platform', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { platform } = req.params;
  const { credentials } = req.body;

  try {
    const result = await platformIntegration.validateCredentials(platform, credentials);

    res.json({
      success: result.valid,
      message: result.valid ? 'Credentials are valid' : result.error
    });
  } catch (error) {
    console.error(`Error validating ${platform} credentials:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate credentials'
    });
  }
}));

// Get platform status
router.get('/status', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const User = require('../../../models/User');
  const user = await User.findById(req.user._id);

  const status = {
    google_meet: {
      connected: !!(user.googleAccessToken && user.googleRefreshToken),
      expiry: user.googleTokenExpiry
    },
    zoom: {
      connected: !!(user.zoomApiKey && user.zoomApiSecret),
      configured: !!(process.env.ZOOM_API_KEY && process.env.ZOOM_API_SECRET)
    },
    teams: {
      connected: !!(user.microsoftAccessToken && user.microsoftRefreshToken),
      expiry: user.microsoftTokenExpiry
    }
  };

  res.json({
    success: true,
    data: status
  });
}));

// Configure Zoom credentials
router.post('/configure/zoom', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { apiKey, apiSecret } = req.body;

  if (!apiKey || !apiSecret) {
    return res.status(400).json({
      success: false,
      message: 'API key and secret are required'
    });
  }

  try {
    // Validate credentials
    const result = await platformIntegration.validateCredentials('zoom', { apiKey, apiSecret });
    
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Save credentials to user profile
    const User = require('../../../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      zoomApiKey: apiKey,
      zoomApiSecret: apiSecret
    });

    res.json({
      success: true,
      message: 'Zoom credentials configured successfully'
    });
  } catch (error) {
    console.error('Error configuring Zoom credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to configure Zoom credentials'
    });
  }
}));

// Remove Zoom credentials
router.delete('/configure/zoom', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const User = require('../../../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      zoomApiKey: undefined,
      zoomApiSecret: undefined
    });

    res.json({
      success: true,
      message: 'Zoom credentials removed successfully'
    });
  } catch (error) {
    console.error('Error removing Zoom credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove Zoom credentials'
    });
  }
}));

module.exports = router;
