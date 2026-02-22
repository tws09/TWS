/**
 * Global Error Handler for External Scripts
 * Handles errors from browser extensions, external scripts, and third-party services
 */

export const setupGlobalErrorHandling = () => {
  // Store original error handlers
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // List of external script patterns to suppress
  const externalScriptPatterns = [
    'share-modal.js',
    'extension://',
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'edge-extension://',
    'addEventListener',
    'Cannot read properties of null',
    'Cannot read property',
    'TypeError: Cannot read properties of null',
    'TypeError: Cannot read property'
  ];

  // Function to check if error is from external source
  const isExternalError = (message, filename) => {
    if (!message) return false;
    
    const messageStr = message.toString().toLowerCase();
    const filenameStr = (filename || '').toString().toLowerCase();
    
    return externalScriptPatterns.some(pattern => 
      messageStr.includes(pattern.toLowerCase()) || 
      filenameStr.includes(pattern.toLowerCase())
    );
  };

  // Override console.error for external scripts and auth errors
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    const filename = args[1] || '';
    
    // Suppress authentication/authorization errors (401) that are handled gracefully
    const messageLower = message.toLowerCase();
    if (messageLower.includes('invalid token') || 
        messageLower.includes('unauthorized') || 
        messageLower.includes('401') ||
        messageLower.includes('authentication failed') ||
        (typeof args[0] === 'object' && (args[0]?.status === 401 || args[0]?.response?.status === 401)) ||
        (typeof args[0] === 'object' && args[0]?.message?.toLowerCase?.().includes('invalid token')) ||
        (args.length > 1 && typeof args[1] === 'string' && args[1].toLowerCase().includes('unauthorized'))) {
      // Silently ignore handled auth errors
      return;
    }
    
    if (isExternalError(message, filename)) {
      // Silently ignore external script errors
      return;
    }
    
    // Log legitimate errors
    originalConsoleError.apply(console, args);
  };

  // Override console.warn for external scripts and auth errors
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    
    // Suppress authentication/authorization warnings that are handled gracefully
    if (message.includes('Invalid token') || 
        message.includes('Unauthorized') || 
        message.includes('401') ||
        message.includes('Authentication failed') ||
        message.includes('Token refresh failed')) {
      // Silently ignore handled auth warnings
      return;
    }
    
    if (isExternalError(message)) {
      // Silently ignore external script warnings
      return;
    }
    
    // Log legitimate warnings
    originalConsoleWarn.apply(console, args);
  };

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const message = event.message?.toString() || '';
    if (isExternalError(message, event.filename) ||
        message.includes('Invalid token') ||
        message.includes('Unauthorized') ||
        message.includes('401')) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true); // Use capture phase

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.toString() || '';
    
    if (isExternalError(reason) ||
        reason.includes('Invalid token') ||
        reason.includes('Unauthorized') ||
        reason.includes('401')) {
      event.preventDefault();
      return false;
    }
  });

  // Handle specific share-modal errors
  const handleShareModalError = (event) => {
    if (event.message && (
      event.message.includes('share-modal') ||
      event.message.includes('Cannot read properties of null (reading \'addEventListener\')') ||
      event.filename?.includes('share-modal.js')
    )) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  };

  // Add specific handler for share-modal errors
  window.addEventListener('error', handleShareModalError, true);
  
  console.log('🛡️ Global error handling initialized - External script errors will be suppressed');
};

// Export for use in other files
export default setupGlobalErrorHandling;
