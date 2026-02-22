const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Set environment variables
process.env.MONGO_URI = 'mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack';
process.env.JWT_SECRET = 'test_jwt_secret_for_development_only';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_for_development_only';
process.env.ENCRYPTION_MASTER_KEY = 'test_encryption_master_key_32_chars';

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple auth middleware for testing
const testAuth = (req, res, next) => {
  // For testing purposes, just pass through
  req.user = { userId: 'test-user', role: 'supra_admin' };
  next();
};

// Import Master ERP routes
const masterERPRoutes = require('./src/routes/masterERP');

// Mount routes with test auth
app.use('/api/master-erp', testAuth, masterERPRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test Master ERP server is running' });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Test Master ERP server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 Master ERP API: http://localhost:${PORT}/api/master-erp`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
