const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API status endpoint
router.get('/status', (req, res) => {
  res.json({
    api: 'TWS Backend API',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      supraAdmin: '/api/supra-admin',
      tenantSwitching: '/api/tenant-switching',
    }
  });
});

module.exports = router;
