/**
 * Script to check and reset password for ceoofthewolfstack@gmail.com
 * Since passwords are hashed, we'll reset it to a known value
 */

const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack';

const CEO_EMAIL = 'ceoofthewolfstack@gmail.com';
const NEW_PASSWORD = 'admin123'; // Reset to this password

async function resetCEOPassword() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log(`🔍 Looking for user: ${CEO_EMAIL}`);
    
    // Find the user
    let user = await User.findOne({ email: CEO_EMAIL });
    
    if (!user) {
      console.log('❌ User not found!');
      console.log('   Creating user...\n');
      
      // Get or create wolfstack organization
      const Organization = require('../src/models/Organization');
      let organization = await Organization.findOne({ slug: 'wolfstack' });
      if (!organization) {
        organization = new Organization({
          name: 'Wolf Stack',
          slug: 'wolfstack',
          status: 'active'
        });
        await organization.save();
      }
      
      // Create user
      user = new User({
        email: CEO_EMAIL,
        password: NEW_PASSWORD,
        fullName: 'CEO of The Wolf Stack',
        role: 'super_admin',
        orgId: organization._id,
        status: 'active',
        emailVerified: true
      });
      await user.save();
      console.log('✅ User created successfully\n');
    } else {
      console.log('✅ User found');
      console.log(`   Name: ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}\n`);
      
      // Test current password
      console.log('🔐 Testing current password...');
      const userWithPassword = await User.findById(user._id).select('+password');
      
      // Try common passwords
      const commonPasswords = ['admin123', 'password', 'admin', 'wolfstack', 'ceo123', 'admin@123'];
      let passwordFound = false;
      
      for (const testPassword of commonPasswords) {
        try {
          const isValid = await userWithPassword.comparePassword(testPassword);
          if (isValid) {
            console.log(`   ✅ Current password is: "${testPassword}"`);
            passwordFound = true;
            break;
          }
        } catch (err) {
          // Continue to next password
        }
      }
      
      if (!passwordFound) {
        console.log('   ❌ Could not determine current password (it\'s hashed)');
        console.log(`   🔄 Resetting password to: "${NEW_PASSWORD}"\n`);
        
        // Reset password
        userWithPassword.password = NEW_PASSWORD; // Will be hashed by pre-save hook
        await userWithPassword.save();
        console.log('   ✅ Password reset successfully\n');
      } else {
        console.log('\n   💡 If you want to reset it anyway, uncomment the reset code in the script\n');
      }
    }
    
    // Verify the password works
    console.log('🔐 Verifying password...');
    const finalUser = await User.findById(user._id).select('+password');
    const passwordValid = await finalUser.comparePassword(NEW_PASSWORD);
    
    if (passwordValid) {
      console.log(`   ✅ Password verified: "${NEW_PASSWORD}" works!\n`);
    } else {
      console.log(`   ❌ Password verification failed\n`);
    }
    
    // Final summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Email:    ${CEO_EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    console.log(`   Role:     ${user.role}`);
    console.log(`   Status:   ${user.status}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('🌐 Login URL: http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
resetCEOPassword()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

