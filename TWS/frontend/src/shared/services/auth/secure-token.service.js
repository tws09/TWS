/**
 * SECURE TOKEN SERVICE
 * 
 * SECURITY FIX: Unified token management using HttpOnly cookies
 * - No localStorage usage (prevents XSS attacks)
 * - Tokens stored in HttpOnly cookies (not accessible to JavaScript)
 * - Single token type (no more tenantToken/mainToken confusion)
 * - Automatic token refresh via cookies
 * 
 * This service replaces all localStorage token management
 */

/**
 * Get current access token from cookies (via API endpoint)
 * Since cookies are HttpOnly, we need to call backend to get token info
 */
export const getAccessToken = async () => {
  try {
    // Call backend endpoint that reads from cookies
    const response = await fetch('/api/auth/token-info', {
      method: 'GET',
      credentials: 'include' // Important: include cookies
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data?.token || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Check if user is authenticated (has valid token in cookies)
 */
export const isAuthenticated = async () => {
  const token = await getAccessToken();
  return !!token;
};

/**
 * Refresh access token using refresh token from cookie
 */
export const refreshAccessToken = async () => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Important: include cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.success;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

/**
 * Logout - clears cookies on backend
 */
export const logout = async () => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include' // Important: include cookies
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  // Clear any remaining localStorage data (for backward compatibility during migration)
  localStorage.removeItem('user');
  localStorage.removeItem('tenantData');
};

/**
 * Get authorization header value
 * Since we can't read HttpOnly cookies from JavaScript,
 * we rely on the browser automatically sending cookies with requests
 * This function returns null - axios will handle cookies automatically
 */
export const getAuthHeader = () => {
  // Return null - cookies are sent automatically by browser
  // Backend will read from req.cookies.accessToken
  return null;
};

export default {
  getAccessToken,
  isAuthenticated,
  refreshAccessToken,
  logout,
  getAuthHeader
};
