/**
 * Secure API Client
 * Handles authenticated requests with error handling and retry logic
 */

import { authenticatedFetch, getAuthHeaders } from './auth';
import { logError, logWarn } from './logger';

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if error is retryable
 * @param {Response} response - Fetch response
 * @returns {boolean} True if retryable
 */
const isRetryable = (response) => {
  return DEFAULT_RETRY_CONFIG.retryableStatuses.includes(response.status);
};

/**
 * Make API request with retry logic
 * SECURITY FIX: Ensures credentials: 'include' is set for cookie-based auth
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @param {Object} retryConfig - Retry configuration
 * @returns {Promise<Response>} Fetch response
 */
const fetchWithRetry = async (url, options = {}, retryConfig = DEFAULT_RETRY_CONFIG) => {
  let lastError;
  
  // SECURITY FIX: Ensure credentials: 'include' is set for cookie-based auth
  const fetchOptions = {
    ...options,
    credentials: 'include', // SECURITY FIX: Include cookies (HttpOnly tokens)
  };
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const response = await authenticatedFetch(url, fetchOptions);
      
      // If successful or non-retryable error, return immediately
      if (response.ok || !isRetryable(response)) {
        return response;
      }
      
      // Retryable error - wait and retry
      if (attempt < retryConfig.maxRetries) {
        const delay = retryConfig.retryDelay * Math.pow(2, attempt); // Exponential backoff
        logWarn(`Request failed, retrying in ${delay}ms...`, { url, attempt: attempt + 1 });
        await sleep(delay);
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error;
      
      // Network errors are retryable
      if (attempt < retryConfig.maxRetries) {
        const delay = retryConfig.retryDelay * Math.pow(2, attempt);
        logWarn(`Network error, retrying in ${delay}ms...`, { url, attempt: attempt + 1 });
        await sleep(delay);
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
};

/**
 * Parse JSON response with error handling
 * @param {Response} response - Fetch response
 * @returns {Promise<Object>} Parsed JSON data
 */
const parseJSON = async (response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }
  
  try {
    return JSON.parse(text);
  } catch (error) {
    logError('Failed to parse JSON response', error, { text: text.substring(0, 100) });
    throw new Error('Invalid JSON response');
  }
};

/**
 * Handle API response errors
 * @param {Response} response - Fetch response
 * @param {string} url - Request URL
 * @returns {Promise<never>} Throws error
 */
const handleError = async (response, url) => {
  let errorMessage = `Request failed with status ${response.status}`;
  let errorData = null;
  
  try {
    errorData = await parseJSON(response);
    errorMessage = errorData.message || errorData.error || errorMessage;
  } catch (e) {
    // If parsing fails, use status text
    errorMessage = response.statusText || errorMessage;
  }
  
  const error = new Error(errorMessage);
  error.status = response.status;
  error.data = errorData;
  error.url = url;
  
  logError(`API request failed: ${errorMessage}`, error, { url, status: response.status });
  
  throw error;
};

/**
 * GET request
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export const get = async (url, options = {}) => {
  try {
    const response = await fetchWithRetry(url, {
      ...options,
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });
    
    // Don't redirect here - let the calling component handle errors
    // The authenticatedFetch in auth.js already handles 401 and redirects
    // We just need to throw the error here for the component to handle
    if (!response.ok) {
      await handleError(response, url);
    }
    
    return await parseJSON(response);
  } catch (error) {
    logError(`GET request failed: ${url}`, error);
    throw error;
  }
};

/**
 * POST request
 * @param {string} url - API endpoint
 * @param {Object} data - Request body
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export const post = async (url, data = {}, options = {}) => {
  try {
    const response = await fetchWithRetry(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      await handleError(response, url);
    }
    
    return await parseJSON(response);
  } catch (error) {
    logError(`POST request failed: ${url}`, error);
    throw error;
  }
};

/**
 * PUT request
 * @param {string} url - API endpoint
 * @param {Object} data - Request body
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export const put = async (url, data = {}, options = {}) => {
  try {
    const response = await fetchWithRetry(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      await handleError(response, url);
    }
    
    return await parseJSON(response);
  } catch (error) {
    logError(`PUT request failed: ${url}`, error);
    throw error;
  }
};

/**
 * PATCH request
 * @param {string} url - API endpoint
 * @param {Object} data - Request body
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export const patch = async (url, data = {}, options = {}) => {
  try {
    const response = await fetchWithRetry(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      await handleError(response, url);
    }
    
    return await parseJSON(response);
  } catch (error) {
    logError(`PATCH request failed: ${url}`, error);
    throw error;
  }
};

/**
 * DELETE request
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export const del = async (url, options = {}) => {
  try {
    const response = await fetchWithRetry(url, {
      ...options,
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      await handleError(response, url);
    }
    
    return await parseJSON(response);
  } catch (error) {
    logError(`DELETE request failed: ${url}`, error);
    throw error;
  }
};

/**
 * Create API client with base URL
 * @param {string} baseURL - Base URL for all requests
 * @returns {Object} API client with methods
 */
export const createAPIClient = (baseURL) => {
  const makeURL = (endpoint) => {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return `${baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  };
  
  return {
    get: (endpoint, options) => get(makeURL(endpoint), options),
    post: (endpoint, data, options) => post(makeURL(endpoint), data, options),
    put: (endpoint, data, options) => put(makeURL(endpoint), data, options),
    patch: (endpoint, data, options) => patch(makeURL(endpoint), data, options),
    delete: (endpoint, options) => del(makeURL(endpoint), options),
  };
};

