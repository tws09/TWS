const mongoose = require('mongoose');
const tenantConnectionPool = require('./tenant-connection-pool.service');
const logger = require('../../utils/logger');

/**
 * Tenant Model Service
 * Provides tenant-specific model instances that use tenant database connections
 */
class TenantModelService {
  constructor() {
    this.modelCache = new Map(); // Map<tenantId_modelName, Model>
  }

  /**
   * Get a model instance for a specific tenant
   * @param {String} tenantId - Tenant ID
   * @param {String} modelName - Model name (e.g., 'User', 'Project')
   * @param {mongoose.Schema} schema - Mongoose schema
   * @returns {mongoose.Model} Tenant-specific model instance
   */
  async getTenantModel(tenantId, modelName, schema) {
    try {
      const cacheKey = `${tenantId}_${modelName}`;

      // Check if model is already cached
      if (this.modelCache.has(cacheKey)) {
        return this.modelCache.get(cacheKey);
      }

      // Get tenant connection
      const tenantConnection = await tenantConnectionPool.getTenantConnection(tenantId);

      if (!tenantConnection || tenantConnection.readyState !== 1) {
        throw new Error(`Unable to get connection for tenant: ${tenantId}`);
      }

      // Create or get model from tenant connection
      let TenantModel;
      if (tenantConnection.models[modelName]) {
        // Model already exists on this connection
        TenantModel = tenantConnection.models[modelName];
      } else {
        // Create new model on tenant connection
        TenantModel = tenantConnection.model(modelName, schema);
      }

      // Cache the model
      this.modelCache.set(cacheKey, TenantModel);

      return TenantModel;
    } catch (error) {
      logger.error(`Error getting tenant model ${modelName} for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get default model (for shared database or fallback)
   * @param {String} modelName - Model name
   * @param {mongoose.Model} defaultModel - Default model instance
   * @returns {mongoose.Model} Default model
   */
  getDefaultModel(modelName, defaultModel) {
    return defaultModel;
  }

  /**
   * Clear model cache for a tenant
   * @param {String} tenantId - Tenant ID
   */
  clearTenantCache(tenantId) {
    const keysToDelete = [];
    for (const key of this.modelCache.keys()) {
      if (key.startsWith(`${tenantId}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.modelCache.delete(key));
    logger.info(`Cleared model cache for tenant: ${tenantId}`);
  }

  /**
   * Clear all model cache
   */
  clearAllCache() {
    this.modelCache.clear();
    logger.info('Cleared all model cache');
  }
}

// Create singleton instance
const tenantModelService = new TenantModelService();

module.exports = tenantModelService;

