const express = require('express');
const { authenticateToken } = require('../../../middleware/auth/auth');
const ErrorHandler = require('../../../middleware/common/errorHandler');
const Card = require('../../../models/Card');
const Project = require('../../../models/Project');

const router = express.Router();

// Start time tracking for a card
router.post('/start', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { cardId } = req.body;
  const { _id: userId } = req.user;

  if (!cardId) {
    return res.status(400).json({
      success: false,
      message: 'Card ID is required'
    });
  }

  const card = await Card.findById(cardId);
  if (!card) {
    return res.status(404).json({
      success: false,
      message: 'Card not found'
    });
  }

  // Check if user is already tracking time for this card
  const existingEntry = card.timeTracking.entries.find(entry => 
    entry.userId.toString() === userId.toString() && !entry.end
  );

  if (existingEntry) {
    return res.status(400).json({
      success: false,
      message: 'Time tracking already started for this card'
    });
  }

  // Add new time entry
  card.timeTracking.entries.push({
    userId,
    start: new Date(),
    billable: true
  });

  await card.save();

  res.json({
    success: true,
    message: 'Time tracking started',
    data: card.timeTracking.entries[card.timeTracking.entries.length - 1]
  });
}));

// Stop time tracking for a card
router.post('/stop', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { cardId, description } = req.body;
  const { _id: userId } = req.user;

  if (!cardId) {
    return res.status(400).json({
      success: false,
      message: 'Card ID is required'
    });
  }

  const card = await Card.findById(cardId);
  if (!card) {
    return res.status(404).json({
      success: false,
      message: 'Card not found'
    });
  }

  // Find the active time entry
  const activeEntry = card.timeTracking.entries.find(entry => 
    entry.userId.toString() === userId.toString() && !entry.end
  );

  if (!activeEntry) {
    return res.status(400).json({
      success: false,
      message: 'No active time tracking found for this card'
    });
  }

  // Calculate duration
  const endTime = new Date();
  const duration = Math.round((endTime - activeEntry.start) / (1000 * 60)); // minutes

  // Update the entry
  activeEntry.end = endTime;
  activeEntry.minutes = duration;
  activeEntry.description = description || '';

  // Update total actual hours
  card.timeTracking.actualHours = card.timeTracking.entries
    .filter(entry => entry.end)
    .reduce((total, entry) => total + (entry.minutes || 0), 0) / 60;

  await card.save();

  res.json({
    success: true,
    message: 'Time tracking stopped',
    data: activeEntry
  });
}));

// Get time entries for a card
router.get('/card/:cardId', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const { _id: userId } = req.user;

  const card = await Card.findById(cardId)
    .populate('timeTracking.entries.userId', 'fullName email');

  if (!card) {
    return res.status(404).json({
      success: false,
      message: 'Card not found'
    });
  }

  // Filter entries based on user role/permissions
  let entries = card.timeTracking.entries;
  
  // If user is not admin/manager, only show their own entries
  if (!['super_admin', 'org_manager', 'pmo', 'project_manager'].includes(req.user.role)) {
    entries = entries.filter(entry => entry.userId._id.toString() === userId.toString());
  }

  res.json({
    success: true,
    data: {
      cardId: card._id,
      estimatedHours: card.timeTracking.estimatedHours,
      actualHours: card.timeTracking.actualHours,
      entries: entries.sort((a, b) => new Date(b.start) - new Date(a.start))
    }
  });
}));

// Get time entries for a project
router.get('/project/:projectId', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { _id: userId } = req.user;

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Get all cards for the project with time tracking
  const cards = await Card.find({ projectId })
    .populate('timeTracking.entries.userId', 'fullName email')
    .select('title timeTracking');

  // Aggregate time data
  const timeData = {
    totalEstimatedHours: 0,
    totalActualHours: 0,
    totalBillableHours: 0,
    entries: [],
    byUser: {},
    byCard: []
  };

  cards.forEach(card => {
    timeData.totalEstimatedHours += card.timeTracking.estimatedHours || 0;
    timeData.totalActualHours += card.timeTracking.actualHours || 0;

    card.timeTracking.entries.forEach(entry => {
      if (entry.end) {
        const hours = entry.minutes / 60;
        timeData.totalBillableHours += entry.billable ? hours : 0;
        
        timeData.entries.push({
          ...entry.toObject(),
          cardTitle: card.title,
          cardId: card._id
        });

        // Group by user
        const userId = entry.userId._id.toString();
        if (!timeData.byUser[userId]) {
          timeData.byUser[userId] = {
            user: entry.userId,
            totalHours: 0,
            billableHours: 0,
            entries: []
          };
        }
        timeData.byUser[userId].totalHours += hours;
        timeData.byUser[userId].billableHours += entry.billable ? hours : 0;
        timeData.byUser[userId].entries.push(entry);
      }
    });

    timeData.byCard.push({
      cardId: card._id,
      cardTitle: card.title,
      estimatedHours: card.timeTracking.estimatedHours || 0,
      actualHours: card.timeTracking.actualHours || 0,
      entries: card.timeTracking.entries.filter(entry => entry.end)
    });
  });

  res.json({
    success: true,
    data: timeData
  });
}));

