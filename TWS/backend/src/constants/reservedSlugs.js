/**
 * Slugs a tenant may NOT claim.
 *
 * Tenancy is path-based (housesbase.com/<slug>/org/...), so a tenant slug that
 * collides with a top-level application route would be shadowed by that route.
 * This list therefore covers both infrastructure names and every fixed first
 * path segment the SPA owns. Keep it in sync with
 * frontend/src/shared/utils/tenantRoutes.js's RESERVED_FIRST_SEGMENTS.
 */
const RESERVED_SLUGS = new Set([
  // infrastructure / product
  'api', 'admin', 'www', 'mail', 'smtp', 'ftp', 'localhost', 'test', 'staging',
  'dev', 'app', 'cdn', 'assets', 'static', 'housesbase', 'nexaerp',
  // fixed SPA routes
  'login', 'signup', 'register', 'logout', 'dashboard', 'supra-admin',
  'supra-admin-login', 'software-house', 'software-house-login',
  'software-house-signup', 'software-house-forgot-password', 'forgot-password',
  'find-workspace', 'invite', 'access-denied', 'debug', 'landing',
  'monitoring-status', 'changelog', 'product', 'solutions', 'pricing',
  'security', 'resources', 'about', 'contact', 'privacy', 'terms', 'finance',
  'hrm', 'projects', 'org', 'tenant', 'uploads', 'onboarding',
]);

/** @param {string} slug @returns {boolean} */
function isReservedSlug(slug) {
  return RESERVED_SLUGS.has(String(slug || '').trim().toLowerCase());
}

module.exports = { RESERVED_SLUGS, isReservedSlug };
