import React from 'react';

/**
 * LoadingSpinner Component
 * Full-page loading spinner with optional message
 */
const LoadingSpinner = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
          <span className="text-white font-bold text-xl">W</span>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        {message && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
