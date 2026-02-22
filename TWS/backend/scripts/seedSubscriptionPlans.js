const mongoose = require('mongoose');
const SubscriptionPlan = require('../src/models/SubscriptionPlan');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tws', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed subscription plans
const seedSubscriptionPlans = async () => {
  try {
    // Clear existing plans
    await SubscriptionPlan.deleteMany({});
    console.log('Cleared existing subscription plans');

    // Define subscription plans
    const plans = [
      {
        name: 'Starter',
        description: 'Perfect for small software houses getting started',
        tier: 'starter',
        price: {
          monthly: 99,
          yearly: 990
        },
        features: {
          maxUsers: 10,
          maxProjects: 5,
          maxClients: 20,
          storage: '10GB',
          support: 'email',
          analytics: 'basic',
          integrations: ['github'],
          customBranding: false,
          apiAccess: false,
          whiteLabeling: false,
          prioritySupport: false,
          dedicatedAccountManager: false
        },
        limits: {
          projects: 5,
          users: 10,
          clients: 20,
          storage: 10737418240, // 10GB in bytes
          apiCalls: 1000,
          exports: 10
        },
        isActive: true,
        isPopular: false
      },
      {
        name: 'Professional',
        description: 'Ideal for growing software houses with multiple projects',
        tier: 'professional',
        price: {
          monthly: 299,
          yearly: 2990
        },
        features: {
          maxUsers: 50,
          maxProjects: 25,
          maxClients: 100,
          storage: '100GB',
          support: 'priority',
          analytics: 'advanced',
          integrations: ['github', 'jira', 'trello'],
          customBranding: true,
          apiAccess: true,
          whiteLabeling: false,
          prioritySupport: true,
          dedicatedAccountManager: false
        },
        limits: {
          projects: 25,
          users: 50,
          clients: 100,
          storage: 107374182400, // 100GB in bytes
          apiCalls: 10000,
          exports: 100
        },
        isActive: true,
        isPopular: true
      },
      {
        name: 'Enterprise',
        description: 'For large software houses with complex needs',
        tier: 'enterprise',
        price: {
          monthly: 799,
          yearly: 7990
        },
        features: {
          maxUsers: 200,
          maxProjects: 100,
          maxClients: 500,
          storage: '1TB',
          support: 'dedicated',
          analytics: 'enterprise',
          integrations: ['github', 'jira', 'trello', 'azure', 'aws'],
          customBranding: true,
          apiAccess: true,
          whiteLabeling: true,
          prioritySupport: true,
          dedicatedAccountManager: true
        },
        limits: {
          projects: 100,
          users: 200,
          clients: 500,
          storage: 1099511627776, // 1TB in bytes
          apiCalls: 100000,
          exports: 1000
        },
        isActive: true,
        isPopular: false
      },
      {
        name: 'Custom',
        description: 'Tailored solutions for unique requirements',
        tier: 'custom',
        price: {
          monthly: 0, // Custom pricing
          yearly: 0
        },
        features: {
          maxUsers: -1, // Unlimited
          maxProjects: -1,
          maxClients: -1,
          storage: 'unlimited',
          support: 'dedicated',
          analytics: 'enterprise',
          integrations: ['all'],
          customBranding: true,
          apiAccess: true,
          whiteLabeling: true,
          prioritySupport: true,
          dedicatedAccountManager: true
        },
        limits: {
          projects: -1, // Unlimited
          users: -1,
          clients: -1,
          storage: -1,
          apiCalls: -1,
          exports: -1
        },
        isActive: true,
        isPopular: false,
        isCustom: true
      }
    ];

    // Insert plans
    const createdPlans = await SubscriptionPlan.insertMany(plans);
    console.log(`Successfully created ${createdPlans.length} subscription plans`);

    // Display created plans
    createdPlans.forEach(plan => {
      console.log(`- ${plan.name} (${plan.tier}): $${plan.price.monthly}/month`);
    });

  } catch (error) {
    console.error('Error seeding subscription plans:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await seedSubscriptionPlans();
  await mongoose.connection.close();
  console.log('Database connection closed');
  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Error in main execution:', error);
    process.exit(1);
  });
}

module.exports = { seedSubscriptionPlans };

