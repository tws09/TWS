/**
 * Throttle utility function
 * 
 * Limits the rate at which a function can be called.
 * Ensures the function is called at most once per specified time period.
 * 
 * @param {Function} func - The function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 * 
 * @example
 * const handleScroll = throttle(() => {
 *   console.log('Scrolled');
 * }, 100);
 * 
 * window.addEventListener('scroll', handleScroll);
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};
