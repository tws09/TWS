import { useState, useEffect } from 'react';

/**
 * Hook to dynamically measure and track header height
 * 
 * Uses ResizeObserver to automatically update when header height changes.
 * Falls back to default height if ResizeObserver is not supported.
 * 
 * @param {string} headerSelector - CSS selector for the header element (default: '.glass-header')
 * @param {number} defaultHeight - Default height in pixels (default: 64)
 * @returns {number} Current header height in pixels
 * 
 * @example
 * const headerHeight = useHeaderHeight();
 * 
 * <main style={{ paddingTop: `${headerHeight}px` }}>
 *   Content
 * </main>
 */
export const useHeaderHeight = (headerSelector = '.glass-header', defaultHeight = 64) => {
  const [height, setHeight] = useState(defaultHeight);

  useEffect(() => {
    const header = document.querySelector(headerSelector);
    if (!header) {
      // If header not found, use default height
      setHeight(defaultHeight);
      return;
    }

    // Set initial height
    setHeight(header.offsetHeight);

    // Check if ResizeObserver is supported
    if (typeof ResizeObserver === 'undefined') {
      // Fallback: listen to window resize
      const handleResize = () => {
        const currentHeader = document.querySelector(headerSelector);
        if (currentHeader) {
          setHeight(currentHeader.offsetHeight);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    // Use ResizeObserver for accurate height tracking
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(header);

    return () => {
      resizeObserver.disconnect();
    };
  }, [headerSelector, defaultHeight]);

  return height;
};
