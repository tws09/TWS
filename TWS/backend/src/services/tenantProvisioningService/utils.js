const crypto = require('crypto');

/**
 * Generate connection string for tenant database
 * @param {string} tenantId - Tenant ID
 * @returns {string} Connection string
 */
function generateConnectionString(tenantId) {
  const baseUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = `tws_${tenantId}`;
  
  // Extract base connection string (without database name)
  // Handle both standard and Atlas connection strings
  let baseConnection = baseUri;
  if (baseUri.includes('/') && !baseUri.includes('mongodb+srv://')) {
    // Standard MongoDB URI: mongodb://host:port/dbname
    baseConnection = baseUri.replace(/\/[^/?]*(\?|$)/, '');
  } else if (baseUri.includes('mongodb+srv://')) {
    // MongoDB Atlas URI: mongodb+srv://user:pass@cluster.net/dbname
    baseConnection = baseUri.replace(/\/[^/?]*(\?|$)/, '');
  }
  
  return `${baseConnection}/${dbName}`;
}

/**
 * Generate temporary password for admin user
 * @returns {string} Temporary password
 */
function generateTemporaryPassword() {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Calculate onboarding progress percentage
 * @param {Array} steps - Onboarding steps
 * @returns {number} Progress percentage
 */
function calculateOnboardingProgress(steps) {
  const completedSteps = steps.filter(step => step.completed).length;
  return Math.round((completedSteps / steps.length) * 100);
}

module.exports = {
  generateConnectionString,
  generateTemporaryPassword,
  calculateOnboardingProgress
};

