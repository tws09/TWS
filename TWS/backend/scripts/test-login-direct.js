/**
 * Script to test login directly with the database
 * This helps diagnose login issues
 */

const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load .env file from backend directory
const envPath = path.join(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

// Import User model
const User = require('../src/models/User');

const CO_FOUNDER_EMAIL = '14modules@gmail.com';
const DEFAULT_PASSWORD = 'CoFounder@2024';

async function testLogin() {
  try {
    console.log('🧪 Testing Login Directly...');
    console.log('');

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI ||
      'mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack';

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connected to MongoDB');
    console.log('');

    // Test 1: Find user with exact email
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 1: Finding user with exact email');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    let user = await User.findOne({ email: CO_FOUNDER_EMAIL });
    console.log('Result:', user ? '✅ Found' : '❌ Not found');
    if (user) {
      console.log('  Email in DB:', user.email);
      console.log('  Email match:', user.email === CO_FOUNDER_EMAIL);
    }
    console.log('');

    // Test 2: Find user with lowercase email
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 2: Finding user with lowercase email');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    user = await User.findOne({ email: CO_FOUNDER_EMAIL.toLowerCase() });
    console.log('Result:', user ? '✅ Found' : '❌ Not found');
    if (user) {
      console.log('  Email in DB:', user.email);
      console.log('  Email match:', user.email === CO_FOUNDER_EMAIL.toLowerCase());
    }
    console.log('');

    // Test 3: Find user with trimmed email
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 3: Finding user with trimmed lowercase email');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    user = await User.findOne({ email: CO_FOUNDER_EMAIL.toLowerCase().trim() });
    console.log('Result:', user ? '✅ Found' : '❌ Not found');
    if (user) {
      console.log('  Email in DB:', user.email);
      console.log('  Email match:', user.email === CO_FOUNDER_EMAIL.toLowerCase().trim());
    }
    console.log('');

    // Test 4: Find user with regex (case insensitive)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 4: Finding user with case-insensitive regex');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    user = await User.findOne({ email: new RegExp(`^${CO_FOUNDER_EMAIL}$`, 'i') });
    console.log('Result:', user ? '✅ Found' : '❌ Not found');
    if (user) {
      console.log('  Email in DB:', user.email);
    }
    console.log('');

    if (!user) {
      console.log('❌ User not found with any method!');
      console.log('   Please run fix-cofounder-login.js to create the user.');
      process.exit(1);
    }

    // Test 5: Check password
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 5: Testing password verification');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const userWithPassword = await User.findById(user._id).select('+password');
    console.log('  Password hash length:', userWithPassword.password.length);
    console.log('  Password hash starts with:', userWithPassword.password.substring(0, 20) + '...');
    
    const isPasswordValid = await userWithPassword.comparePassword(DEFAULT_PASSWORD);
    console.log('  Password valid:', isPasswordValid ? '✅ Yes' : '❌ No');
    
    if (!isPasswordValid) {
      console.log('  ⚠️  Password verification failed!');
      console.log('  Resetting password...');
      userWithPassword.password = DEFAULT_PASSWORD;
      await userWithPassword.save();
      console.log('  ✅ Password reset');
      
      // Test again
      const userAfterReset = await User.findById(user._id).select('+password');
      const isPasswordValidAfterReset = await userAfterReset.comparePassword(DEFAULT_PASSWORD);
      console.log('  Password valid after reset:', isPasswordValidAfterReset ? '✅ Yes' : '❌ No');
    }
    console.log('');

    // Test 6: Check user status
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 6: Checking user status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Status:', user.status);
    console.log('  Role:', user.role);
    console.log('  Is Active:', user.status === 'active' ? '✅ Yes' : '❌ No');
    console.log('');

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  User found:', user ? '✅ Yes' : '❌ No');
    console.log('  Email in DB:', user?.email);
    console.log('  Password valid:', isPasswordValid ? '✅ Yes' : '❌ No');
    console.log('  Status active:', user?.status === 'active' ? '✅ Yes' : '❌ No');
    console.log('');

    // Test API call simulation
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('API CALL SIMULATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('POST /api/auth/login');
    console.log('Body: {');
    console.log('  "email": "' + CO_FOUNDER_EMAIL + '",');
    console.log('  "password": "' + DEFAULT_PASSWORD + '"');
    console.log('}');
    console.log('');
    console.log('Expected behavior:');
    console.log('  1. Email normalized to:', CO_FOUNDER_EMAIL.toLowerCase().trim());
    console.log('  2. User lookup with normalized email');
    console.log('  3. Password verification');
    console.log('  4. Status check');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testLogin();

