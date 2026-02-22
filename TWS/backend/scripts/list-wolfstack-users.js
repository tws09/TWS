/**
 * Script to list all users with access to WolfStack ERP
 * This script shows all users belonging to the 'wolfstack' organization
 */

const mongoose = require('mongoose');
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack';

async function listWolfStackUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find WolfStack organization
    const organization = await Organization.findOne({ slug: 'wolfstack' });
    
    if (!organization) {
      console.log('❌ WolfStack organization not found!');
      console.log('   Creating it now...\n');
      
      const newOrg = new Organization({
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
      await newOrg.save();
      console.log('✅ WolfStack organization created\n');
      
      console.log('📋 Users with WolfStack ERP Access:');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('   No users found (organization was just created)');
      console.log('═══════════════════════════════════════════════════════════\n');
      return;
    }

    console.log('✅ WolfStack organization found');
    console.log(`   Name: ${organization.name}`);
    console.log(`   Slug: ${organization.slug}`);
    console.log(`   Status: ${organization.status}\n`);

    // Find all users belonging to WolfStack organization
    const users = await User.find({ orgId: organization._id })
      .select('email fullName role status emailVerified createdAt lastLogin')
      .sort({ createdAt: -1 });

    console.log('📋 Users with WolfStack ERP Access:');
    console.log('═══════════════════════════════════════════════════════════');
    
    if (users.length === 0) {
      console.log('   ❌ No users found');
      console.log('   💡 Users need to be created and assigned to the wolfstack organization');
    } else {
      console.log(`   Total Users: ${users.length}\n`);
      
      users.forEach((user, index) => {
        console.log(`\n   ${index + 1}. ${user.fullName || 'N/A'}`);
        console.log(`      📧 Email: ${user.email}`);
        console.log(`      🎭 Role: ${user.role || 'N/A'}`);
        console.log(`      📊 Status: ${user.status || 'N/A'}`);
        console.log(`      ✅ Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
        console.log(`      📅 Created: ${user.createdAt ? user.createdAt.toLocaleString() : 'N/A'}`);
        console.log(`      🔐 Last Login: ${user.lastLogin ? user.lastLogin.toLocaleString() : 'Never'}`);
        
        // Status indicator
        if (user.status === 'active') {
          console.log(`      ✅ Access: ACTIVE - Can login to WolfStack ERP`);
        } else {
          console.log(`      ⚠️  Access: ${user.status.toUpperCase()} - Cannot login`);
        }
      });
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    
    // Summary statistics
    if (users.length > 0) {
      const activeUsers = users.filter(u => u.status === 'active').length;
      const inactiveUsers = users.filter(u => u.status !== 'active').length;
      const verifiedUsers = users.filter(u => u.emailVerified).length;
      const neverLoggedIn = users.filter(u => !u.lastLogin).length;
      
      console.log('\n📊 Summary Statistics:');
      console.log('───────────────────────────────────────────────────────────');
      console.log(`   Total Users: ${users.length}`);
      console.log(`   ✅ Active: ${activeUsers}`);
      console.log(`   ⚠️  Inactive: ${inactiveUsers}`);
      console.log(`   ✅ Email Verified: ${verifiedUsers}`);
      console.log(`   🔐 Never Logged In: ${neverLoggedIn}`);
      console.log('───────────────────────────────────────────────────────────\n');
      
      // Role distribution
      const roleCounts = {};
      users.forEach(user => {
        const role = user.role || 'unknown';
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      });
      
      console.log('👥 Role Distribution:');
      console.log('───────────────────────────────────────────────────────────');
      Object.entries(roleCounts).forEach(([role, count]) => {
        console.log(`   ${role}: ${count}`);
      });
      console.log('───────────────────────────────────────────────────────────\n');
    }

    // Login information
    console.log('🔑 Login Information:');
    console.log('───────────────────────────────────────────────────────────');
    console.log('   Portal URL: http://localhost:3000/login');
    console.log('   API Endpoint: POST /api/auth/login');
    console.log('   Organization: WolfStack (wolfstack)');
    console.log('───────────────────────────────────────────────────────────\n');

    // Show which users can actually login
    const loginableUsers = users.filter(u => u.status === 'active');
    if (loginableUsers.length > 0) {
      console.log('✅ Users Who Can Login (Active Status):');
      console.log('───────────────────────────────────────────────────────────');
      loginableUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.fullName || 'N/A'}) - Role: ${user.role}`);
      });
      console.log('───────────────────────────────────────────────────────────\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
listWolfStackUsers()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

