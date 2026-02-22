#!/usr/bin/env node

/**
 * Test Server Startup Script
 * Diagnoses issues with server startup
 */

console.log('🔍 Testing server startup...');

try {
  console.log('1. Loading app.js...');
  const { app, server } = require('./src/app.js');
  console.log('✅ App.js loaded successfully');

  console.log('2. Testing server creation...');
  const PORT = process.env.PORT || 5000;
  
  console.log('3. Starting server on port', PORT);
  server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Test database health
    console.log('4. Testing database health...');
    const multiDatabaseService = require('./src/services/multiDatabaseService');
    
    multiDatabaseService.initialize()
    .then(() => {
      console.log('✅ Multi-database service initialized');
      const stats = multiDatabaseService.getStats();
      console.log('📊 Database stats:', stats);
      
      // Close server after test
      setTimeout(() => {
        console.log('5. Closing server...');
        server.close(() => {
          console.log('✅ Server closed successfully');
          process.exit(0);
        });
      }, 2000);
    })
    .catch(err => {
      console.error('❌ Multi-database service failed:', err.message);
      server.close(() => {
        process.exit(1);
      });
    });
    
  }).on('error', (error) => {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Failed to load app.js:', error);
  process.exit(1);
}
