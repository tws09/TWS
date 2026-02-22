const express = require('express');
const metricsService = require('../../../services/analytics/metrics.service');
const { loggerService } = require('../../../services/core/logger.service');

const router = express.Router();

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get Prometheus metrics
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Prometheus-formatted metrics
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: |
 *                 # HELP active_sockets Number of active WebSocket connections
 *                 # TYPE active_sockets gauge
 *                 active_sockets{namespace="default"} 42
 */
router.get('/', async (req, res) => {
  try {
    const metrics = await metricsService.getMetrics();
    
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(metrics);
    
    loggerService.debug('Metrics endpoint accessed', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
  } catch (error) {
    loggerService.error('Error generating metrics', error);
    res.status(500).send('Error generating metrics');
  }
});

/**
 * @swagger
 * /api/metrics/json:
 *   get:
 *     summary: Get metrics as JSON
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Metrics in JSON format
 */
router.get('/json', async (req, res) => {
  try {
    const metrics = await metricsService.getMetricsAsJSON();
    
    res.json({
      success: true,
      data: metrics,
      generatedAt: new Date()
    });
    
    loggerService.debug('JSON metrics endpoint accessed', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
  } catch (error) {
    loggerService.error('Error generating JSON metrics', error);
    res.status(500).json({
      success: false,
      error: 'Error generating metrics'
    });
  }
});

/**
 * @swagger
 * /api/metrics/health:
 *   get:
 *     summary: Get system health metrics
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: System health information
 */
router.get('/health', async (req, res) => {
  try {
    const healthMetrics = await metricsService.getHealthMetrics();
    
    res.json({
      success: true,
      data: healthMetrics,
      generatedAt: new Date()
    });
    
    loggerService.debug('Health metrics endpoint accessed', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
  } catch (error) {
    loggerService.error('Error generating health metrics', error);
    res.status(500).json({
      success: false,
      error: 'Error generating health metrics'
    });
  }
});

module.exports = router;
