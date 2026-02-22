// Debug version to test route registration
const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Test route registration
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Health check working' });
});

// Load auth routes
try {
  const authRoutes = require('./src/routes/auth');
  console.log('Auth routes loaded:', typeof authRoutes);
  app.use('/api/auth', authRoutes);
  console.log('Auth routes registered with Express');
} catch (error) {
  console.error('Error loading auth routes:', error.message);
}

const PORT = 4002;
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /health');
  console.log('- POST /api/auth/login');
});
