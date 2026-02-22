/**
 * Script to check and fix WolfStack login users
 * This script checks for fas@gmail.com and 14modules@gmail.com users
 * and creates/fixes them if needed
 */

const mongoose = require('mongoose');
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack';

const USERS_TO_CHECK = [
  {
    email: 'fas@gmail.com',
    fullName: 'FAS User',
    role: 'owner',
    password: 'admin123' // Default password - user should change this
  },
  {
    email: '14modules@gmail.com',
    fullName: 'Co-Founder',
    role: 'owner',
    password: 'admin123' // Default password - user should change this
  }
];

async function checkAndFixUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get or create WolfStack organization
    let organization = await Organization.findOne({ slug: 'wolfstack' });
    if (!organization) {
      console.log('📦 Creating WolfStack organization...');
      organization = new Organization({
        name: 'Wolf Stack',
        slug: 'wolfstack',
        description: 'Default organization for Wolf Stack Management Portal',
        plan: 'enterprise',
        status: 'active',
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
        }
      });
      await organization.save();
      console.log('✅ WolfStack organization created\n');
    } else {
      console.log('✅ WolfStack organization found\n');
    }

    // Check and fix each user
    for (const userData of USERS_TO_CHECK) {
      console.log(`\n🔍 Checking user: ${userData.email}`);
      
      let user = await User.findOne({ email: userData.email });
      
      if (user) {
        console.log(`   ✅ User exists`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Name: ${user.fullName}`);
        console.log(`   🎭 Role: ${user.role}`);
        console.log(`   📊 Status: ${user.status}`);
        console.log(`   🏢 Organization: ${user.orgId ? 'Assigned' : 'Not assigned'}`);
        
        // Check if user needs fixes
        let needsFix = false;
        
        if (user.status !== 'active') {
          console.log(`   ⚠️  Status is not 'active' - fixing...`);
          user.status = 'active';
          needsFix = true;
        }
        
        if (!user.orgId || user.orgId.toString() !== organization._id.toString()) {
          console.log(`   ⚠️  Organization not assigned - fixing...`);
          user.orgId = organization._id;
          needsFix = true;
        }
        
        // Test password - if it doesn't work, reset it
        const passwordValid = await user.comparePassword(userData.password);
        if (!passwordValid) {
          console.log(`   ⚠️  Password doesn't match '${userData.password}' - resetting...`);
          user.password = userData.password; // Will be hashed by pre-save hook
          needsFix = true;
        }
        
        if (needsFix) {
          await user.save();
          console.log(`   ✅ User fixed and saved`);
        } else {
          console.log(`   ✅ User is properly configured`);
        }
      } else {
        console.log(`   ❌ User does not exist - creating...`);
        
        user = new User({
          email: userData.email,
          password: userData.password, // Will be hashed by pre-save hook
          fullName: userData.fullName,
          role: userData.role,
          orgId: organization._id,
          status: 'active',
          emailVerified: true,
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          }
        });
        
        await user.save();
        console.log(`   ✅ User created successfully`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Password: ${userData.password}`);
        console.log(`   👤 Name: ${user.fullName}`);
        console.log(`   🎭 Role: ${user.role}`);
      }
    }

    console.log('\n\n📋 Summary:');
    console.log('═══════════════════════════════════════');
    console.log('WolfStack Login Users:');
    console.log('');
    
    for (const userData of USERS_TO_CHECK) {
      const user = await User.findOne({ email: userData.email });
      if (user) {
        const passwordValid = await user.comparePassword(userData.password);
        console.log(`✅ ${userData.email}`);
        console.log(`   Password: ${userData.password} ${passwordValid ? '✅ Valid' : '❌ Invalid'}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Role: ${user.role}`);
        console.log('');
      } else {
        console.log(`❌ ${userData.email} - NOT FOUND`);
        console.log('');
      }
    }
    
    console.log('═══════════════════════════════════════');
    console.log('\n✅ Script completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
checkAndFixUsers()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

