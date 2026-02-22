/**
 * Script to check and display user's module access
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const SoftwareHouseRole = require('../src/models/SoftwareHouseRole');
const Organization = require('../src/models/Organization');

const CO_FOUNDER_EMAIL = '14modules@gmail.com';

// All 14 modules
const ALL_MODULES = [
  'hr_management',
  'finance',
  'projects',
  'operations',
  'inventory',
  'reports',
  'time_attendance',
  'communication',
  'role_management',
  'system_settings',
  'clients',
  'development_tools',
  'code_repository',
  'deployment'
];

async function checkUserModuleAccess() {
  try {
    console.log('🔍 Checking User Module Access...');
    console.log('');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tws_database';
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log('');
    
    // Find user
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 1: Finding user...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const user = await User.findOne({ email: CO_FOUNDER_EMAIL.toLowerCase().trim() });
    
    if (!user) {
      console.log('❌ User not found:', CO_FOUNDER_EMAIL);
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user._id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Status:', user.status);
    console.log('   Organization:', user.organizationId);
    console.log('   SoftwareHouseRole:', user.softwareHouseRole);
    console.log('');
    
    // Check SoftwareHouseRole
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 2: Checking SoftwareHouseRole...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let softwareHouseRole = null;
    if (user.softwareHouseRole) {
      softwareHouseRole = await SoftwareHouseRole.findById(user.softwareHouseRole);
    }
    
    if (!softwareHouseRole) {
      // Try to find by orgId and roleType
      const orgId = user.organizationId;
      if (orgId) {
        softwareHouseRole = await SoftwareHouseRole.findOne({
          orgId: orgId,
          roleType: 'owner'
        });
      }
    }
    
    if (!softwareHouseRole) {
      console.log('❌ SoftwareHouseRole not found!');
      console.log('   User needs a SoftwareHouseRole with all 14 modules.');
      console.log('');
      console.log('💡 Run this script to grant access:');
      console.log('   node scripts/grant-all-modules-access.js');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ SoftwareHouseRole found:');
    console.log('   ID:', softwareHouseRole._id);
    console.log('   Name:', softwareHouseRole.name);
    console.log('   Role Type:', softwareHouseRole.roleType);
    console.log('   Level:', softwareHouseRole.level);
    console.log('');
    
    // Check module access
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 3: Checking Module Access...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const moduleAccess = softwareHouseRole.moduleAccess || {};
    const enabledModules = [];
    const disabledModules = [];
    
    ALL_MODULES.forEach(module => {
      if (moduleAccess[module] === true) {
        enabledModules.push(module);
      } else {
        disabledModules.push(module);
      }
    });
    
    console.log('✅ Module Access Summary:');
    console.log('   Total Modules: 14');
    console.log('   Enabled Modules:', enabledModules.length);
    console.log('   Disabled Modules:', disabledModules.length);
    console.log('');
    
    console.log('📦 Enabled Modules (' + enabledModules.length + '):');
    enabledModules.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module}`);
    });
    console.log('');
    
    if (disabledModules.length > 0) {
      console.log('❌ Disabled Modules (' + disabledModules.length + '):');
      disabledModules.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module}`);
      });
      console.log('');
    }
    
    // Check access level from frontend perspective
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 4: Access Level Information...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const roleLevels = {
      'super_admin': 0,
      'owner': 1,
      'admin': 2,
      'hr_manager': 3,
      'finance_manager': 4,
      'project_manager': 5,
      'employee': 6
    };
    
    const userLevel = roleLevels[user.role] || 999;
    
    console.log('✅ Access Level:', userLevel);
    console.log('   Role:', user.role);
    console.log('');
    console.log('📊 Role Hierarchy:');
    console.log('   Level 0: super_admin (Highest)');
    console.log('   Level 1: owner (Superior Access) ✅');
    console.log('   Level 2: admin');
    console.log('   Level 3: hr_manager');
    console.log('   Level 4: finance_manager');
    console.log('   Level 5: project_manager');
    console.log('   Level 6: employee (Lowest)');
    console.log('');
    
    if (userLevel === 1) {
      console.log('✅ YES, Access Level 1 is SUPERIOR ACCESS!');
      console.log('   It is the second highest level (owner role).');
      console.log('   Only super_admin (level 0) has higher access.');
      console.log('');
    }
    
    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('User:', CO_FOUNDER_EMAIL);
    console.log('Role:', user.role);
    console.log('Access Level:', userLevel, '(Superior Access ✅)');
    console.log('Modules Enabled:', enabledModules.length, 'of 14');
    console.log('');
    
    if (enabledModules.length < 14) {
      console.log('⚠️  WARNING: Not all modules are enabled!');
      console.log('   Expected: 14 modules');
      console.log('   Actual:', enabledModules.length, 'modules');
      console.log('');
      console.log('💡 To fix, run:');
      console.log('   node scripts/grant-all-modules-access.js');
      console.log('');
    } else {
      console.log('✅ All 14 modules are enabled!');
      console.log('');
    }
    
    // Disconnect
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkUserModuleAccess();

