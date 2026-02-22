const express = require('express');
const { body } = require('express-validator');
const ErrorHandler = require('../../../middleware/common/errorHandler');
const ValidationMiddleware = require('../../../middleware/validation/validation');
const { logError, logUserActivity, logSecurityEvent } = require('../../../config/logging');
const { authenticateToken } = require('../../../middleware/auth/auth');

const router = express.Router();

/**
 * @swagger
 * /api/logs/frontend:
 *   post:
 *     summary: Receive frontend logs
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [error, warn, info, debug]
 *               data:
 *                 type: object
 *               context:
 *                 type: object
 *               error:
 *                 type: object
 *               timestamp:
 *                 type: string
 *               userAgent:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Log received successfully
 *       400:
 *         description: Invalid log data
 *       401:
 *         description: Unauthorized
 */
router.post('/frontend', [
  body('message').notEmpty().trim(),
  body('level').isIn(['error', 'warn', 'info', 'debug']),
  body('timestamp').isISO8601(),
  body('url').isURL()
], ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler(async (req, res) => {
  const { message, level, data, context, error, timestamp, userAgent, url } = req.body;
  const userId = req.user?._id;

  // Create log entry
  const logEntry = {
    message,
    level,
    data,
    context: {
      ...context,
      userId,
      userAgent,
      url,
      timestamp
    },
    source: 'frontend'
  };

  // Log based on level
  switch (level) {
    case 'error':
      logError(error || new Error(message), logEntry.context);
      break;
    case 'warn':
      if (message.includes('Security')) {
        logSecurityEvent(message, userId, logEntry.context);
      } else {
        console.warn('Frontend Warning:', message, logEntry.context);
      }
      break;
    case 'info':
      if (message.includes('User Action')) {
        logUserActivity(data?.action || 'unknown', userId, logEntry.context);
      } else {
        console.info('Frontend Info:', message, logEntry.context);
      }
      break;
    case 'debug':
      console.debug('Frontend Debug:', message, logEntry.context);
      break;
    default:
      console.log('Frontend Log:', message, logEntry.context);
  }

  res.json({
    success: true,
    message: 'Log received successfully'
  });
}));

/**
 * @swagger
 * /api/logs/system:
 *   post:
 *     summary: Log system events
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [error, warn, info, debug]
 *               details:
 *                 type: object
 *     responses:
 *       200:
 *         description: System log recorded successfully
 *       400:
 *         description: Invalid log data
 *       401:
 *         description: Unauthorized
 */
router.post('/system', [
  body('event').notEmpty().trim(),
  body('level').isIn(['error', 'warn', 'info', 'debug']),
  body('details').optional().isObject()
], ValidationMiddleware.handleValidationErrors, authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const { event, level, details = {} } = req.body;
  const userId = req.user._id;

  const logContext = {
    userId,
    event,
    ...details
  };

  switch (level) {
    case 'error':
      logError(new Error(event), logContext);
      break;
    case 'warn':
      console.warn('System Warning:', event, logContext);
      break;
    case 'info':
      console.info('System Info:', event, logContext);
      break;
    case 'debug':
      console.debug('System Debug:', event, logContext);
      break;
    default:
      console.log('System Log:', event, logContext);
  }

  res.json({
    success: true,
    message: 'System log recorded successfully'
  });
}));

/**
 * @swagger
 * /api/logs/health:
 *   get:
 *     summary: Check logging system health
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logging system health status
 */
router.get('/health', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      environment: process.env.NODE_ENV || 'development',
      sentry: {
        initialized: process.env.SENTRY_DSN ? true : false
      }
    }
  };

  res.json(health);
}));

module.exports = router;
