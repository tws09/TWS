/**
 * Secure Authentication Token Management
 * Handles token storage, refresh, and validation securely
 */

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

/**
 * Secure token storage using httpOnly cookies would be ideal,
 * but for client-side, we use sessionStorage (more secure than localStorage)
 * and add additional security measures
 */
const getStorage = () => {
  // Use sessionStorage instead of localStorage for better security
  // Tokens cleared when browser tab closes
  return sessionStorage;
};

/**
 * Get authentication token
 * @returns {string|null} The authentication token or null
 */
export const getToken = () => {
  try {
    const storage = getStorage();
    const token = storage.getItem(TOKEN_KEY);
    const expiry = storage.getItem(TOKEN_EXPIRY_KEY);
    
    // Check if token is expired
    if (token && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() >= expiryTime) {
        // Token expired, clear it
        clearTokens();
        return null;
      }
    }
    
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Set authentication token
 * @param {string} token - The authentication token
 * @param {number} expiresIn - Token expiration time in seconds
 */
export const setToken = (token, expiresIn = 3600) => {
  try {
    const storage = getStorage();
    storage.setItem(TOKEN_KEY, token);
    
    // Calculate expiry time
    const expiryTime = Date.now() + (expiresIn * 1000);
    storage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

/**
 * Get refresh token
 * @returns {string|null} The refresh token or null
 */
export const getRefreshToken = () => {
  try {
    const storage = getStorage();
    return storage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Set refresh token
 * @param {string} refreshToken - The refresh token
 */
export const setRefreshToken = (refreshToken) => {
  try {
    const storage = getStorage();
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
};

/**
 * Clear all authentication tokens
 */
export const clearTokens = () => {
  try {
    const storage = getStorage();
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    storage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  const token = getToken();
  return token !== null && token !== undefined;
};

/**
 * Get authorization header for API requests
 * SECURITY FIX: Returns empty object - tokens are now in HttpOnly cookies
 * @returns {Object} Empty headers object (cookies are sent automatically)
 */
export const getAuthHeaders = () => {
  // SECURITY FIX: Tokens are in HttpOnly cookies, not in headers
  // Cookies are sent automatically with credentials: 'include'
  return {};
};

/**
 * Refresh authentication token
 * @returns {Promise<boolean>} True if refresh successful
 */
export const refreshAuthToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        setToken(data.token, data.expiresIn);
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken);
        }
        return true;
      }
    }
    
    // Refresh failed, clear tokens
    clearTokens();
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearTokens();
    return false;
  }
};

/**
 * Make authenticated API request with automatic token refresh
 * SECURITY FIX: Uses HttpOnly cookies instead of Authorization headers
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
  // SECURITY FIX: Use credentials: 'include' to send HttpOnly cookies
  // Cookies are sent automatically, no Authorization header needed
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // SECURITY FIX: Include cookies (HttpOnly tokens)
  });

  // If token expired, try to refresh using cookies
  // DO NOT redirect here - let the calling code handle 401 errors
  // Redirects should only happen in route guards, not in utility functions
  if (response.status === 401) {
    // SECURITY FIX: Refresh token using cookies
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // SECURITY FIX: Include cookies
    });
    
    if (refreshResponse.ok) {
      // Retry request with refreshed cookies
      const retryResponse = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // SECURITY FIX: Include cookies
      });
      return retryResponse;
    }
    // If refresh failed, return the 401 response and let the caller decide what to do
    // Don't redirect here - this causes redirect loops
  }

  return response;
};