// Update time entry
router.put('/entry/:entryId', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { entryId } = req.params;
  const { description, billable, minutes } = req.body;
  const { _id: userId } = req.user;

  const card = await Card.findOne({
    'timeTracking.entries._id': entryId
  });

  if (!card) {
    return res.status(404).json({
      success: false,
      message: 'Time entry not found'
    });
  }

  const entry = card.timeTracking.entries.id(entryId);
  
  // Check permissions - users can only edit their own entries unless they're admin/manager
  if (entry.userId.toString() !== userId.toString() && 
      !['super_admin', 'org_manager', 'pmo', 'project_manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Permission denied'
    });
  }

  // Update entry
  if (description !== undefined) entry.description = description;
  if (billable !== undefined) entry.billable = billable;
  if (minutes !== undefined) entry.minutes = minutes;

  // Recalculate total actual hours
  card.timeTracking.actualHours = card.timeTracking.entries
    .filter(entry => entry.end)
    .reduce((total, entry) => total + (entry.minutes || 0), 0) / 60;

  await card.save();

  res.json({
    success: true,
    message: 'Time entry updated',
    data: entry
  });
}));

// Delete time entry
router.delete('/entry/:entryId', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { entryId } = req.params;
  const { _id: userId } = req.user;

  const card = await Card.findOne({
    'timeTracking.entries._id': entryId
  });

  if (!card) {
    return res.status(404).json({
      success: false,
      message: 'Time entry not found'
    });
  }

  const entry = card.timeTracking.entries.id(entryId);
  
  // Check permissions
  if (entry.userId.toString() !== userId.toString() && 
      !['super_admin', 'org_manager', 'pmo', 'project_manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Permission denied'
    });
  }

  // Remove entry
  card.timeTracking.entries.pull(entryId);

  // Recalculate total actual hours
  card.timeTracking.actualHours = card.timeTracking.entries
    .filter(entry => entry.end)
    .reduce((total, entry) => total + (entry.minutes || 0), 0) / 60;

  await card.save();

  res.json({
    success: true,
    message: 'Time entry deleted'
  });
}));

// Get user's time tracking summary
router.get('/user/summary', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;
  const { startDate, endDate } = req.query;

  const query = {
    'timeTracking.entries.userId': userId,
    'timeTracking.entries.end': { $exists: true }
  };

  if (startDate && endDate) {
    query['timeTracking.entries.start'] = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const cards = await Card.find(query)
    .populate('projectId', 'name')
    .select('title projectId timeTracking');

  const summary = {
    totalHours: 0,
    billableHours: 0,
    entries: [],
    byProject: {},
    byCard: []
  };

  cards.forEach(card => {
    const userEntries = card.timeTracking.entries.filter(entry => 
      entry.userId.toString() === userId.toString() && entry.end
    );

    userEntries.forEach(entry => {
      const hours = entry.minutes / 60;
      summary.totalHours += hours;
      summary.billableHours += entry.billable ? hours : 0;
      
      summary.entries.push({
        ...entry.toObject(),
        cardTitle: card.title,
        projectName: card.projectId?.name
      });

      // Group by project
      const projectId = card.projectId?._id.toString();
      if (projectId) {
        if (!summary.byProject[projectId]) {
          summary.byProject[projectId] = {
            projectName: card.projectId.name,
            totalHours: 0,
            billableHours: 0
          };
        }
        summary.byProject[projectId].totalHours += hours;
        summary.byProject[projectId].billableHours += entry.billable ? hours : 0;
      }
    });

    summary.byCard.push({
      cardId: card._id,
      cardTitle: card.title,
      projectName: card.projectId?.name,
      hours: userEntries.reduce((total, entry) => total + (entry.minutes / 60), 0)
    });
  });

  res.json({
    success: true,
    data: summary
  });
}));

module.exports = router;
