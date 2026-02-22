/**
 * @deprecated - Use verifyERPToken middleware instead
 * verifyERPToken automatically sets req.tenantContext with all required properties
 * This function is kept for backward compatibility but should not be used in new code
 * Will be removed in a future version
 * 
 * Build tenant context from request
 * This ensures orgId is available for filtering data in shared database scenarios
 * 
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Tenant context object with orgId, tenantId, etc.
 */
const { ensureOrgId } = require('../../utils/orgIdHelper');

const buildTenantContext = async (req) => {
  const tenant = req.tenant;
  
  // Use standardized orgId helper utility
  let orgId;
  try {
    orgId = await ensureOrgId(req);
  } catch (error) {
    console.error('Error getting orgId in buildTenantContext:', error.message);
    // Fallback to sync method if async fails
    orgId = req.orgId || req.tenantContext?.orgId || req.tenant?.organizationId || req.tenant?.orgId || req.user?.orgId?.toString() || null;
  }
  
  // Build tenant context object
  const tenantContext = {
    tenantId: req.tenantContext?.tenantId || req.tenantId || tenant?.tenantId || tenant?._id?.toString(),
    tenantSlug: req.tenantContext?.tenantSlug || req.tenantSlug || tenant?.slug,
    orgId: orgId,
    hasSeparateDatabase: req.tenantContext?.hasSeparateDatabase || false,
    tenantConnection: req.tenantConnection || null,
    connectionReady: req.tenantContext?.connectionReady || false
  };
  
  // Set tenantContext on request object for use in route handlers
  req.tenantContext = tenantContext;
  
  return tenantContext;
};

module.exports = {
  buildTenantContext
};
