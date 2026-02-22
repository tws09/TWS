const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Organization = require('./src/models/Organization');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Create default organization first
    let organization = await Organization.findOne({ slug: 'wolfstack' });
    if (!organization) {
      organization = new Organization({
        name: 'Wolf Stack',
        slug: 'wolfstack',
        description: 'Default organization for Wolf Stack Management Portal',
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
        }
      });
      await organization.save();
      console.log('✅ Default organization created');
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@wolfstack.com' });
    if (existingAdmin) {
      // Update existing admin user with orgId if missing
      if (!existingAdmin.orgId) {
        existingAdmin.orgId = organization._id;
        existingAdmin.role = 'super_admin';
        await existingAdmin.save();
        console.log('✅ Admin user updated with organization');
      }
      console.log('Admin user already exists!');
      console.log('Email: admin@wolfstack.com');
      console.log('Password: admin123');
      console.log('Role: Super Admin');
      process.exit(0);
    }

    // Create admin user (password will be hashed by pre-save hook)
    const adminUser = new User({
      email: 'admin@wolfstack.com',
      password: 'admin123',
      fullName: 'System Administrator',
      role: 'super_admin',
      orgId: organization._id,
      status: 'active',
      emailVerified: true,
      profilePicUrl: null,
      lastLogin: null,
      twoFAEnabled: false,
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en'
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@wolfstack.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: Super Admin (Full Access)');
    console.log('🏢 Organization: Wolf Stack');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

createAdminUser();
