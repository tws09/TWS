/**
 * Toast Notifications Utility
 * Centralized toast notification system for Nucleus Project OS
 * Uses react-hot-toast for consistent UX
 */

import toast from 'react-hot-toast';

/**
 * Show success notification
 * @param {string} message - Success message
 * @param {Object} options - Toast options
 */
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10b981',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500'
    },
    ...options
  });
};

/**
 * Show error notification
 * @param {string} message - Error message
 * @param {Object} options - Toast options
 */
export const showError = (message, options = {}) => {
  return toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500'
    },
    ...options
  });
};

/**
 * Show warning notification
 * @param {string} message - Warning message
 * @param {Object} options - Toast options
 */
export const showWarning = (message, options = {}) => {
  return toast(message, {
    icon: '⚠️',
    duration: 3500,
    position: 'top-right',
    style: {
      background: '#f59e0b',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500'
    },
    ...options
  });
};

/**
 * Show info notification
 * @param {string} message - Info message
 * @param {Object} options - Toast options
 */
export const showInfo = (message, options = {}) => {
  return toast(message, {
    icon: 'ℹ️',
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#3b82f6',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500'
    },
    ...options
  });
};

/**
 * Show loading notification (returns dismiss function)
 * @param {string} message - Loading message
 * @returns {Function} Dismiss function
 */
export const showLoading = (message = 'Loading...') => {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: '#6b7280',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500'
    }
  });
};

/**
 * Update loading toast to success/error
 * @param {string} toastId - Toast ID from showLoading
 * @param {string} message - Final message
 * @param {string} type - 'success' | 'error' | 'info'
 */
export const updateToast = (toastId, message, type = 'success') => {
  const config = {
    duration: type === 'error' ? 4000 : 3000,
    style: {
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#fff'
    }
  };

  if (type === 'success') {
    config.style.background = '#10b981';
    toast.success(message, { id: toastId, ...config });
  } else if (type === 'error') {
    config.style.background = '#ef4444';
    toast.error(message, { id: toastId, ...config });
  } else {
    config.style.background = '#3b82f6';
    toast(message, { id: toastId, icon: 'ℹ️', ...config });
  }
};

/**
 * Dismiss toast
 * @param {string} toastId - Toast ID
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Show promise toast (for async operations)
 * @param {Promise} promise - Promise to track
 * @param {Object} messages - { loading, success, error }
 * @returns {Promise}
 */
export const showPromise = (promise, messages) => {
  return toast.promise(promise, {
    loading: messages.loading || 'Processing...',
    success: messages.success || 'Operation completed',
    error: messages.error || 'Operation failed'
  }, {
    position: 'top-right',
    style: {
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500'
    },
    success: {
      duration: 3000,
      style: {
        background: '#10b981',
        color: '#fff'
      }
    },
    error: {
      duration: 4000,
      style: {
        background: '#ef4444',
        color: '#fff'
      }
    }
  });
};
