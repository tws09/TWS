/**
 * Authentication Token Strategy Configuration
 * 
 * ✅ Issue #1.3 Fix: Documented token storage strategy
 * 
 * STRATEGY:
 * - Web browsers: Use HttpOnly cookies (preferred - XSS resistant)
 * - API clients (Postman, mobile apps): Use Authorization header (Bearer token)
 * 
 * Both methods are supported for backward compatibility and different client types.
 * Cookies use httpOnly, secure, sameSite flags when available.
 * 
 * SECURITY:
 * - Cookies: httpOnly prevents XSS token theft, secure for HTTPS
 * - Headers: Required for API clients; use short access token expiry (15 min)
 * - Refresh tokens: Stored in HttpOnly cookies, rotated on use
 */

module.exports = {
  // Token source priority: cookie first (web), then header (API)
  TOKEN_SOURCE_PRIORITY: ['cookie', 'header'],
  
  // Cookie names
  ACCESS_TOKEN_COOKIE: 'accessToken',
  REFRESH_TOKEN_COOKIE: 'refreshToken',
  
  // Header name for API clients
  AUTH_HEADER: 'Authorization',
  AUTH_HEADER_PREFIX: 'Bearer ',
  
  // Token expiry (for reference)
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '30d',
};
