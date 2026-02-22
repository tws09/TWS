/**
 * Generate Encryption Keys for Education ERP
 * Run: node scripts/generate-encryption-keys.js
 */

const crypto = require('crypto');

console.log('🔐 Generating Encryption Keys for Education ERP\n');

const ferpaKey = crypto.randomBytes(32).toString('hex');
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('Add these to your .env file:\n');
console.log('# FERPA Compliance');
console.log(`FERPA_ENCRYPTION_KEY=${ferpaKey}`);
console.log(`FERPA_COMPLIANCE_ENABLED=true\n`);
console.log('# General Encryption');
console.log(`ENCRYPTION_KEY=${encryptionKey}\n`);
console.log('⚠️  IMPORTANT: Keep these keys secure and never commit them to version control!');
