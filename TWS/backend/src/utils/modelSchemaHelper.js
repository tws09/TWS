const mongoose = require('mongoose');

/**
 * Model Schema Helper
 * Utilities to clone and reuse schemas for tenant connections
 */

/**
 * Get schema definition from a model
 * @param {mongoose.Model} model - Mongoose model
 * @returns {mongoose.Schema} Schema instance
 */
function getSchemaFromModel(model) {
  if (!model || !model.schema) {
    throw new Error('Model does not have a schema');
  }
  return model.schema;
}

/**
 * Clone schema for use on a different connection
 * @param {mongoose.Schema} schema - Original schema
 * @returns {mongoose.Schema} Cloned schema
 */
function cloneSchema(schema) {
  // Create a new schema with the same definition
  const schemaDefinition = schema.obj || {};
  const schemaOptions = schema.options || {};
  
  // Create new schema instance
  return new mongoose.Schema(schemaDefinition, schemaOptions);
}

/**
 * Get or create model on a connection
 * @param {mongoose.Connection} connection - Database connection
 * @param {String} modelName - Model name
 * @param {mongoose.Model} defaultModel - Default model (for schema reference)
 * @returns {mongoose.Model} Model instance on the connection
 */
function getOrCreateModelOnConnection(connection, modelName, defaultModel) {
  // Check if model already exists on this connection
  if (connection.models[modelName]) {
    return connection.models[modelName];
  }

  // Get schema from default model
  const schema = getSchemaFromModel(defaultModel);
  
  // Clone schema for this connection
  const clonedSchema = cloneSchema(schema);
  
  // Create model on the connection
  return connection.model(modelName, clonedSchema);
}

/**
 * Register multiple models on a connection
 * @param {mongoose.Connection} connection - Database connection
 * @param {Object} models - Object mapping model names to default models
 * @returns {Object} Object mapping model names to connection models
 */
function registerModelsOnConnection(connection, models) {
  const registeredModels = {};
  
  for (const [modelName, defaultModel] of Object.entries(models)) {
    registeredModels[modelName] = getOrCreateModelOnConnection(connection, modelName, defaultModel);
  }
  
  return registeredModels;
}

module.exports = {
  getSchemaFromModel,
  cloneSchema,
  getOrCreateModelOnConnection,
  registerModelsOnConnection
};

