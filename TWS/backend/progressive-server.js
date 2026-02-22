// Progressive TWS Backend Server - Loading components step by step
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

console.log('🚀 Starting Progressive TWS Backend Server...');

// Step 1: Basic Express setup
console.log('📦 Step 1: Setting up Express...');
const app = express();
const server = createServer(app);

// Step 2: Basic middleware
console.log('📦 Step 2: Adding basic middleware...');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Step 3: Security middleware
console.log('📦 Step 3: Adding security middleware...');
app.use(helmet());
app.use(compression());
app.use(mongoSanitize());

// Step 4: CORS setup
console.log('📦 Step 4: Setting up CORS...');
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Step 5: Rate limiting
console.log('📦 Step 5: Setting up rate limiting...');
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use(limiter);

// Step 6: Logging
console.log('📦 Step 6: Setting up logging...');
app.use(morgan('combined'));

// Step 7: MongoDB connection
console.log('📦 Step 7: Connecting to MongoDB...');
async function connectToMongoDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tws-dev';
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections in database`);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

// Step 8: Socket.IO setup
console.log('📦 Step 8: Setting up Socket.IO...');
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Step 9: Basic routes
console.log('📦 Step 9: Adding basic routes...');
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TWS Backend Server Running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    step: 'Basic routes loaded'
  });
});

app.get('/metrics', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Step 10: Test route imports one by one
console.log('📦 Step 10: Testing route imports...');
async function testRouteImports() {
  const criticalRoutes = [
    { name: 'auth', path: './src/routes/auth' },
    { name: 'users', path: './src/routes/users' },
    { name: 'health', path: './src/routes/health' },
    { name: 'twsAdmin', path: './src/routes/twsAdmin' }
  ];
  
  for (const route of criticalRoutes) {
    try {
      console.log(`  🔍 Testing ${route.name}...`);
      const routeModule = require(route.path);
      console.log(`  ✅ ${route.name} - OK`);
      
      // Register the route
      app.use(`/api/${route.name}`, routeModule);
      console.log(`  🔗 Registered /api/${route.name}`);
      
    } catch (error) {
      console.error(`  ❌ ${route.name} - FAILED:`, error.message);
      throw error;
    }
  }
}

// Step 11: Test middleware imports
console.log('📦 Step 11: Testing middleware imports...');
async function testMiddlewareImports() {
  const criticalMiddleware = [
    { name: 'auth', path: './src/middleware/auth' },
    { name: 'rbac', path: './src/middleware/rbac' },
    { name: 'errorHandler', path: './src/middleware/errorHandler' }
  ];
  
  for (const middleware of criticalMiddleware) {
    try {
      console.log(`  🔍 Testing ${middleware.name}...`);
      const middlewareModule = require(middleware.path);
      console.log(`  ✅ ${middleware.name} - OK`);
      
    } catch (error) {
      console.error(`  ❌ ${middleware.name} - FAILED:`, error.message);
      throw error;
    }
  }
}

// Step 12: Error handling middleware
console.log('📦 Step 12: Adding error handling...');
app.use((err, req, res, next) => {
  console.error('🚨 Error caught by middleware:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Step 13: 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server function
async function startServer() {
  try {
    console.log('🚀 Starting server initialization...');
    
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Test route imports
    await testRouteImports();
    
    // Test middleware imports
    await testMiddlewareImports();
    
    // Start HTTP server
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`✅ TWS Backend Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
      console.log(`🔴 Redis: ${process.env.REDIS_DISABLED === 'true' ? 'Disabled' : 'Enabled'}`);
      console.log(`⚡ BullMQ: ${process.env.BULLMQ_DISABLED === 'true' ? 'Disabled' : 'Enabled'}`);
    });
    
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    console.error('Full error details:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.disconnect();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
