/**
 * Database Migration Script: Add Client Portal Settings to Existing Projects
 * 
 * SECURITY: This script adds default client portal settings to all existing projects
 * that don't have portalSettings configured.
 * 
 * Usage:
 *   node backend/scripts/migrate-client-portal-settings.js
 * 
 * Rollback:
 *   The script creates a backup before migration. To rollback:
 *   1. Restore from backup file in backend/backups/
 *   2. Or manually set portalSettings to null for migrated projects
 */

const mongoose = require('mongoose');
const Project = require('../src/models/Project');
const fs = require('fs');
const path = require('path');

/**
 * Default client portal settings for migration
 */
const DEFAULT_PORTAL_SETTINGS = {
  isPortalProject: false,
  portalVisibility: 'private',
  allowClientPortal: false, // SECURITY: Default to false (opt-in)
  clientCanCreateCards: false,
  clientCanEditCards: true,
  requireClientApproval: false,
  autoNotifyClient: true,
  syncWithERP: true,
  features: {
    projectProgress: false,
    timeTracking: false,
    invoices: false,
    documents: false,
    communication: false
  }
};

/**
 * Create backup directory if it doesn't exist
 */
function ensureBackupDirectory() {
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

/**
 * Create backup of projects before migration
 */
async function createBackup() {
  try {
    console.log('📦 Creating backup of projects...');
    const projects = await Project.find({}).lean();
    const backupDir = ensureBackupDirectory();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `client_portal_migration_${timestamp}.json`);
    
    fs.writeFileSync(backupPath, JSON.stringify(projects, null, 2));
    console.log(`✅ Backup created: ${backupPath}`);
    console.log(`   Total projects backed up: ${projects.length}`);
    
    return backupPath;
  } catch (error) {
    console.error('❌ Failed to create backup:', error);
    throw error;
  }
}

/**
 * Restore projects from backup
 */
async function restoreFromBackup(backupPath) {
  try {
    console.log(`🔄 Restoring from backup: ${backupPath}`);
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }
    
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    // Delete all projects
    await Project.deleteMany({});
    console.log('   Deleted all projects');
    
    // Restore from backup
    await Project.insertMany(backup);
    console.log(`✅ Restored ${backup.length} projects from backup`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to restore from backup:', error);
    throw error;
  }
}

/**
 * Migrate client portal settings
 */
async function migrateClientPortalSettings() {
  const session = await mongoose.startSession();
  let backupPath = null;
  
  try {
    console.log('🔄 Starting client portal settings migration...');
    console.log('=' .repeat(60));
    
    // Start transaction
    session.startTransaction();
    
    // Step 1: Create backup
    backupPath = await createBackup();
    
    // Step 2: Find projects without portalSettings
    const projectsToMigrate = await Project.find({
      $or: [
        { 'settings.portalSettings': { $exists: false } },
        { 'settings': { $exists: false } }
      ]
    }).session(session);
    
    console.log(`📊 Found ${projectsToMigrate.length} projects to migrate`);
    
    if (projectsToMigrate.length === 0) {
      console.log('✅ No projects need migration. All projects already have portalSettings.');
      await session.commitTransaction();
      return {
        success: true,
        migrated: 0,
        backupPath: backupPath
      };
    }
    
    // Step 3: Apply default settings
    let migrated = 0;
    let errors = [];
    
    for (const project of projectsToMigrate) {
      try {
        // Ensure settings object exists
        if (!project.settings) {
          project.settings = {};
        }
        
        // Only set if portalSettings doesn't exist
        if (!project.settings.portalSettings) {
          project.settings.portalSettings = DEFAULT_PORTAL_SETTINGS;
          await project.save({ session });
          migrated++;
          
          if (migrated % 100 === 0) {
            console.log(`   Migrated ${migrated} projects...`);
          }
        }
      } catch (error) {
        errors.push({
          projectId: project._id,
          error: error.message
        });
        console.error(`   ⚠️ Error migrating project ${project._id}:`, error.message);
      }
    }
    
    console.log(`✅ Migrated ${migrated} projects`);
    
    if (errors.length > 0) {
      console.log(`⚠️ ${errors.length} projects had errors during migration`);
    }
    
    // Step 4: Verify migration
    const verification = await Project.countDocuments({
      'settings.portalSettings': { $exists: true }
    }).session(session);
    
    const totalProjects = await Project.countDocuments({}).session(session);
    
    console.log(`✅ Verification:`);
    console.log(`   Total projects: ${totalProjects}`);
    console.log(`   Projects with portalSettings: ${verification}`);
    console.log(`   Migration success rate: ${((verification / totalProjects) * 100).toFixed(2)}%`);
    
    // Step 5: Commit transaction
    await session.commitTransaction();
    console.log('=' .repeat(60));
    console.log('✅ Migration completed successfully');
    
    return {
      success: true,
      migrated: migrated,
      totalProjects: totalProjects,
      projectsWithSettings: verification,
      errors: errors,
      backupPath: backupPath
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('=' .repeat(60));
    
    // Rollback transaction
    if (session.inTransaction()) {
      try {
        await session.abortTransaction();
        console.log('🔄 Transaction aborted');
      } catch (abortError) {
        console.error('Error aborting transaction:', abortError);
      }
    }
    
    // Offer to restore from backup
    if (backupPath && fs.existsSync(backupPath)) {
      console.log('\n⚠️ Migration failed. You can restore from backup using:');
      console.log(`   node backend/scripts/restore-from-backup.js ${backupPath}`);
      console.log('\nOr manually restore by running:');
      console.log(`   restoreFromBackup('${backupPath}')`);
    }
    
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/tws';
    console.log('🔌 Connecting to MongoDB...');
    console.log(`   URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('');
    
    // Run migration
    const result = await migrateClientPortalSettings();
    
    // Print summary
    console.log('');
    console.log('📊 Migration Summary:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Projects migrated: ${result.migrated}`);
    console.log(`   Total projects: ${result.totalProjects}`);
    console.log(`   Projects with settings: ${result.projectsWithSettings}`);
    if (result.errors && result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.length}`);
    }
    console.log(`   Backup location: ${result.backupPath}`);
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Migration failed with error:');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for programmatic use
module.exports = {
  migrateClientPortalSettings,
  restoreFromBackup,
  DEFAULT_PORTAL_SETTINGS
};
