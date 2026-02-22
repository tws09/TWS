import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * LoadingState Component
 * Displays loading state with optional message
 * Supports inline and full-page modes
 */
const LoadingState = ({ 
  message = 'Loading...', 
  inline = false,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  if (inline) {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <div className="flex flex-col items-center">
          <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
          {message && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return <LoadingSpinner message={message} />;
};

export default LoadingState;

