/**
 * QuickAddTask Component
 * Trello/ClickUp style inline task creation
 * Appears directly in Kanban columns
 */

import React, { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CARD_STATUS } from '../constants/projectConstants';

const QuickAddTask = ({ columnId, onAddTask, onCancel }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddTask({
        title: title.trim(),
        status: columnId,
        // Project can be assigned later
      });
      setTitle('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsExpanded(false);
    if (onCancel) onCancel();
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full mt-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
      >
        <PlusIcon className="w-4 h-4" />
        <span>Add a task</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title..."
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows="2"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleCancel();
            }
          }}
        />
        <div className="flex items-center gap-2 mt-2">
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default QuickAddTask;
