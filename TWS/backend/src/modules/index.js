/**
 * Backend Modules Index
 * Centralized exports for all backend modules
 */

const authRoutes = require('./auth/routes');
const adminRoutes = require('./admin/routes');
const tenantRoutes = require('./tenant/routes');
const coreRoutes = require('./core/routes');
const businessRoutes = require('./business/routes');
const monitoringRoutes = require('./monitoring/routes');
const integrationRoutes = require('./integration/routes');

module.exports = {
  auth: authRoutes,
  admin: adminRoutes,
  tenant: tenantRoutes,
  core: coreRoutes,
  business: businessRoutes,
  monitoring: monitoringRoutes,
  integration: integrationRoutes
};

