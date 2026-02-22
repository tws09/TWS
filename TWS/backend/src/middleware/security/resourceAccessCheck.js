/**
 * Resource Access Check Middleware
 * Prevents IDOR (Insecure Direct Object Reference) vulnerabilities
 * 
 * Addresses Issue #9.1: IDOR Vulnerabilities
 * 
 * This middleware ensures that users can only access resources that belong to their organization.
 * It validates that the resource ID in the request belongs to the user's orgId.
 * 
 * Usage:
 * ```javascript
 * const { validateResourceAccess } = require('./middleware/security/resourceAccessCheck');
 * router.get('/projects/:id', validateResourceAccess('Project'), controller.getProject);
 * ```
 */

const mongoose = require('mongoose');

/**
 * Validate resource access - ensures resource belongs to user's organization
 * 
 * @param {String} modelName - Name of the Mongoose model (e.g., 'Project', 'Task', 'Client')
 * @param {String} idParam - Name of the route parameter containing the resource ID (default: 'id')
 * @param {Object} options - Additional options
 * @param {String} options.orgIdField - Field name for orgId in the model (default: 'orgId')
 * @param {Function} options.customAccessCheck - Custom function to check access (optional)
 */
const validateResourceAccess = (modelName, idParam = 'id', options = {}) => {
  const { orgIdField = 'orgId', customAccessCheck } = options;
  
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      
      // Skip if no resource ID (e.g., POST routes)
      if (!resourceId) {
        return next();
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${modelName} ID format`,
          code: 'INVALID_ID'
        });
      }

      // Get orgId from request (should be set by authentication middleware)
      const orgId = req.orgId || req.user?.orgId || req.tenantContext?.orgId;
      
      if (!orgId) {
        return res.status(500).json({
          success: false,
          message: 'Organization context not available',
          code: 'MISSING_ORG_CONTEXT'
        });
      }

      // Load the model dynamically
      const Model = mongoose.model(modelName);
      
      // Check if resource exists and belongs to user's organization
      const resource = await Model.findOne({
        _id: resourceId,
        [orgIdField]: orgId
      }).lean();

      if (!resource) {
        // Log security event for potential IDOR attempt
        const auditService = require('../../services/compliance/audit.service');
        try {
          await auditService.logSecurityEvent(
            'IDOR_ATTEMPT',
            req.user?._id || null,
            orgId,
            {
              resourceType: modelName,
              resourceId,
              requestedOrgId: orgId,
              ip: req.ip,
              userAgent: req.get('User-Agent'),
              endpoint: req.path,
              method: req.method,
              severity: 'high'
            }
          );
        } catch (error) {
          console.error('Failed to log IDOR attempt:', error);
        }

        return res.status(404).json({
          success: false,
          message: `${modelName} not found or access denied`,
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      // Custom access check if provided
      if (customAccessCheck) {
        const hasAccess = await customAccessCheck(req, resource);
        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            message: 'Access denied to this resource',
            code: 'ACCESS_DENIED'
          });
        }
      }

      // Attach resource to request for use in controller
      req.resource = resource;
      req.resourceId = resourceId;

      next();
    } catch (error) {
      console.error(`Error validating ${modelName} access:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error validating resource access',
        code: 'VALIDATION_ERROR'
      });
    }
  };
};

/**
 * Validate multiple resource access (for routes with multiple IDs)
 * 
 * @param {Array} validations - Array of { modelName, idParam, options }
 */
const validateMultipleResourceAccess = (validations) => {
  return async (req, res, next) => {
    try {
      for (const validation of validations) {
        const { modelName, idParam, options = {} } = validation;
        const resourceId = req.params[idParam];
        
        if (!resourceId) continue;

        if (!mongoose.Types.ObjectId.isValid(resourceId)) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${modelName} ID format`,
            code: 'INVALID_ID'
          });
        }

        const orgId = req.orgId || req.user?.orgId || req.tenantContext?.orgId;
        if (!orgId) {
          return res.status(500).json({
            success: false,
            message: 'Organization context not available',
            code: 'MISSING_ORG_CONTEXT'
          });
        }

        const Model = mongoose.model(modelName);
        const { orgIdField = 'orgId' } = options;
        
        const resource = await Model.findOne({
          _id: resourceId,
          [orgIdField]: orgId
        }).lean();

        if (!resource) {
          return res.status(404).json({
            success: false,
            message: `${modelName} not found or access denied`,
            code: 'RESOURCE_NOT_FOUND'
          });
        }

        // Attach to request
        req[`${modelName.toLowerCase()}Resource`] = resource;
      }

      next();
    } catch (error) {
      console.error('Error validating multiple resource access:', error);
      return res.status(500).json({
        success: false,
        message: 'Error validating resource access',
        code: 'VALIDATION_ERROR'
      });
    }
  };
};

module.exports = {
  validateResourceAccess,
  validateMultipleResourceAccess
};
