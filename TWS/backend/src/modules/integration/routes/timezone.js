const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth/auth');
const ErrorHandler = require('../../../middleware/common/errorHandler');
const timezoneService = require('../../../services/integrations/timezone.service');

// Get all available timezones
router.get('/all', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const timezones = timezoneService.getAllTimezones();
    
    res.json({
      success: true,
      data: timezones
    });
  } catch (error) {
    console.error('Error getting timezones:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get timezones'
    });
  }
}));

// Get common timezones
router.get('/common', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const timezones = timezoneService.getCommonTimezones();
    
    res.json({
      success: true,
      data: timezones
    });
  } catch (error) {
    console.error('Error getting common timezones:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get common timezones'
    });
  }
}));

// Get timezone info
router.get('/info/:timezone', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { timezone } = req.params;
  
  if (!timezoneService.isValidTimezone(timezone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid timezone'
    });
  }

  try {
    const info = timezoneService.getTimezoneInfo(timezone);
    
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('Error getting timezone info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get timezone info'
    });
  }
}));

// Convert time between timezones
router.post('/convert', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { time, fromTimezone, toTimezone, format } = req.body;
  
  if (!time || !fromTimezone || !toTimezone) {
    return res.status(400).json({
      success: false,
      message: 'Time, fromTimezone, and toTimezone are required'
    });
  }

  if (!timezoneService.isValidTimezone(fromTimezone) || !timezoneService.isValidTimezone(toTimezone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid timezone'
    });
  }

  try {
    const convertedTime = timezoneService.convertTime(time, fromTimezone, toTimezone);
    const formattedTime = timezoneService.formatTime(convertedTime, toTimezone, format);
    
    res.json({
      success: true,
      data: {
        originalTime: time,
        originalTimezone: fromTimezone,
        convertedTime: convertedTime.toISOString(),
        convertedTimezone: toTimezone,
        formattedTime: formattedTime
      }
    });
  } catch (error) {
    console.error('Error converting time:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert time'
    });
  }
}));

// Get current time in a timezone
router.get('/current/:timezone', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { timezone } = req.params;
  const { format } = req.query;
  
  if (!timezoneService.isValidTimezone(timezone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid timezone'
    });
  }

  try {
    const currentTime = timezoneService.getCurrentTime(timezone);
    const formattedTime = timezoneService.formatTime(currentTime, timezone, format);
    
    res.json({
      success: true,
      data: {
        timezone,
        currentTime: currentTime.toISOString(),
        formattedTime: formattedTime
      }
    });
  } catch (error) {
    console.error('Error getting current time:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get current time'
    });
  }
}));

