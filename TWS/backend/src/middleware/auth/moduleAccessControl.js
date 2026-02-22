/**
 * Module Access Control Middleware
 * Restricts route access based on tenant's ERP category and enabled modules
 * SECURITY FIX: Also validates user roles are appropriate for ERP category
 */

const { isRoleAllowedForERP } = require('./rbac');

/**
 * Check if tenant has access to a specific module
 * @param {String|Array} requiredModules - Module(s) required to access this route
 * @returns {Function} Express middleware function
 */
const requireModuleAccess = (requiredModules) => {
  return async (req, res, next) => {
    try {
      // Get tenant from request (set by verifyTenantOrgAccess middleware)
      const tenant = req.tenant;
      
      if (!tenant) {
        return res.status(500).json({
          success: false,
          message: 'Tenant context not available'
        });
      }

      // Convert single module to array for consistent handling
      const modules = Array.isArray(requiredModules) ? requiredModules : [requiredModules];

      // Common modules that ALL ERP categories can access
      const commonModules = [
        'dashboard',
        'users',
        'settings',
        'reports',
        'messaging',
        'analytics',
        'meetings'
      ];

      // Check if any of the required modules are common (always accessible)
      const hasCommonModule = modules.some(module => commonModules.includes(module));
      
      if (hasCommonModule) {
        // Common modules are always accessible
        return next();
      }

      const categoryModuleMap = {
        software_house: {
          available: ['hr', 'finance', 'projects', 'development_methodology', 'tech_stack', 'project_types', 'time_tracking', 'code_quality', 'client_portal'],
          restricted: []
        },
        business: {
          available: ['hr', 'finance', 'projects', 'operations', 'inventory', 'clients'],
          restricted: []
        }
      };

      const erpCategory = tenant.erpCategory || 'software_house';
      const categoryConfig = categoryModuleMap[erpCategory] || categoryModuleMap.software_house;

      if (req.user && req.user.role) {
        if (!isRoleAllowedForERP(req.user.role, erpCategory)) {
          return res.status(403).json({
            success: false,
            message: `Your role '${req.user.role}' is not valid for this ERP category.`,
            code: 'ROLE_INVALID_FOR_ERP',
            userRole: req.user.role,
            erpCategory: erpCategory
          });
        }
      }

      // Check if tenant has specific modules enabled (tenant.erpModules array)
      // If tenant.erpModules is empty, use category defaults
      const tenantModules = tenant.erpModules && tenant.erpModules.length > 0 
        ? tenant.erpModules 
        : categoryConfig.available;

      // Check each required module
      const missingModules = [];
      const restrictedModules = [];

      for (const module of modules) {
        // Check if module is restricted for this category
        if (categoryConfig.restricted.includes(module)) {
          restrictedModules.push(module);
          continue;
        }

        // Check if tenant has the module enabled
        if (!tenantModules.includes(module) && !categoryConfig.available.includes(module)) {
          missingModules.push(module);
        }
      }

      // If any modules are restricted, return error
      if (restrictedModules.length > 0) {
        return res.status(403).json({
          success: false,
          message: `Module(s) '${restrictedModules.join(', ')}' are not available for ${erpCategory} ERP category`,
          code: 'MODULE_RESTRICTED',
          restrictedModules,
          erpCategory,
          suggestedModules: getSuggestedModules(erpCategory, restrictedModules)
        });
      }

      // If any modules are missing, return error
      if (missingModules.length > 0) {
        return res.status(403).json({
          success: false,
          message: `Module(s) '${missingModules.join(', ')}' are not enabled for this tenant`,
          code: 'MODULE_NOT_ENABLED',
          missingModules,
          availableModules: tenantModules
        });
      }

      // All checks passed, allow access
      next();

    } catch (error) {
      console.error('Module access control error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking module access',
        error: error.message
      });
    }
  };
};

/**
 * Get suggested alternative modules for restricted modules
 */
const getSuggestedModules = (erpCategory, restrictedModules) => {
  const suggestions = {
    software_house: {
      'hr': 'Use HR module for staff management',
      'finance': 'Use finance module for financial management',
      'projects': 'Use development or projects module'
    },
    warehouse: {
      'hr': 'Not typically needed for warehouse operations',
      'finance': 'Use external accounting system',
      'projects': 'Use "logistics" or "supply_chain" modules instead'
    }
  };

  const categorySuggestions = suggestions[erpCategory] || {};
  return restrictedModules.map(module => ({
    module,
    suggestion: categorySuggestions[module] || 'Module not available for this ERP category'
  }));
};

module.exports = {
  requireModuleAccess
};

