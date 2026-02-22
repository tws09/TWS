/**
 * HIPAA Enforcement Middleware
 * Ensures HIPAA compliance requirements are met for healthcare routes
 */

const securityConfig = require('../../config/security');

/**
 * Middleware to enforce HIPAA compliance requirements
 */
const enforceHIPAA = (req, res, next) => {
  if (securityConfig.compliance.hipaa.enabled) {
    // Ensure tenant context is set
    if (!req.tenantContext) {
      return res.status(403).json({ 
        success: false, 
        message: 'HIPAA compliance requires tenant context' 
      });
    }
    
    // Ensure audit logging is enabled
    if (!securityConfig.compliance.hipaa.accessLogging) {
      console.error('WARNING: HIPAA compliance enabled but access logging disabled');
    }
    
    // Add HIPAA headers
    res.setHeader('X-HIPAA-Compliant', 'true');
    res.setHeader('X-PHI-Protected', 'true');
  }
  next();
};

/**
 * Middleware to check if HIPAA compliance is required for the route
 */
const requireHIPAA = (req, res, next) => {
  if (!securityConfig.compliance.hipaa.enabled) {
    return res.status(403).json({
      success: false,
      message: 'HIPAA compliance mode is required for this operation'
    });
  }
  next();
};

module.exports = {
  enforceHIPAA,
  requireHIPAA
};
