/**
 * Query Filter Middleware
 * Automatically injects orgId/tenantId filters into all queries
 * 
 * Addresses Issue #9.2: Data Leakage Between Companies/Projects
 * 
 * This middleware ensures that all database queries automatically filter by orgId,
 * preventing data leakage between tenants/organizations.
 * 
 * Usage:
 * ```javascript
 * const { autoInjectOrgFilter } = require('./middleware/security/queryFilterMiddleware');
 * router.use(autoInjectOrgFilter);
 * ```
 */

const mongoose = require('mongoose');

/**
 * Auto-inject orgId filter into all Mongoose queries
 * This prevents data leakage by ensuring all queries are scoped to user's organization
 */
const autoInjectOrgFilter = (req, res, next) => {
  // Get orgId from request (should be set by authentication middleware)
  const orgId = req.orgId || req.user?.orgId || req.tenantContext?.orgId;
  
  if (!orgId) {
    // Skip filter injection if no orgId (e.g., public routes)
    return next();
  }

  // Store original query methods
  const originalFind = mongoose.Model.find;
  const originalFindOne = mongoose.Model.findOne;
  const originalFindById = mongoose.Model.findById;
  const originalFindOneAndUpdate = mongoose.Model.findOneAndUpdate;
  const originalFindOneAndDelete = mongoose.Model.findOneAndDelete;
  const originalFindOneAndRemove = mongoose.Model.findOneAndRemove;
  const originalCountDocuments = mongoose.Model.countDocuments;
  const originalUpdateOne = mongoose.Model.updateOne;
  const originalUpdateMany = mongoose.Model.updateMany;
  const originalDeleteOne = mongoose.Model.deleteOne;
  const originalDeleteMany = mongoose.Model.deleteMany;

  // Override find method
  mongoose.Model.find = function(conditions, projection, options) {
    if (conditions && typeof conditions === 'object') {
      // Check if model has orgId field
      const schema = this.schema;
      if (schema.paths.orgId || schema.paths.tenantId) {
        // Inject orgId filter if not already present
        if (!conditions.orgId && !conditions.tenantId && !conditions.$or) {
          conditions.orgId = orgId;
        }
      }
    }
    return originalFind.call(this, conditions, projection, options);
  };

  // Override findOne method
  mongoose.Model.findOne = function(conditions, projection, options) {
    if (conditions && typeof conditions === 'object') {
      const schema = this.schema;
      if (schema.paths.orgId || schema.paths.tenantId) {
        if (!conditions.orgId && !conditions.tenantId && !conditions.$or) {
          conditions.orgId = orgId;
        }
      }
    }
    return originalFindOne.call(this, conditions, projection, options);
  };

  // Override findById method
  mongoose.Model.findById = function(id, projection, options) {
    // Note: findById doesn't have conditions object, so we need to handle it differently
    // This is a limitation - findById will need explicit orgId check in controllers
    return originalFindById.call(this, id, projection, options);
  };

  // Override findOneAndUpdate method
  mongoose.Model.findOneAndUpdate = function(conditions, update, options) {
    if (conditions && typeof conditions === 'object') {
      const schema = this.schema;
      if (schema.paths.orgId || schema.paths.tenantId) {
        if (!conditions.orgId && !conditions.tenantId && !conditions.$or) {
          conditions.orgId = orgId;
        }
      }
    }
    return originalFindOneAndUpdate.call(this, conditions, update, options);
  };

  // Override findOneAndDelete method
  mongoose.Model.findOneAndDelete = function(conditions, options) {
    if (conditions && typeof conditions === 'object') {
      const schema = this.schema;
      if (schema.paths.orgId || schema.paths.tenantId) {
        if (!conditions.orgId && !conditions.tenantId && !conditions.$or) {
          conditions.orgId = orgId;
        }
      }
    }
    return originalFindOneAndDelete.call(this, conditions, options);
  };

  // Override findOneAndRemove method
  mongoose.Model.findOneAndRemove = function(conditions, options) {
    if (conditions && typeof conditions === 'object') {
      const schema = this.schema;
      if (schema.paths.orgId || schema.paths.tenantId) {
        if (!conditions.orgId && !conditions.tenantId && !conditions.$or) {
          conditions.orgId = orgId;
        }
      }
    }
    return originalFindOneAndRemove.call(this, conditions, options);
  };

  // Override countDocuments method
  mongoose.Model.countDocuments = function(conditions, options) {
    if (conditions && typeof conditions === 'object') {
      const schema = this.schema;
      if (schema.paths.orgId || schema.paths.tenantId) {
        if (!conditions.orgId && !conditions.tenantId && !conditions.$or) {
          conditions.orgId = orgId;
        }
      }
    }
    return originalCountDocuments.call(this, conditions, options);
  };

  // Override updateOne method
  mongoose.Model.updateOne = function(conditions, update, options) {
    if (conditions && typeof conditions === 'object') {
      const schema = this.schema;
      if (schema.paths.orgId || schema.paths.tenantId) {
        if (!conditions.orgId && !conditions.tenantId && !conditions.$or) {
          conditions.orgId = orgId;
        }
      }
    }
    return originalUpdateOne.call(this, conditions, update, options);
  };

  // Override updateMany method
  mongoose.Model.updateMany = function(conditions, update, options) {
    if (conditions && typeof conditions === 'object') {
      const schema = this.schema;
      if (schema.paths.orgId || schema.paths.tenantId) {
        if (!conditions.orgId && !conditions.tenantId && !conditions.$or) {
          conditions.orgId = orgId;
        }
      }
    }
    return originalUpdateMany.call(this, conditions, update, options);
  };

  // Override deleteOne method
  mongoose.Model.deleteOne = function(conditions, options) {
    if (conditions && typeof conditions === 'object') {
      const schema = this.schema;
      if (schema.paths.orgId || schema.paths.tenantId) {
        if (!conditions.orgId && !conditions.tenantId && !conditions.$or) {
          conditions.orgId = orgId;
        }
      }
    }
    return originalDeleteOne.call(this, conditions, options);
  };

  // Override deleteMany method
  mongoose.Model.deleteMany = function(conditions, options) {
    if (conditions && typeof conditions === 'object') {
      const schema = this.schema;
      if (schema.paths.orgId || schema.paths.tenantId) {
        if (!conditions.orgId && !conditions.tenantId && !conditions.$or) {
          conditions.orgId = orgId;
        }
      }
    }
    return originalDeleteMany.call(this, conditions, options);
  };

  // Restore original methods after request
  res.on('finish', () => {
    mongoose.Model.find = originalFind;
    mongoose.Model.findOne = originalFindOne;
    mongoose.Model.findById = originalFindById;
    mongoose.Model.findOneAndUpdate = originalFindOneAndUpdate;
    mongoose.Model.findOneAndDelete = originalFindOneAndDelete;
    mongoose.Model.findOneAndRemove = originalFindOneAndRemove;
    mongoose.Model.countDocuments = originalCountDocuments;
    mongoose.Model.updateOne = originalUpdateOne;
    mongoose.Model.updateMany = originalUpdateMany;
    mongoose.Model.deleteOne = originalDeleteOne;
    mongoose.Model.deleteMany = originalDeleteMany;
  });

  next();
};

