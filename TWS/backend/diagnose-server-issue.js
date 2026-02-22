#!/usr/bin/env node

/**
 * Server Issue Diagnostic Script
 * Identifies what's preventing the server from starting
 */

console.log('🔍 Diagnosing server startup issues...\n');

// Test 1: Check Node.js and basic modules
console.log('1. Testing Node.js and basic modules...');
try {
  const express = require('express');
  const mongoose = require('mongoose');
  console.log('✅ Basic modules loaded successfully');
} catch (error) {
  console.error('❌ Failed to load basic modules:', error.message);
  process.exit(1);
}

// Test 2: Check environment configuration
console.log('\n2. Testing environment configuration...');
try {
  const config = require('./src/config/environment');
  console.log('✅ Environment config loaded');
  console.log('   PORT:', config.get('PORT'));
  console.log('   NODE_ENV:', config.get('NODE_ENV'));
  console.log('   MONGO_URI:', config.get('MONGO_URI') ? 'Set' : 'Not set');
} catch (error) {
  console.error('❌ Environment config failed:', error.message);
  process.exit(1);
}

// Test 3: Check multi-database service
console.log('\n3. Testing multi-database service...');
try {
  const multiDatabaseService = require('./src/services/multiDatabaseService');
  console.log('✅ Multi-database service loaded');
} catch (error) {
  console.error('❌ Multi-database service failed:', error.message);
  process.exit(1);
}

// Test 4: Check app.js loading
console.log('\n4. Testing app.js loading...');
try {
  const { app, server } = require('./src/app.js');
  console.log('✅ App.js loaded successfully');
} catch (error) {
  console.error('❌ App.js loading failed:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}

// Test 5: Test server creation
console.log('\n5. Testing server creation...');
try {
  const { app, server } = require('./src/app.js');
  const PORT = process.env.PORT || 5000;
  
  console.log(`   Attempting to start server on port ${PORT}...`);
  
  server.listen(PORT, () => {
    console.log(`✅ Server started successfully on port ${PORT}`);
    
    // Test database health endpoint
    console.log('\n6. Testing database health endpoint...');
    const http = require('http');
    
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/database/health',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`✅ Database health endpoint responding (status: ${res.statusCode})`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('   Response:', response.success ? 'Success' : 'Failed');
          if (response.data) {
            console.log('   Databases:', response.data.databases?.join(', ') || 'Unknown');
          }
        } catch (e) {
          console.log('   Response parsing failed');
        }
        
        // Close server
        server.close(() => {
          console.log('\n✅ Server closed successfully');
          console.log('\n🎉 All tests passed! Server should work correctly.');
          process.exit(0);
        });
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Database health endpoint failed:', error.message);
      server.close(() => process.exit(1));
    });
    
    req.end();
    
  }).on('error', (error) => {
    console.error('❌ Server failed to start:', error.message);
    if (error.code === 'EADDRINUSE') {
      console.log('   Port is already in use. Try killing the process or using a different port.');
    }
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Server creation failed:', error.message);
  process.exit(1);
}
