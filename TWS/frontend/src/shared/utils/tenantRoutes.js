/**
 * Tenant workspace routing — PATH-BASED on every environment.
 *
 *   housesbase.com/<tenant-slug>/org/...      (production)
 *   localhost:3000/<tenant-slug>/org/...      (development)
 *
 * There is no subdomain tenancy. The slug is always the first path segment and
 * every request stays on a single origin, so tenant URLs are plain same-origin
 * paths — never cross-origin `https://<slug>.housesbase.com/...`.
 */

/** Canonical app host, for display only (e.g. the signup "workspace URL" preview). */
export const BASE_DOMAIN = (process.env.REACT_APP_BASE_DOMAIN || 'housesbase.com')
  .trim()
  .replace(/^https?:\/\//, '')
  .replace(/\/+$/, '');

/**
 * Build a tenant workspace path.
 * Example: tenantPath('ahmad', 'org', 'dashboard') => '/ahmad/org/dashboard'
 * @param {string} tenantSlug
 * @param {...string} pathParts
 * @returns {string}
 */
export function tenantPath(tenantSlug, ...pathParts) {
  if (!tenantSlug) return '/';
  const rest = pathParts.filter(Boolean).join('/');
  return rest ? `/${tenantSlug}/${rest}` : `/${tenantSlug}`;
}

/**
 * Alias kept for the many call sites that used the old subdomain helper.
 * Identical to tenantPath now that everything is same-origin and path-based —
 * callers pass the legacy parts (slug, 'org', 'home') and get '/slug/org/home'.
 */
export const getTenantWorkspaceUrl = tenantPath;

/**
 * Navigate helper. All tenant URLs are same-origin paths now, so this just
 * defers to React Router's navigate(); the absolute-URL branch is a harmless
 * safety net for any caller that still hands in a full URL.
 */
export function navigateTo(url, navigateFn) {
  if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
    window.location.href = url;
  } else {
    navigateFn(url);
  }
}

/** First path segments that are NOT tenant slugs (fixed app routes) */
export const RESERVED_FIRST_SEGMENTS = new Set([
  'login', 'supra-admin', 'supra-admin-login', 'software-house', 'access-denied', 'debug', 'landing',
  'monitoring-status', 'register', 'signup', 'api', 'software-house-login', 'software-house-signup',
  'forgot-password', 'software-house-forgot-password', 'invite', 'changelog', 'product', 'solutions',
  'pricing', 'security', 'resources', 'about', 'contact', 'privacy', 'terms', 'finance', 'hrm',
  'projects', 'org', 'tenant' // 'tenant'/'org' legacy; keep so old bookmarks can redirect if needed
]);

/**
 * Returns true if the current pathname is a tenant workspace route
 * (/:slug/org/... or /:slug/dashboard).
 * @param {string} pathname - location.pathname
 * @returns {boolean}
 */
export function isTenantWorkspacePath(pathname) {
  const parts = String(pathname || '').split('/').filter(Boolean);
  const seg = parts[0];
  if (!seg || RESERVED_FIRST_SEGMENTS.has(seg)) return false;
  return parts[1] === 'org' || parts[1] === 'dashboard';
}
