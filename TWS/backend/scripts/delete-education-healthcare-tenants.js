/**
 * One-off script: Permanently delete all tenants with erpCategory 'education' or 'healthcare'.
 * Product is now Software House ERP only.
 *
 * Usage:
 *   node scripts/delete-education-healthcare-tenants.js           # run deletion
 *   node scripts/delete-education-healthcare-tenants.js --dry-run # list only, no delete
 *
 * Requires MONGO_URI or MONGODB_URI or DATABASE_URL in .env.
 * WARNING: Destructive and irreversible. Related data (users, orgs) may need separate cleanup.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/tws';
const isDryRun = process.argv.includes('--dry-run');

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    const Tenant = require(path.join(__dirname, '../src/models/Tenant'));

    const toDelete = await Tenant.find({
      erpCategory: { $in: ['education', 'healthcare'] }
    }).select('_id name slug erpCategory createdAt').lean();

    console.log(`Found ${toDelete.length} tenant(s) with erpCategory education or healthcare.`);
    if (toDelete.length === 0) {
      await mongoose.disconnect();
      return;
    }
    toDelete.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.name} (${t.slug}) [${t.erpCategory}]`);
    });

    if (isDryRun) {
      console.log('\n[DRY RUN] No tenants were deleted. Run without --dry-run to delete.');
      await mongoose.disconnect();
      return;
    }

    const ids = toDelete.map(t => t._id);
    const result = await Tenant.deleteMany({ _id: { $in: ids } });
    console.log(`\nDeleted ${result.deletedCount} tenant(s).`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
