/**
 * Quick script to verify if a TWSAdmin user exists and test password
 * Usage: node scripts/verify-user.js <email> [password]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const TWSAdmin = require('../src/models/TWSAdmin');
const User = require('../src/models/User');

const email = process.argv[2];
const password = process.argv[3];

if (!email) {
  console.error('Usage: node scripts/verify-user.js <email> [password]');
  process.exit(1);
}

async function verifyUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tws';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`\n🔍 Searching for user: ${normalizedEmail}\n`);
    
    // Check TWSAdmin
    const twsAdmin = await TWSAdmin.findOne({ email: normalizedEmail });
    
    if (twsAdmin) {
      console.log('✅ Found in TWSAdmin model:');
      console.log('  - ID:', twsAdmin._id);
      console.log('  - Email:', twsAdmin.email);
      console.log('  - Full Name:', twsAdmin.fullName);
      console.log('  - Role:', twsAdmin.role);
      console.log('  - Status:', twsAdmin.status);
      console.log('  - Department:', twsAdmin.department);
      console.log('  - Has Password:', !!twsAdmin.password);
      console.log('  - Last Login:', twsAdmin.lastLogin || 'Never');
      
      if (password) {
        const passwordMatch = await twsAdmin.comparePassword(password);
        console.log('  - Password Match:', passwordMatch ? '✅ YES' : '❌ NO');
        if (!passwordMatch) {
          console.log('\n⚠️  Password does not match!');
        }
      } else {
        console.log('  - Password: Not tested (provide password as second argument)');
      }
      
      await mongoose.disconnect();
      process.exit(0);
    }
    
    // Check User model
    const user = await User.findOne({ email: normalizedEmail });
    
    if (user) {
      console.log('✅ Found in User model:');
      console.log('  - ID:', user._id);
      console.log('  - Email:', user.email);
      console.log('  - Full Name:', user.fullName);
      console.log('  - Role:', user.role);
      console.log('  - Status:', user.status);
      console.log('  - Has Password:', !!user.password);
      console.log('  - Last Login:', user.lastLogin || 'Never');
      
      if (password) {
        const passwordMatch = await user.comparePassword(password);
        console.log('  - Password Match:', passwordMatch ? '✅ YES' : '❌ NO');
        if (!passwordMatch) {
          console.log('\n⚠️  Password does not match!');
        }
      } else {
        console.log('  - Password: Not tested (provide password as second argument)');
      }
      
      await mongoose.disconnect();
      process.exit(0);
    }
    
    console.log('❌ User not found in TWSAdmin or User models');
    console.log('\n💡 Suggestions:');
    console.log('  1. Check if the user was created successfully');
    console.log('  2. Verify the email is correct');
    console.log('  3. Check database connection');
    
    await mongoose.disconnect();
    process.exit(1);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verifyUser();
