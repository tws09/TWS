#!/usr/bin/env node

const mongoose = require('mongoose');
const PortalMigrationService = require('./portalMigration');
require('dotenv').config();

async function runMigration() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const migrationService = new PortalMigrationService();
    
    const command = process.argv[2];
    
    switch (command) {
      case 'migrate':
        console.log('Starting Portal migration...');
        const result = await migrationService.migrateAllData();
        console.log('\nMigration Result:', result);
        break;
        
      case 'rollback':
        console.log('Starting migration rollback...');
        const rollbackResult = await migrationService.rollbackMigration();
        console.log('\nRollback Result:', rollbackResult);
        break;
        
      case 'validate':
        console.log('Validating migration...');
        const validationResult = await migrationService.validateMigration();
        console.log('\nValidation Result:', validationResult);
        break;
        
      default:
        console.log('Usage: node portalMigration.js [migrate|rollback|validate]');
        console.log('');
        console.log('Commands:');
        console.log('  migrate  - Migrate existing data to Portal structure');
        console.log('  rollback - Rollback migration (remove Portal data)');
        console.log('  validate - Validate migration results');
        break;
    }
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

runMigration();
