/**
 * Script to grant all 14 modules access to co-founder user: 14modules@gmail.com
 * 
 * This script:
 * 1. Finds or creates the user with email "14modules@gmail.com"
 * 2. Creates or updates a SoftwareHouseRole with all 14 modules enabled
 * 3. Assigns the role to the user
 * 4. Sets user role to "owner" for full access
 */

const mongoose = require('mongoose');
const path = require('path');

// Load .env file from backend directory (parent of scripts directory)
const envPath = path.join(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

// Import models - adjust path if needed
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const SoftwareHouseRole = require('../src/models/SoftwareHouseRole');

// All 14 modules for Software House ERP
const ALL_14_MODULES = {
  // Core ERP Modules (10)
  hr_management: true,
  finance: true,
  projects: true,
  operations: true,
  inventory: true,
  reports: true,
  time_attendance: true,
  communication: true,
  role_management: true,
  system_settings: true,
  
  // Software House Specific Modules (4 additional)
  clients: true,
  development_tools: true,
  code_repository: true,
  deployment: true
};

const CO_FOUNDER_EMAIL = '14modules@gmail.com';
const DEFAULT_PASSWORD = 'CoFounder@2024'; // User should change this on first login

async function grantAllModulesAccess() {
  try {
    console.log('🚀 Starting module access grant process...');
    console.log('📧 Target email:', CO_FOUNDER_EMAIL);
    console.log('');
    
    // Check if .env file exists
    const fs = require('fs');
    if (fs.existsSync(envPath)) {
      console.log('✅ Found .env file');
    } else {
      console.log('⚠️  No .env file found in backend directory');
    }
    console.log('');
    
    // Connect to MongoDB
    // Priority: 1. MONGO_URI from .env, 2. MongoDB Atlas default, 3. localhost fallback
    const mongoUri = process.env.MONGO_URI || 
                     'mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack';
    
    console.log('🔗 Connecting to MongoDB...');
    console.log('   URI:', mongoUri.replace(/:[^:@]+@/, ':****@')); // Hide password in output
    
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        retryReads: true
      });
      console.log('✅ Connected to MongoDB successfully');
    } catch (mongoError) {
      console.log('');
      console.log('❌ MongoDB connection failed!');
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('MONGODB CONNECTION TROUBLESHOOTING');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('Error:', mongoError.message);
      console.log('');
      console.log('Possible solutions:');
      console.log('');
      console.log('1. If using MongoDB Atlas (cloud):');
      console.log('   - Check your internet connection');
      console.log('   - Verify MONGO_URI in .env file is correct');
      console.log('   - Check MongoDB Atlas IP whitelist');
      console.log('   - Verify MongoDB Atlas cluster is running');
      console.log('');
      console.log('2. If using local MongoDB:');
      console.log('   - Make sure MongoDB is installed and running');
      console.log('   - Start MongoDB service: net start MongoDB');
      console.log('   - Or run: mongod (in a separate terminal)');
      console.log('');
      console.log('3. Create/update .env file in backend directory:');
      console.log('   MONGO_URI=your_mongodb_connection_string');
      console.log('');
      console.log('   Example for MongoDB Atlas:');
      console.log('   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
      console.log('');
      console.log('   Example for local MongoDB:');
      console.log('   MONGO_URI=mongodb://localhost:27017/tws');
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      throw mongoError;
    }
    console.log('');
    
    // Step 1: Find or get default organization
    let organization = await Organization.findOne({ status: 'active' });
    
    if (!organization) {
      console.log('⚠️  No active organization found. Creating default organization...');
      organization = new Organization({
        name: 'Default Organization',
        slug: 'default-org',
        description: 'Default organization for co-founder access',
        industry: 'Technology',
        size: '11-50',
        plan: 'enterprise',
        settings: {
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD',
          workingHours: {
            start: '09:00',
            end: '17:00',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          },
          features: {
            timeTracking: true,
            invoicing: true,
            integrations: true,
            aiFeatures: true
          }
        },
        status: 'active',
        subscription: {
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        }
      });
      await organization.save();
      console.log('✅ Default organization created');
    } else {
      console.log('✅ Found organization:', organization.name);
    }
    
    // Step 2: Find or create user
    let user = await User.findOne({ email: CO_FOUNDER_EMAIL });
    
    if (!user) {
      console.log('👤 Creating co-founder user...');
      user = new User({
        email: CO_FOUNDER_EMAIL,
        password: DEFAULT_PASSWORD, // Will be hashed by pre-save hook
        fullName: 'Co-Founder',
        role: 'owner', // Owner role for full access
        orgId: organization._id,
        status: 'active',
        jobTitle: 'Co-Founder',
        department: 'Executive'
      });
      await user.save();
      console.log('✅ Co-founder user created');
      console.log('⚠️  Default password:', DEFAULT_PASSWORD);
      console.log('⚠️  Please change password on first login!');
    } else {
      console.log('✅ Co-founder user already exists');
      // Update user to ensure they have owner role, active status, and password is set
      user.role = 'owner';
      user.status = 'active';
      user.orgId = organization._id;
      user.password = DEFAULT_PASSWORD; // Ensure password is set (will be hashed by pre-save hook)
      await user.save();
      console.log('✅ User updated with owner role and password reset');
      console.log('⚠️  Password has been set to:', DEFAULT_PASSWORD);
      console.log('⚠️  Please change password on first login!');
    }
    
    // Step 3: Create or update SoftwareHouseRole with all 14 modules
    let coFounderRole = await SoftwareHouseRole.findOne({
      orgId: organization._id,
      name: 'Co-Founder - All Modules Access',
      roleType: 'owner'
    });
    
    if (!coFounderRole) {
      console.log('🎭 Creating SoftwareHouseRole with all 14 modules...');
      coFounderRole = new SoftwareHouseRole({
        orgId: organization._id,
        name: 'Co-Founder - All Modules Access',
        description: 'Co-Founder role with access to all 14 ERP modules',
        level: 'director',
        roleType: 'owner',
        
        // Project Access - Full permissions
        projectAccess: {
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canAssign: true,
          canViewAll: true,
          canViewAssigned: true
        },
        
        // Sprint Access - Full permissions
        sprintAccess: {
          canCreate: true,
          canEdit: true,
          canStart: true,
          canComplete: true,
          canManageBacklog: true
        },
        
        // Task Access - Full permissions
        taskAccess: {
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canAssign: true,
          canViewAll: true,
          canViewAssigned: true
        },
        
        // Time Tracking Access - Full permissions
        timeTrackingAccess: {
          canLogTime: true,
          canEditTime: true,
          canViewAllTime: true,
          canApproveTime: true,
          canSetRates: true
        },
        
        // Client Access - Full permissions
        clientAccess: {
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canViewAll: true,
          canViewAssigned: true,
          canManageContracts: true
        },
        
        // Financial Access - Full permissions
        financialAccess: {
          canViewBudget: true,
          canEditBudget: true,
          canViewInvoices: true,
          canCreateInvoices: true,
          canViewReports: true
        },
        
        // Analytics Access - Full permissions
        analyticsAccess: {
          canViewProjectAnalytics: true,
          canViewTeamAnalytics: true,
          canViewClientAnalytics: true,
          canViewFinancialAnalytics: true,
          canExportReports: true
        },
        
        // HR Access - Full permissions
        hrAccess: {
          canViewTeam: true,
          canManageTeam: true,
          canViewPerformance: true,
          canManagePerformance: true
        },
        
        // System Access - Full permissions
        systemAccess: {
          canManageUsers: true,
          canManageRoles: true,
          canManageSettings: true,
          canViewLogs: true
        },
        
        // Module Access - All 14 modules enabled
        moduleAccess: ALL_14_MODULES,
        
        // Tech Stack Access - All technologies
        techStackAccess: {
          frontend: ['*'],
          backend: ['*'],
          database: ['*'],
          cloud: ['*'],
          tools: ['*']
        },
        
        // Project Type Access - All project types
        projectTypeAccess: {
          web_application: true,
          mobile_app: true,
          api_development: true,
          system_integration: true,
          maintenance_support: true,
          consulting: true
        },
        
        isActive: true,
        createdBy: user._id
      });
    } else {
      console.log('✅ Co-Founder role already exists. Updating with all 14 modules...');
      // Update existing role with all modules
      coFounderRole.moduleAccess = ALL_14_MODULES;
      coFounderRole.level = 'director';
      coFounderRole.isActive = true;
      
      // Ensure all permissions are enabled
      Object.keys(coFounderRole.projectAccess || {}).forEach(key => {
        if (typeof coFounderRole.projectAccess[key] === 'boolean') {
          coFounderRole.projectAccess[key] = true;
        }
      });
    }
    
    await coFounderRole.save();
    console.log('✅ SoftwareHouseRole created/updated with all 14 modules');
    console.log('📋 Modules enabled:', Object.keys(ALL_14_MODULES).join(', '));
    
    // Step 4: Assign role to user
    // Check if User model has softwareHouseRole field, if not we'll add it
    user.softwareHouseRole = coFounderRole._id;
    await user.save();
    console.log('✅ Role assigned to user');
    
    // Step 5: Verify access
    console.log('\n📊 Verification Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 User:', user.email);
    console.log('👤 Full Name:', user.fullName);
    console.log('👤 Role:', user.role);
    console.log('👤 Status:', user.status);
    console.log('🏢 Organization:', organization.name);
    console.log('🎭 SoftwareHouseRole:', coFounderRole.name);
    console.log('🎭 Role Type:', coFounderRole.roleType);
    console.log('🎭 Role Level:', coFounderRole.level);
    console.log('\n📦 Module Access:');
    Object.entries(coFounderRole.moduleAccess).forEach(([module, enabled]) => {
      console.log(`   ${enabled ? '✅' : '❌'} ${module}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n✅ Successfully granted all 14 modules access to co-founder!');
    console.log('⚠️  Reminder: User should change password on first login');
    
  } catch (error) {
    console.error('❌ Error granting module access:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
grantAllModulesAccess();

