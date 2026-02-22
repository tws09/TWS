/**
 * Script to permanently delete specific WolfStack users
 * WARNING: This will permanently delete users from the database
 */

const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack';

const USERS_TO_DELETE = [
  '14modules@gmail.com',
  'fas@gmail.com',
  'admin@tws.com'
];

async function deleteUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('⚠️  WARNING: This will permanently delete users from the database!\n');
    console.log('📋 Users to delete:');
    USERS_TO_DELETE.forEach((email, index) => {
      console.log(`   ${index + 1}. ${email}`);
    });
    console.log('');

    // Find and delete each user
    let deletedCount = 0;
    let notFoundCount = 0;

    for (const email of USERS_TO_DELETE) {
      console.log(`\n🔍 Looking for user: ${email}`);
      
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (user) {
        console.log(`   ✅ Found user: ${user.fullName || 'N/A'}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🎭 Role: ${user.role}`);
        console.log(`   📊 Status: ${user.status}`);
        console.log(`   🗑️  Deleting...`);
        
        await User.deleteOne({ _id: user._id });
        console.log(`   ✅ User deleted successfully`);
        deletedCount++;
      } else {
        console.log(`   ❌ User not found (may already be deleted)`);
        notFoundCount++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 DELETION SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   ✅ Deleted: ${deletedCount} user(s)`);
    console.log(`   ❌ Not Found: ${notFoundCount} user(s)`);
    console.log(`   📋 Total Processed: ${USERS_TO_DELETE.length} user(s)`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Verify deletion
    console.log('🔍 Verifying deletion...');
    const remainingUsers = await User.find({ 
      email: { $in: USERS_TO_DELETE.map(e => e.toLowerCase()) } 
    });
    
    if (remainingUsers.length === 0) {
      console.log('✅ All specified users have been deleted successfully\n');
    } else {
      console.log(`⚠️  Warning: ${remainingUsers.length} user(s) still exist:`);
      remainingUsers.forEach(user => {
        console.log(`   - ${user.email}`);
      });
      console.log('');
    }

    // Show remaining WolfStack users
    const Organization = require('../src/models/Organization');
    const organization = await Organization.findOne({ slug: 'wolfstack' });
    
    if (organization) {
      const remainingWolfStackUsers = await User.find({ orgId: organization._id })
        .select('email fullName role status');
      
      console.log('📋 Remaining WolfStack Users:');
      console.log('───────────────────────────────────────────────────────────');
      if (remainingWolfStackUsers.length === 0) {
        console.log('   No users remaining in WolfStack organization');
      } else {
        remainingWolfStackUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email}`);
          console.log(`      Name: ${user.fullName || 'N/A'}`);
          console.log(`      Role: ${user.role || 'N/A'}`);
          console.log(`      Status: ${user.status || 'N/A'}`);
          console.log('');
        });
      }
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
deleteUsers()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

