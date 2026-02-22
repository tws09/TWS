const express = require('express');
const router = express.Router();
const StandaloneMonitoringService = require('../../../services/StandaloneMonitoringService');

// Initialize the standalone monitoring service
const monitoringService = new StandaloneMonitoringService();

// Start the monitoring service
monitoringService.start();

// Get real-time metrics
router.get('/metrics', (req, res) => {
  try {
    const metrics = monitoringService.getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// Get system health
router.get('/health', (req, res) => {
  try {
    const health = monitoringService.getSystemHealth();
    res.json(health);
  } catch (error) {
    console.error('Error getting health:', error);
    res.status(500).json({ error: 'Failed to get health status' });
  }
});

// Get alerts
router.get('/alerts', (req, res) => {
  try {
    const alerts = monitoringService.getAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

// Get logs
router.get('/logs', (req, res) => {
  try {
    const logs = monitoringService.getLogs();
    res.json(logs);
  } catch (error) {
    console.error('Error getting logs:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// WebSocket endpoint for real-time updates
router.get('/ws', (req, res) => {
  res.json({ message: 'WebSocket endpoint available at /ws/monitoring' });
});

module.exports = router;
