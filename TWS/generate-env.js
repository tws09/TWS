#!/usr/bin/env node

/**
 * Generate secure environment variables for TWS deployment
 * Run this script to generate secure values for your environment variables
 */

const crypto = require('crypto');

console.log('🔐 TWS Environment Variables Generator');
console.log('=====================================\n');

console.log('Copy these values to your deployment environment variables:\n');

// Generate JWT Secret (64 bytes = 128 hex characters)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET=' + jwtSecret);

// Generate JWT Refresh Secret (64 bytes = 128 hex characters)
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_REFRESH_SECRET=' + jwtRefreshSecret);

// Generate Encryption Master Key (32 bytes = 64 hex characters)
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('ENCRYPTION_MASTER_KEY=' + encryptionKey);

console.log('\n📝 Required MongoDB URI:');
console.log('MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tws-production?retryWrites=true&w=majority');
console.log('\n💡 Replace username:password with your actual MongoDB Atlas credentials');

console.log('\n🌐 Optional variables (you can set these later):');
console.log('BASE_URL=https://your-app.domain.com');
console.log('SOCKET_CORS_ORIGIN=https://your-app.domain.com');
console.log('NODE_ENV=production');

console.log('\n✅ Add these variables in your deployment environment:');
console.log('1. Go to your project deployment dashboard');
console.log('2. Click on Settings tab');
console.log('3. Click on Environment Variables');
console.log('4. Add each variable with its value');
console.log('5. Redeploy your application');

console.log('\n🚀 After adding the variables, your app should work!');
