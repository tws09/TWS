// Minimal TWS Backend Test Server
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Basic middleware
app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TWS Backend Test Server Running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test MongoDB connection
async function testMongoConnection() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tws-dev';
    console.log('🔗 Attempting MongoDB connection to:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    
    // Test basic database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections in database`);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Full error:', error);
  }
}

// Test individual route imports
async function testRouteImports() {
  console.log('🧪 Testing route imports...');
  
  const routesToTest = [
    './src/routes/auth',
    './src/routes/users',
    './src/routes/health',
    './src/routes/twsAdmin'
  ];
  
  for (const route of routesToTest) {
    try {
      const routeModule = require(route);
      console.log(`✅ ${route} - OK`);
    } catch (error) {
      console.error(`❌ ${route} - FAILED:`, error.message);
    }
  }
}

// Test middleware imports
async function testMiddlewareImports() {
  console.log('🧪 Testing middleware imports...');
  
  const middlewareToTest = [
    './src/middleware/auth',
    './src/middleware/rbac',
    './src/middleware/errorHandler'
  ];
  
  for (const middleware of middlewareToTest) {
    try {
      const middlewareModule = require(middleware);
      console.log(`✅ ${middleware} - OK`);
    } catch (error) {
      console.error(`❌ ${middleware} - FAILED:`, error.message);
    }
  }
}

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting TWS Backend Test Server...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Port: ${PORT}`);
    
    // Test MongoDB connection
    await testMongoConnection();
    
    // Test route imports
    await testRouteImports();
    
    // Test middleware imports
    await testMiddlewareImports();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`✅ Test server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.disconnect();
  process.exit(0);
});

// Start the server
startServer();
