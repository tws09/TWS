import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../../../../shared/utils/axiosInstance';
import { handleApiError, handleSuccess } from '../../utils/errorHandler';
import { SUCCESS_MESSAGES } from '../../constants/projectConstants';

const AddCardButton = ({ listId, onCardAdded }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/api/cards', {
        listId,
        title: title.trim()
      });

      if (response.data?.success) {
        handleSuccess(SUCCESS_MESSAGES.CARD_CREATED);
        onCardAdded(response.data.data?.card);
        setTitle('');
        setIsAdding(false);
      } else {
        handleApiError(new Error(response.data?.message || 'Failed to create card'));
      }
    } catch (error) {
      handleApiError(error, 'Failed to create card');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      setTitle('');
      setIsAdding(false);
    }
  };

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className="mt-2">
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a title for this card..."
          className="w-full p-2 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          autoFocus
        />
        <div className="flex space-x-2 mt-2">
          <button
            type="submit"
            disabled={!title.trim() || isLoading}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add Card'}
          </button>
          <button
            type="button"
            onClick={() => {
              setTitle('');
              setIsAdding(false);
            }}
            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="w-full mt-2 p-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-300 rounded transition-colors"
    >
      <PlusIcon className="h-4 w-4 inline mr-1" />
      Add a card
    </button>
  );
};

export default AddCardButton;
