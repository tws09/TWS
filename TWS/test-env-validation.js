#!/usr/bin/env node

/**
 * Test Environment Validation
 * This script tests the environment validation to see what's causing the error
 */

// Set up test environment
process.env.NODE_ENV = 'production';
process.env.MONGO_URI = 'mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack';
process.env.JWT_SECRET = 'c5320b7dfe61828847da92b64f0131e3eaadbeac5dc3c35f145e5e3748604416c64d7b8c30fed4028deb69abd52a02e629ae58a27971a438c120902dcc6a71fd';
process.env.JWT_REFRESH_SECRET = '842f38d8604748600136844c756ab8237a29168bb6b96d1b6c37ff6b4c0abf9057a22509459fe90cf36fb227d8dccedf19eeb3420879d2aae917071350bcb903';
process.env.ENCRYPTION_MASTER_KEY = '2b5270cad35c6f5c081f39816559e63cd545b61907a8c0ea0ee5b4abf4c10528';

console.log('🧪 Testing Environment Validation');
console.log('=================================\n');

console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'Set' : 'Not set');
console.log('ENCRYPTION_MASTER_KEY:', process.env.ENCRYPTION_MASTER_KEY ? 'Set' : 'Not set');

console.log('\n🔍 Testing validation...');

try {
  // Test the environment validation
  const envConfig = require('./backend/src/config/environment.js');
  console.log('✅ Environment validation passed!');
  console.log('Config loaded successfully');
} catch (error) {
  console.log('❌ Environment validation failed:');
  console.log('Error:', error.message);
  console.log('\nStack trace:');
  console.log(error.stack);
}
