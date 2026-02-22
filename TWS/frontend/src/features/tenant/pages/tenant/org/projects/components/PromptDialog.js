/**
 * Prompt Dialog Component
 * Replaces window.prompt with a proper React component
 */

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PromptDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  placeholder = '',
  defaultValue = '',
  confirmText = 'OK', 
  cancelText = 'Cancel',
  required = false
}) => {
  const [value, setValue] = useState(defaultValue);

  React.useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (required && !value.trim()) {
      return; // Don't close if required and empty
    }
    if (onConfirm) onConfirm(value);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-card-premium max-w-md w-full shadow-xl rounded-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white">
            {title || 'Enter Value'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {message && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {message}
            </p>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="glass-button px-4 py-2 rounded-xl hover-scale text-gray-700 dark:text-gray-300"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={required && !value.trim()}
            className={`glass-button px-4 py-2 rounded-xl hover-scale bg-blue-600 hover:bg-blue-700 text-white ${
              required && !value.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptDialog;
