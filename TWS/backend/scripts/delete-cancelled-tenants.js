/**
 * Script to permanently delete all cancelled tenants
 * 
 * Usage:
 *   node scripts/delete-cancelled-tenants.js
 * 
 * This script will:
 * 1. Find all tenants with status 'cancelled'
 * 2. Permanently delete them and all associated data
 * 3. Log the deletion to audit trail
 * 
 * WARNING: This is a DESTRUCTIVE operation that cannot be undone!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Tenant = require('../src/models/Tenant');
const tenantService = require('../src/services/tenantService');
const platformAdminAccessService = require('../src/services/platformAdminAccessService');

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/tws';

async function deleteCancelledTenants() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all cancelled tenants
    console.log('🔍 Finding cancelled tenants...');
    const cancelledTenants = await Tenant.find({ status: 'cancelled' }).select('_id name slug createdAt');
    
    if (!cancelledTenants || cancelledTenants.length === 0) {
      console.log('✅ No cancelled tenants found. Nothing to delete.');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n📋 Found ${cancelledTenants.length} cancelled tenant(s):\n`);
    cancelledTenants.forEach((tenant, index) => {
      console.log(`   ${index + 1}. ${tenant.name} (${tenant.slug}) - Created: ${tenant.createdAt}`);
    });

    // Confirm deletion
    console.log('\n⚠️  WARNING: This will PERMANENTLY DELETE all cancelled tenants and ALL associated data!');
    console.log('   This includes: users, organizations, sessions, billing, roles, permissions, etc.');
    console.log('   This operation CANNOT be undone!\n');

    // In a real script, you might want to add a confirmation prompt
    // For now, we'll proceed (you can add readline if needed)
    const tenantIds = cancelledTenants.map(t => t._id.toString());
    const deletedBy = 'system-script';

    console.log('🗑️  Starting deletion process...\n');
    
    // Delete each tenant
    const results = { deleted: [], failed: [] };
    
    for (const tenant of cancelledTenants) {
      try {
        console.log(`   Deleting: ${tenant.name} (${tenant.slug})...`);
        
        // Delete tenant with hard delete
        await tenantService.deleteTenant(tenant._id.toString(), deletedBy, true);
        
        // Log to audit trail
        await platformAdminAccessService.logPlatformAdminAccess({
          platformAdminId: deletedBy,
          platformAdminEmail: 'system@tws.local',
          platformAdminName: 'System Script',
          tenantId: tenant._id.toString(),
          tenantName: tenant.name,
          reason: 'bulk_delete_cancelled_tenants_script',
          ipAddress: '127.0.0.1',
          userAgent: 'delete-cancelled-tenants-script',
          endpoint: '/scripts/delete-cancelled-tenants',
          method: 'DELETE'
        });
        
        results.deleted.push(tenant._id.toString());
        console.log(`   ✅ Deleted: ${tenant.name}\n`);
      } catch (error) {
        console.error(`   ❌ Failed to delete ${tenant.name}: ${error.message}\n`);
        results.failed.push({ id: tenant._id.toString(), error: error.message });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DELETION SUMMARY');
    console.log('='.repeat(60));
    console.log(`   Total cancelled tenants: ${cancelledTenants.length}`);
    console.log(`   ✅ Successfully deleted: ${results.deleted.length}`);
    console.log(`   ❌ Failed: ${results.failed.length}`);
    
    if (results.failed.length > 0) {
      console.log('\n   Failed deletions:');
      results.failed.forEach((failure, index) => {
        const tenant = cancelledTenants.find(t => t._id.toString() === failure.id);
        console.log(`   ${index + 1}. ${tenant?.name || failure.id}: ${failure.error}`);
      });
    }
    
    console.log('\n✅ Process completed!');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
    process.exit(results.failed.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
deleteCancelledTenants();
