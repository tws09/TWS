/**
 * Date Utility Functions
 * Centralized date formatting and manipulation
 */

/**
 * Format card due date with relative time information
 * @param {string|Date} date - Due date
 * @returns {Object|null} Object with text and color, or null if no date
 */
export const formatCardDueDate = (date) => {
  if (!date) return null;
  
  const cardDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  cardDate.setHours(0, 0, 0, 0);
  
  const diffTime = cardDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { 
      text: `${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'} overdue`, 
      color: 'text-red-600' 
    };
  } else if (diffDays === 0) {
    return { text: 'Due today', color: 'text-orange-600' };
  } else if (diffDays === 1) {
    return { text: 'Due tomorrow', color: 'text-yellow-600' };
  } else if (diffDays <= 3) {
    return { text: `Due in ${diffDays} days`, color: 'text-yellow-600' };
  } else {
    return { text: cardDate.toLocaleDateString(), color: 'text-gray-500' };
  }
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'No date set';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
};

/**
 * Check if date is overdue
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isOverdue = (date) => {
  if (!date) return false;
  const checkDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Get days until date
 * @param {string|Date} date - Target date
 * @returns {number} Days until date (negative if past)
 */
export const getDaysUntil = (date) => {
  if (!date) return null;
  const targetDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