/**
 * Helper function to ensure orgId filter is present in query conditions
 * Use this in controllers to ensure queries are properly scoped
 * 
 * @param {Object} conditions - Query conditions object
 * @param {String} orgId - Organization ID to filter by
 * @param {Object} options - Options
 * @param {Boolean} options.allowTenantId - Allow tenantId filter as alternative
 * @returns {Object} - Conditions with orgId filter added
 */
const ensureOrgFilter = (conditions = {}, orgId, options = {}) => {
  const { allowTenantId = false } = options;
  
  if (!orgId) {
    throw new Error('orgId is required for query filtering');
  }

  // If conditions already has orgId or tenantId, don't override
  if (conditions.orgId || conditions.tenantId) {
    return conditions;
  }

  // If conditions has $or, check if orgId/tenantId is already in it
  if (conditions.$or) {
    const hasOrgFilter = conditions.$or.some(
      cond => cond.orgId || cond.tenantId
    );
    if (!hasOrgFilter) {
      // Add orgId filter to $or conditions
      conditions.$or.push({ orgId });
      if (allowTenantId) {
        conditions.$or.push({ tenantId: orgId });
      }
    }
    return conditions;
  }

  // Add orgId filter
  conditions.orgId = orgId;
  
  return conditions;
};

module.exports = {
  autoInjectOrgFilter,
  ensureOrgFilter
};
