import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../../../../shared/utils/axiosInstance';
import { handleApiError, handleSuccess } from '../../utils/errorHandler';

const AddListButton = ({ boardId, onListAdded }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/api/lists', {
        boardId,
        name: name.trim()
      });

      if (response.data?.success) {
        handleSuccess('List created successfully');
        onListAdded(response.data.data?.list);
        setName('');
        setIsAdding(false);
      } else {
        handleApiError(new Error(response.data?.message || 'Failed to create list'));
      }
    } catch (error) {
      handleApiError(error, 'Failed to create list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      setName('');
      setIsAdding(false);
    }
  };

  if (isAdding) {
    return (
      <div className="bg-gray-200 rounded-lg p-3 w-80 flex-shrink-0">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter list title..."
            className="w-full p-2 text-sm font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex space-x-2 mt-3">
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add List'}
            </button>
            <button
              type="button"
              onClick={() => {
                setName('');
                setIsAdding(false);
              }}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="bg-gray-200 rounded-lg p-3 w-80 flex-shrink-0 hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-600 hover:text-gray-800"
    >
      <PlusIcon className="h-5 w-5 mr-2" />
      Add another list
    </button>
  );
};

export default AddListButton;
