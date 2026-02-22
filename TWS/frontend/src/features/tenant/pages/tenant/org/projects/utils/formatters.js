/**
 * Formatting Utilities for Tenant Projects
 * Provides consistent formatting functions across the application
 */

/**
 * Format currency value
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount == null || isNaN(amount)) return 'N/A';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format number with commas
 */
export const formatNumber = (number, decimals = 0) => {
  if (number == null || isNaN(number)) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value == null || isNaN(value)) return '0%';
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format duration in hours
 */
export const formatHours = (hours, showDecimal = true) => {
  if (hours == null || isNaN(hours)) return '0h';
  
  if (showDecimal && hours % 1 !== 0) {
    return `${hours.toFixed(1)}h`;
  }
  
  return `${Math.round(hours)}h`;
};

/**
 * Format duration in hours and minutes
 */
export const formatDuration = (hours) => {
  if (hours == null || isNaN(hours)) return '0h 0m';
  
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  
  return `${h}h ${m}m`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes == null || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  if (Math.abs(diffInSeconds) < 60) {
    return diffInSeconds < 0 ? 'in a few seconds' : 'a few seconds ago';
  }
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(Math.abs(diffInSeconds) / seconds);
    if (interval >= 1) {
      const isPast = diffInSeconds > 0;
      const plural = interval > 1 ? 's' : '';
      return isPast 
        ? `${interval} ${unit}${plural} ago`
        : `in ${interval} ${unit}${plural}`;
    }
  }
  
  return 'just now';
};

/**
 * Format initials from name
 */
export const formatInitials = (name) => {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format story points
 */
export const formatStoryPoints = (points) => {
  if (points == null) return 'Not estimated';
  return `${points} ${points === 1 ? 'point' : 'points'}`;
};

/**
 * Format status for display
 */
export const formatStatus = (status) => {
  if (!status) return 'Unknown';
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format priority for display
 */
export const formatPriority = (priority) => {
  if (!priority) return 'Medium';
  
  return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
};

/**
 * Format list of items as comma-separated string
 */
export const formatList = (items, maxItems = null) => {
  if (!items || !Array.isArray(items) || items.length === 0) return 'None';
  
  if (maxItems && items.length > maxItems) {
    const visible = items.slice(0, maxItems);
    const remaining = items.length - maxItems;
    return `${visible.join(', ')} and ${remaining} more`;
  }
  
  return items.join(', ');
};

/**
 * Format utilization percentage with color indicator
 */
export const formatUtilization = (percentage) => {
  if (percentage == null || isNaN(percentage)) return { text: 'N/A', color: 'gray' };
  
  const formatted = `${percentage.toFixed(0)}%`;
  
  let color = 'gray';
  if (percentage >= 100) color = 'red';
  else if (percentage >= 80) color = 'yellow';
  else if (percentage >= 50) color = 'green';
  else color = 'blue';
  
  return { text: formatted, color };
};

/**
 * Format velocity (story points per sprint)
 */
export const formatVelocity = (velocity) => {
  if (velocity == null || isNaN(velocity)) return '0 points';
  return `${velocity.toFixed(1)} ${velocity === 1 ? 'point' : 'points'}`;
};

