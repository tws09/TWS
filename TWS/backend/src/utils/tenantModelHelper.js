const tenantModelService = require('../services/tenant/tenant-model.service');
const logger = require('./logger');

/**
 * Tenant Model Helper
 * Utility functions to get the correct model instance based on tenant context
 */

/**
 * Get the appropriate model instance for a tenant
 * @param {Object} req - Express request object (with tenantContext)
 * @param {String} modelName - Model name
 * @param {mongoose.Model} defaultModel - Default model (for shared database)
 * @param {mongoose.Schema} schema - Mongoose schema (for tenant database)
 * @returns {mongoose.Model} Model instance
 */
async function getTenantModel(req, modelName, defaultModel, schema) {
  try {
    // Check if tenant has separate database
    if (req.tenantContext && req.tenantContext.hasSeparateDatabase && req.tenantContext.connectionReady) {
      // Use tenant-specific model
      const tenantId = req.tenantContext.tenantId;
      return await tenantModelService.getTenantModel(tenantId, modelName, schema);
    } else {
      // Use default model (shared database)
      return defaultModel;
    }
  } catch (error) {
    logger.warn(`Error getting tenant model ${modelName}, falling back to default:`, error.message);
    // Fall back to default model
    return defaultModel;
  }
}

/**
 * Get model for a specific tenant ID
 * @param {String} tenantId - Tenant ID
 * @param {String} modelName - Model name
 * @param {mongoose.Model} defaultModel - Default model
 * @param {mongoose.Schema} schema - Mongoose schema
 * @returns {mongoose.Model} Model instance
 */
async function getModelForTenant(tenantId, modelName, defaultModel, schema) {
  try {
    // Try to get tenant connection
    const tenantConnectionPool = require('../services/tenant/tenant-connection-pool.service');
    const hasConnection = await tenantConnectionPool.hasActiveConnection(tenantId);
    
    if (hasConnection) {
      return await tenantModelService.getTenantModel(tenantId, modelName, schema);
    } else {
      return defaultModel;
    }
  } catch (error) {
    logger.warn(`Error getting model for tenant ${tenantId}, using default:`, error.message);
    return defaultModel;
  }
}

/**
 * Execute a query with tenant context
 * @param {Object} req - Express request object
 * @param {String} modelName - Model name
 * @param {mongoose.Model} defaultModel - Default model
 * @param {mongoose.Schema} schema - Mongoose schema
 * @param {Function} queryFn - Query function that receives the model
 * @returns {*} Query result
 */
async function executeWithTenantModel(req, modelName, defaultModel, schema, queryFn) {
  try {
    const model = await getTenantModel(req, modelName, defaultModel, schema);
    return await queryFn(model);
  } catch (error) {
    logger.error(`Error executing query with tenant model ${modelName}:`, error);
    throw error;
  }
}

module.exports = {
  getTenantModel,
  getModelForTenant,
  executeWithTenantModel
};