// Find best meeting time across multiple timezones
router.post('/best-meeting-time', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { timezones, duration, preferredStartHour, preferredEndHour } = req.body;
  
  if (!timezones || !Array.isArray(timezones) || timezones.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Timezones array is required'
    });
  }

  // Validate all timezones
  const invalidTimezones = timezones.filter(tz => !timezoneService.isValidTimezone(tz));
  if (invalidTimezones.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid timezones: ${invalidTimezones.join(', ')}`
    });
  }

  try {
    const candidates = timezoneService.findBestMeetingTime(
      timezones,
      duration || 60,
      preferredStartHour || 9,
      preferredEndHour || 17
    );
    
    res.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    console.error('Error finding best meeting time:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find best meeting time'
    });
  }
}));

// Get business hours for a timezone
router.get('/business-hours/:timezone', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { timezone } = req.params;
  
  if (!timezoneService.isValidTimezone(timezone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid timezone'
    });
  }

  try {
    const businessHours = timezoneService.getBusinessHours(timezone);
    
    res.json({
      success: true,
      data: businessHours
    });
  } catch (error) {
    console.error('Error getting business hours:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get business hours'
    });
  }
}));

// Get timezone suggestions based on user location
router.get('/suggestions/:userTimezone', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { userTimezone } = req.params;
  const { limit } = req.query;
  
  if (!timezoneService.isValidTimezone(userTimezone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user timezone'
    });
  }

  try {
    const suggestions = timezoneService.getTimezoneSuggestions(userTimezone, parseInt(limit) || 5);
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error getting timezone suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get timezone suggestions'
    });
  }
}));

// Get timezones by country
router.get('/country/:countryCode', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { countryCode } = req.params;
  
  try {
    const timezones = timezoneService.getTimezonesByCountry(countryCode.toUpperCase());
    
    res.json({
      success: true,
      data: timezones
    });
  } catch (error) {
    console.error('Error getting timezones by country:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get timezones by country'
    });
  }
}));

// Get timezone by coordinates
router.post('/by-coordinates', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude must be numbers'
    });
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates'
    });
  }

  try {
    const timezone = timezoneService.getTimezoneByCoordinates(lat, lng);
    
    res.json({
      success: true,
      data: {
        timezone,
        coordinates: { lat, lng }
      }
    });
  } catch (error) {
    console.error('Error getting timezone by coordinates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get timezone by coordinates'
    });
  }
}));

// Get timezone abbreviations
router.get('/abbreviations', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  try {
    const abbreviations = timezoneService.getTimezoneAbbreviations();
    
    res.json({
      success: true,
      data: abbreviations
    });
  } catch (error) {
    console.error('Error getting timezone abbreviations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get timezone abbreviations'
    });
  }
}));

// Check if two times are in the same day across timezones
router.post('/same-day', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { time1, timezone1, time2, timezone2 } = req.body;
  
  if (!time1 || !timezone1 || !time2 || !timezone2) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  if (!timezoneService.isValidTimezone(timezone1) || !timezoneService.isValidTimezone(timezone2)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid timezone'
    });
  }

  try {
    const isSameDay = timezoneService.isSameDay(time1, timezone1, time2, timezone2);
    
    res.json({
      success: true,
      data: {
        isSameDay,
        time1,
        timezone1,
        time2,
        timezone2
      }
    });
  } catch (error) {
    console.error('Error checking same day:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check same day'
    });
  }
}));

// Get next business day
router.get('/next-business-day/:timezone', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { timezone } = req.params;
  const { date } = req.query;
  
  if (!timezoneService.isValidTimezone(timezone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid timezone'
    });
  }

  try {
    const nextBusinessDay = timezoneService.getNextBusinessDay(timezone, date);
    
    res.json({
      success: true,
      data: {
        timezone,
        nextBusinessDay: nextBusinessDay.toISOString(),
        formattedDate: nextBusinessDay.format('YYYY-MM-DD'),
        dayOfWeek: nextBusinessDay.format('dddd')
      }
    });
  } catch (error) {
    console.error('Error getting next business day:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get next business day'
    });
  }
}));

// Get previous business day
router.get('/previous-business-day/:timezone', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { timezone } = req.params;
  const { date } = req.query;
  
  if (!timezoneService.isValidTimezone(timezone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid timezone'
    });
  }

  try {
    const previousBusinessDay = timezoneService.getPreviousBusinessDay(timezone, date);
    
    res.json({
      success: true,
      data: {
        timezone,
        previousBusinessDay: previousBusinessDay.toISOString(),
        formattedDate: previousBusinessDay.format('YYYY-MM-DD'),
        dayOfWeek: previousBusinessDay.format('dddd')
      }
    });
  } catch (error) {
    console.error('Error getting previous business day:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get previous business day'
    });
  }
}));

// Validate timezone
router.get('/validate/:timezone', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { timezone } = req.params;
  
  try {
    const isValid = timezoneService.isValidTimezone(timezone);
    
    res.json({
      success: true,
      data: {
        timezone,
        isValid
      }
    });
  } catch (error) {
    console.error('Error validating timezone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate timezone'
    });
  }
}));

module.exports = router;
