const mongoose = require('mongoose');
const User = require('./src/models/User');
const Organization = require('./src/models/Organization');

async function checkAdminCredentials() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack');
    console.log('✅ Connected to MongoDB');

    // Check if the admin user exists
    const adminUser = await User.findOne({ email: 'ceoofthewolfstack@gmail.com' });
    
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log('   Email:', adminUser.email);
      console.log('   Full Name:', adminUser.fullName);
      console.log('   Role:', adminUser.role);
      console.log('   Status:', adminUser.status);
      console.log('   Organization ID:', adminUser.orgId);
      
      // Check the organization
      const org = await Organization.findById(adminUser.orgId);
      if (org) {
        console.log('   Organization:', org.name);
      }
    } else {
      console.log('❌ Admin user not found');
      
      // List all users
      const allUsers = await User.find({}).select('email fullName role status');
      console.log('\n📋 All users in database:');
      allUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.fullName}) - ${user.role} - ${user.status}`);
      });
    }

    // Check organizations
    const orgs = await Organization.find({}).select('name status');
    console.log('\n🏢 Organizations:');
    orgs.forEach(org => {
      console.log(`   - ${org.name} (${org.status})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkAdminCredentials();
