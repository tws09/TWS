/**
 * Date Utility Functions
 * Centralized date formatting and manipulation for tenant projects
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
  
  try {
    return new Date(date).toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format date and time for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return 'No date set';
  
  try {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Check if date is overdue
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isOverdue = (date) => {
  if (!date) return false;
  try {
    const checkDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  } catch (error) {
    return false;
  }
};

/**
 * Get days until date
 * @param {string|Date} date - Target date
 * @returns {number} Days until date (negative if past)
 */
export const getDaysUntil = (date) => {
  if (!date) return null;
  try {
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    return null;
  }
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Unknown time';
  
  try {
    const targetDate = new Date(date);
    const now = new Date();
    const diffMs = targetDate - now;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (Math.abs(diffSeconds) < 60) {
      return diffSeconds > 0 ? 'in a few seconds' : 'a few seconds ago';
    } else if (Math.abs(diffMinutes) < 60) {
      return diffMinutes > 0 
        ? `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`
        : `${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) !== 1 ? 's' : ''} ago`;
    } else if (Math.abs(diffHours) < 24) {
      return diffHours > 0
        ? `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`
        : `${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''} ago`;
    } else if (Math.abs(diffDays) < 30) {
      return diffDays > 0
        ? `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
        : `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
    } else {
      return formatDate(date);
    }
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Get start and end dates for a period
 * @param {string} period - Period type (today, this_week, last_week, this_month, last_month)
 * @returns {Object} Object with startDate and endDate
 */
export const getPeriodDates = (period) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let startDate = new Date(today);
  let endDate = new Date(today);
  
  switch (period) {
    case 'today':
      // Already set
      break;
    case 'this_week':
      const dayOfWeek = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      break;
    case 'last_week':
      const lastWeekDay = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - lastWeekDay - 7);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      break;
    case 'this_month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case 'last_month':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    default:
      // Default to today
      break;
  }
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

