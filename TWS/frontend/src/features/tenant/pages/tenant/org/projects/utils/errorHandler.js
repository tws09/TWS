/**
 * Error Handler Utility
 * Centralized error handling for tenant project management
 */

import toast from 'react-hot-toast';
import { ERROR_MESSAGES } from '../constants/projectConstants';

/**
 * Handle API errors and show appropriate user feedback
 * @param {Error} error - Error object
 * @param {string} customMessage - Optional custom error message
 * @param {Object} options - Additional options
 * @param {boolean} options.showToast - Whether to show toast notification (default: true)
 * @param {Function} options.onError - Optional callback function
 * @returns {string} Error message
 */
export const handleApiError = (error, customMessage = null, options = {}) => {
  const { showToast = true, onError } = options;

  let errorMessage = customMessage || ERROR_MESSAGES.SERVER_ERROR;

  // Extract error message from different error formats
  if (error?.message) {
    errorMessage = error.message;
  } else if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // Handle specific error status codes
  if (error?.status) {
    switch (error.status) {
      case 401:
        errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
        // Dispatch event for auth context to handle
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        break;
      case 403:
        errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case 404:
        errorMessage = ERROR_MESSAGES.NOT_FOUND;
        break;
      case 422:
        errorMessage = error.response?.data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
        break;
      case 500:
      case 502:
      case 503:
        errorMessage = ERROR_MESSAGES.SERVER_ERROR;
        break;
      default:
        // Use the extracted message
        break;
    }
  }

  // Show toast notification if enabled
  if (showToast) {
    toast.error(errorMessage, {
      duration: 4000,
      position: 'top-right'
    });
  }

  // Call optional callback
  if (onError && typeof onError === 'function') {
    onError(error, errorMessage);
  }

  // Log error in development only
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      message: errorMessage,
      error: error,
      status: error?.status,
      data: error?.response?.data
    });
  }

  return errorMessage;
};

/**
 * Handle success messages
 * @param {string} message - Success message
 * @param {Object} options - Additional options
 * @param {boolean} options.showToast - Whether to show toast notification (default: true)
 */
export const handleSuccess = (message, options = {}) => {
  const { showToast = true } = options;

  if (showToast) {
    toast.success(message, {
      duration: 3000,
      position: 'top-right'
    });
  }
};

/**
 * Handle network errors specifically
 * @param {Error} error - Error object
 * @returns {string} Error message
 */
export const handleNetworkError = (error) => {
  const message = error?.isNetworkError 
    ? ERROR_MESSAGES.NETWORK_ERROR
    : ERROR_MESSAGES.SERVER_ERROR;

  toast.error(message, {
    duration: 5000,
    position: 'top-right'
  });

  return message;
};

/**
 * Create a safe error handler for async functions
 * @param {Function} asyncFn - Async function to wrap
 * @param {string} errorMessage - Default error message
 * @returns {Function} Wrapped function
 */
export const withErrorHandling = (asyncFn, errorMessage = ERROR_MESSAGES.SERVER_ERROR) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleApiError(error, errorMessage);
      throw error;
    }
  };
};

