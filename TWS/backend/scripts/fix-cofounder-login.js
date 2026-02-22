/**
 * Script to diagnose and fix co-founder login issues
 * This script will:
 * 1. Check if user exists
 * 2. Verify user status
 * 3. Reset password if needed
 * 4. Ensure organization is linked
 * 5. Test password verification
 */

const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load .env file from backend directory
const envPath = path.join(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

// Import models
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');

const CO_FOUNDER_EMAIL = '14modules@gmail.com';
const DEFAULT_PASSWORD = 'CoFounder@2024';

async function fixCoFounderLogin() {
  try {
    console.log('🔍 Diagnosing co-founder login issues...');
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

    // Step 1: Check if user exists
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 1: Checking if user exists...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    let user = await User.findOne({ email: CO_FOUNDER_EMAIL.toLowerCase() });

    if (!user) {
      console.log('❌ User not found!');
      console.log('   Creating user...');

      // Get or create wolfstack organization
      let organization = await Organization.findOne({ slug: 'wolfstack' });
      if (!organization) {
        console.log('   Creating wolfstack organization...');
        organization = new Organization({
          name: 'Wolfstack',
          slug: 'wolfstack',
          status: 'active'
        });
        await organization.save();
        console.log('   ✅ Organization created');
      }

      // Create user
      user = new User({
        email: CO_FOUNDER_EMAIL.toLowerCase(),
        password: DEFAULT_PASSWORD,
        fullName: 'Co-Founder',
        role: 'super_admin',
        orgId: organization._id,
        status: 'active'
      });
      await user.save();
      console.log('   ✅ User created');
    } else {
      console.log('✅ User found');
      console.log('   Name:', user.fullName);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Status:', user.status);
    }
    console.log('');

    // Step 2: Check user status
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 2: Checking user status...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (user.status !== 'active') {
      console.log('⚠️  User status is not active:', user.status);
      console.log('   Setting status to active...');
      user.status = 'active';
      await user.save();
      console.log('   ✅ Status updated to active');
    } else {
      console.log('✅ User status is active');
    }
    console.log('');

    // Step 3: Check organization link
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 3: Checking organization link...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (!user.orgId) {
      console.log('⚠️  User has no organization linked');
      let organization = await Organization.findOne({ slug: 'wolfstack' });
      if (!organization) {
        console.log('   Creating wolfstack organization...');
        organization = new Organization({
          name: 'Wolfstack',
          slug: 'wolfstack',
          status: 'active'
        });
        await organization.save();
      }
      user.orgId = organization._id;
      await user.save();
      console.log('   ✅ Organization linked');
    } else {
      const org = await Organization.findById(user.orgId);
      if (org) {
        console.log('✅ Organization linked:', org.name, '(' + org.slug + ')');
      } else {
        console.log('⚠️  Linked organization not found, creating new one...');
        let organization = await Organization.findOne({ slug: 'wolfstack' });
        if (!organization) {
          organization = new Organization({
            name: 'Wolfstack',
            slug: 'wolfstack',
            status: 'active'
          });
          await organization.save();
        }
        user.orgId = organization._id;
        await user.save();
        console.log('   ✅ Organization linked');
      }
    }
    console.log('');

    // Step 4: Test password verification (before reset)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 4: Testing password verification...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      // Reload user with password field
      const userWithPassword = await User.findById(user._id).select('+password');
      const isPasswordValid = await userWithPassword.comparePassword(DEFAULT_PASSWORD);
      
      if (!isPasswordValid) {
        console.log('❌ Password verification failed');
        console.log('   Resetting password...');
        
        // Force password update
        userWithPassword.password = DEFAULT_PASSWORD;
        await userWithPassword.save();
        
        // Verify again
        const userAfterReset = await User.findById(user._id).select('+password');
        const isPasswordValidAfterReset = await userAfterReset.comparePassword(DEFAULT_PASSWORD);
        
        if (isPasswordValidAfterReset) {
          console.log('   ✅ Password reset and verified');
        } else {
          console.log('   ❌ Password reset failed - manual intervention required');
        }
      } else {
        console.log('✅ Password verification successful');
      }
    } catch (error) {
      console.log('⚠️  Error testing password:', error.message);
      console.log('   Resetting password...');
      const userWithPassword = await User.findById(user._id).select('+password');
      userWithPassword.password = DEFAULT_PASSWORD;
      await userWithPassword.save();
      console.log('   ✅ Password reset');
    }
    console.log('');

    // Step 5: Final verification
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 5: Final verification...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const finalUser = await User.findOne({ email: CO_FOUNDER_EMAIL.toLowerCase() })
      .populate('orgId', 'name slug');
    
    console.log('✅ User Details:');
    console.log('   ID:', finalUser._id);
    console.log('   Email:', finalUser.email);
    console.log('   Name:', finalUser.fullName);
    console.log('   Role:', finalUser.role);
    console.log('   Status:', finalUser.status);
    console.log('   Organization:', finalUser.orgId ? finalUser.orgId.name : 'None');
    
    // Test password one more time
    const finalUserWithPassword = await User.findById(finalUser._id).select('+password');
    const finalPasswordTest = await finalUserWithPassword.comparePassword(DEFAULT_PASSWORD);
    console.log('   Password Valid:', finalPasswordTest ? '✅ Yes' : '❌ No');
    console.log('');

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DIAGNOSIS COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('   Email:    ' + CO_FOUNDER_EMAIL);
    console.log('   Password: ' + DEFAULT_PASSWORD);
    console.log('');
    console.log('🌐 LOGIN ENDPOINT:');
    console.log('   POST http://localhost:5000/api/auth/login');
    console.log('   Body: {');
    console.log('     "email": "' + CO_FOUNDER_EMAIL + '",');
    console.log('     "password": "' + DEFAULT_PASSWORD + '"');
    console.log('   }');
    console.log('');
    console.log('🔍 TROUBLESHOOTING:');
    console.log('   1. Make sure backend server is running on port 5000');
    console.log('   2. Set PORT=5000 in backend/.env file');
    console.log('   3. Check MongoDB connection');
    console.log('   4. Verify email is lowercase (automatically normalized)');
    console.log('   5. Check server logs for any errors');
    console.log('   6. Try logging in via frontend: http://localhost:3000/login');
    console.log('');
    console.log('📝 NOTE: If backend is on port 4000, update frontend/.env:');
    console.log('   REACT_APP_API_URL=http://localhost:4000');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
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
fixCoFounderLogin();

