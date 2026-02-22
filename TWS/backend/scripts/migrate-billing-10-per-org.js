/**
 * Migration Script: Update billing to $10/org with 7 days trial
 * 
 * Updates all existing tenants to:
 * - subscription.price: 10
 * - subscription.currency: 'USD'
 * - subscription.trialStartDate: createdAt (or keep existing)
 * - subscription.trialEndDate: createdAt + 7 days (for trialing tenants)
 * 
 * Run: node TWS/backend/scripts/migrate-billing-10-per-org.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Tenant = require('../src/models/Tenant');
const billingConfig = require('../src/config/billingConfig');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tws');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const migrate = async () => {
  try {
    console.log('Starting billing migration: $10/org, 7 days trial...\n');

    const tenants = await Tenant.find({});
    console.log(`Found ${tenants.length} tenants to process\n`);

    let updated = 0;
    for (const tenant of tenants) {
      const updates = {};
      let needsUpdate = false;

      // Update price to $10
      if (tenant.subscription?.price !== billingConfig.PRICE_PER_ORG) {
        updates['subscription.price'] = billingConfig.PRICE_PER_ORG;
        needsUpdate = true;
      }
      if (tenant.subscription?.currency !== billingConfig.CURRENCY) {
        updates['subscription.currency'] = billingConfig.CURRENCY;
        needsUpdate = true;
      }

      // For trialing tenants: set 7-day trial from creation or trial start
      if (tenant.subscription?.status === 'trialing') {
        const baseDate = tenant.subscription.trialStartDate || tenant.createdAt || new Date();
        const newTrialEnd = new Date(baseDate.getTime() + billingConfig.TRIAL_DURATION_MS);
        
        if (!tenant.subscription.trialStartDate) {
          updates['subscription.trialStartDate'] = baseDate;
          needsUpdate = true;
        }
        if (!tenant.subscription.trialEndDate || 
            new Date(tenant.subscription.trialEndDate).getTime() !== newTrialEnd.getTime()) {
          updates['subscription.trialEndDate'] = newTrialEnd;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await Tenant.findByIdAndUpdate(tenant._id, { $set: updates });
        updated++;
        console.log(`  ✓ ${tenant.name} (${tenant.slug})`);
      }
    }

    console.log(`\nMigration complete: ${updated}/${tenants.length} tenants updated`);
    console.log('Billing: $10/org, 7 days free trial for all categories');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await migrate();
  await mongoose.connection.close();
  console.log('Done');
  process.exit(0);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
