/**
 * Token Management Utilities
 * Provides secure token validation and management following international security standards
 * 
 * @module industry/utils/tokenUtils
 */

/**
 * Validates JWT token structure and expiry
 * Follows RFC 7519 (JWT) standard
 * 
 * @param {string} token - JWT token to validate
 * @returns {boolean} - True if token is valid, false otherwise
 */
export const isValidJWT = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Check for invalid string values
  if (token === 'undefined' || token === 'null' || token.trim() === '') {
    return false;
  }

  const trimmedToken = token.trim();

  // JWT structure: header.payload.signature (3 parts separated by dots)
  const parts = trimmedToken.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Basic length check (JWT tokens are typically > 100 characters)
  if (trimmedToken.length < 50) {
    return false;
  }

  // Validate base64url encoding (JWT uses base64url, not standard base64)
  // Each part should be valid base64url
  try {
    parts.forEach((part) => {
      // Base64url characters: A-Z, a-z, 0-9, -, _
      if (!/^[A-Za-z0-9_-]+$/.test(part)) {
        throw new Error('Invalid base64url encoding');
      }
    });

    // Decode payload to check expiry
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check if token has expired
    if (payload.exp) {
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      if (currentTime >= expiryTime) {
        return false; // Token expired
      }
    }

    return true;
  } catch (error) {
    // If decoding fails, token is invalid
    return false;
  }
};

/**
 * SECURITY FIX: Gets authentication status via API (cookies not accessible to JavaScript)
 * Since tokens are in HttpOnly cookies, we can't read them directly
 * This function checks authentication status via API endpoint
 * 
 * @returns {Promise<string|null>} - Success indicator or null if not authenticated
 */
export const getBestToken = async () => {
  try {
    // Check authentication status via API (cookies sent automatically)
    const response = await fetch('/api/auth/token-info', {
      method: 'GET',
      credentials: 'include' // SECURITY FIX: Include cookies
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.authenticated) {
        return 'cookie-based'; // Token exists in HttpOnly cookie
      }
    }
    return null;
  } catch (error) {
    console.error('Error checking token:', error);
    return null;
  }
};

/**
 * Gets authentication headers with the best available token
 * 
 * @returns {Object} - Headers object with Authorization if token available
 */
export const getAuthHeaders = () => {
  const token = getBestToken();
  
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't log warnings - tokens are checked by components before API calls
  // Suppress console warnings for missing tokens (handled gracefully)
  
  return headers;
};

/**
 * SECURITY FIX: Clears user data from storage
 * Tokens are in HttpOnly cookies and cleared by backend logout endpoint
 * Used during logout or session expiration
 */
export const clearAllTokens = () => {
  // SECURITY FIX: Don't clear tokens from localStorage - they're in HttpOnly cookies
  // Only clear user data (non-sensitive)
  localStorage.removeItem('user');
  localStorage.removeItem('tenantData');
};

/**
 * Decodes JWT payload without verification
 * Note: This does NOT verify the signature - backend must verify
 * 
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded payload or null if invalid
 */
export const decodeJWTPayload = (token) => {
  if (!isValidJWT(token)) {
    return null;
  }

  try {
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch (error) {
    return null;
  }
};

