// Simplified TWS Backend Server - Fixed version
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

console.log('🚀 Starting TWS Backend Server (Fixed Version)...');

// Load TWS Configuration System
const config = require('../config/environment');

// Basic Express setup
const app = express();
const server = createServer(app);

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(helmet());
app.use(compression());
app.use(mongoSanitize());

// CORS configuration
app.use(cors({
  origin: config.get('CORS_ORIGIN') || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.get('RATE_LIMIT_WINDOW_MS') || 15 * 60 * 1000,
  max: config.get('RATE_LIMIT_MAX_REQUESTS') || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// MongoDB connection
async function connectToMongoDB() {
  try {
    const mongoUri = config.get('MONGO_URI');
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: config.get('SOCKET_CORS_ORIGIN') || 'http://localhost:3000',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Basic routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TWS Backend Server Running',
    timestamp: new Date().toISOString(),
    environment: config.get('NODE_ENV') || 'development'
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

// Load routes progressively
async function loadRoutes() {
  console.log('📦 Loading routes...');
  
  try {
    // Core routes
    const authRoutes = require('./routes/auth');
    const userRoutes = require('./routes/users');
    const healthRoutes = require('./routes/health');
    const twsAdminRoutes = require('./routes/twsAdmin');
    
    // Register core routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/health', healthRoutes);
    app.use('/api/tws-admin', twsAdminRoutes);
    
    console.log('✅ Core routes loaded');
    
    // Load additional routes safely
    const additionalRoutes = [
      { name: 'employees', path: './routes/employees' },
      { name: 'attendance', path: './routes/attendance' },
      { name: 'payroll', path: './routes/payroll' },
      { name: 'finance', path: './routes/finance' },
      { name: 'projects', path: './routes/projects' },
      { name: 'tasks', path: './routes/tasks' },
      { name: 'clients', path: './routes/clients' },
      { name: 'notifications', path: './routes/notifications' },
      { name: 'files', path: './routes/files' }
    ];
    
    for (const route of additionalRoutes) {
      try {
        const routeModule = require(route.path);
        app.use(`/api/${route.name}`, routeModule);
        console.log(`✅ ${route.name} routes loaded`);
      } catch (error) {
        console.warn(`⚠️ Skipping ${route.name} routes:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error loading routes:', error.message);
    throw error;
  }
}

// Load middleware safely
async function loadMiddleware() {
  console.log('📦 Loading middleware...');
  
  try {
    // Load middleware safely
    const { errorHandler } = require('./middleware/errorHandler');
    const { authenticateToken } = require('./middleware/auth');
    
    // Register middleware
    app.use(errorHandler);
    
    console.log('✅ Middleware loaded');
    
  } catch (error) {
    console.error('❌ Error loading middleware:', error.message);
    throw error;
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Error caught by middleware:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.isDevelopment() ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
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
    
    // Load routes
    await loadRoutes();
    
    // Load middleware
    await loadMiddleware();
    
    // Start HTTP server
    const PORT = config.get('PORT') || 5000;
    server.listen(PORT, () => {
      console.log(`✅ TWS Backend Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
      console.log(`🌍 Environment: ${config.get('NODE_ENV') || 'development'}`);
      console.log(`🔴 Redis: ${config.isRedisEnabled() ? 'Enabled' : 'Disabled'}`);
      console.log(`⚡ BullMQ: ${config.isBullMQEnabled() ? 'Enabled' : 'Disabled'}`);
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

// Export for server.js
module.exports = { app, server };

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}
