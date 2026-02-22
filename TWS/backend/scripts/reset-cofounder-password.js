/**
 * Script to reset/update co-founder user password
 * This ensures the password is properly set and can be used for login
 */

const mongoose = require('mongoose');
const path = require('path');

// Load .env file from backend directory
const envPath = path.join(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

// Import User model
const User = require('../src/models/User');

const CO_FOUNDER_EMAIL = '14modules@gmail.com';
const DEFAULT_PASSWORD = 'CoFounder@2024';

async function resetCoFounderPassword() {
  try {
    console.log('🔐 Resetting co-founder password...');
    console.log('📧 Email:', CO_FOUNDER_EMAIL);
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
    
    // Find user
    const user = await User.findOne({ email: CO_FOUNDER_EMAIL });
    
    if (!user) {
      console.log('❌ User not found!');
      console.log('   Please run grant-all-modules-access.js first to create the user.');
      process.exit(1);
    }
    
    console.log('✅ User found:');
    console.log('   Name:', user.fullName);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Status:', user.status);
    console.log('');
    
    // Update password
    console.log('🔄 Updating password...');
    user.password = DEFAULT_PASSWORD; // This will be hashed by pre-save hook
    await user.save();
    
    console.log('✅ Password updated successfully!');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ' + CO_FOUNDER_EMAIL);
    console.log('Password: ' + DEFAULT_PASSWORD);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('⚠️  IMPORTANT: Change password after first login!');
    console.log('');
    console.log('To change password after login:');
    console.log('1. Login with the credentials above');
    console.log('2. Go to Profile Settings');
    console.log('3. Click "Change Password"');
    console.log('4. Enter current password and new password');
    console.log('');
    console.log('Or use API: POST /api/auth/change-password');
    console.log('   Body: {');
    console.log('     "currentPassword": "' + DEFAULT_PASSWORD + '",');
    console.log('     "newPassword": "YourNewPassword123!"');
    console.log('   }');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('');
      console.log('MongoDB connection failed!');
      console.log('Make sure MongoDB is accessible.');
      console.log('Check .env file for MONGO_URI.');
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
resetCoFounderPassword();

