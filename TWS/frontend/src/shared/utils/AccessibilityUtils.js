import React, { useEffect } from 'react';

// Accessibility Hook for keyboard navigation
export const useAccessibility = () => {
  useEffect(() => {
    // Add keyboard navigation support
    const handleKeyDown = (event) => {
      // Escape key to close modals/dropdowns
      if (event.key === 'Escape') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      }
      
      // Tab navigation enhancement
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };

    // Mouse interaction to remove keyboard navigation class
    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
};

// ARIA Labels and Descriptions
export const AriaLabels = {
  // Navigation
  mainNavigation: 'Main navigation menu',
  sidebarToggle: 'Toggle sidebar navigation',
  userMenu: 'User account menu',
  themeToggle: 'Toggle theme between light and dark mode',
  
  // Tables
  dataTable: 'Data table with sortable columns',
  sortableColumn: 'Click to sort this column',
  filterButton: 'Filter table data',
  pagination: 'Table pagination controls',
  
  // Actions
  viewDetails: 'View detailed information',
  editRecord: 'Edit this record',
  deleteRecord: 'Delete this record',
  terminateSession: 'Terminate this session',
  revokeAccess: 'Revoke access permissions',
  
  // Status indicators
  activeStatus: 'Active status',
  inactiveStatus: 'Inactive status',
  loadingStatus: 'Loading content',
  errorStatus: 'Error occurred',
  
  // Charts and graphs
  chartContainer: 'Interactive chart',
  chartData: 'Chart data visualization',
  
  // Forms
  requiredField: 'Required field',
  optionalField: 'Optional field',
  formValidation: 'Form validation message',
  
  // Modals and dialogs
  modalDialog: 'Modal dialog window',
  closeModal: 'Close modal dialog',
  confirmAction: 'Confirm action dialog',
  
  // Loading states
  loadingContent: 'Content is loading',
  skeletonLoader: 'Content placeholder while loading'
};

// Screen Reader Only Text Component
export const ScreenReaderOnly = ({ children, ...props }) => (
  <span
    style={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0
    }}
    {...props}
  >
    {children}
  </span>
);

// Focus Management Hook
export const useFocusManagement = () => {
  const focusElement = (element) => {
    if (element && element.focus) {
      element.focus();
    }
  };

  const trapFocus = (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };

  return { focusElement, trapFocus };
};

// Skip Link Component
export const SkipLink = ({ href, children = 'Skip to main content' }) => (
  <a
    href={href}
    style={{
      position: 'absolute',
      top: '-40px',
      left: '6px',
      background: '#000',
      color: '#fff',
      padding: '8px',
      textDecoration: 'none',
      zIndex: 1000,
      borderRadius: '4px',
      fontSize: '14px',
      transition: 'top 0.3s ease'
    }}
    onFocus={(e) => {
      e.target.style.top = '6px';
    }}
    onBlur={(e) => {
      e.target.style.top = '-40px';
    }}
  >
    {children}
  </a>
);

// High Contrast Mode Detection
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      // Check for Windows High Contrast Mode
      const isHighContrastMode = window.matchMedia('(-ms-high-contrast: active)').matches;
      setIsHighContrast(isHighContrastMode);
    };

    checkHighContrast();
    
    const mediaQuery = window.matchMedia('(-ms-high-contrast: active)');
    mediaQuery.addListener(checkHighContrast);

    return () => {
      mediaQuery.removeListener(checkHighContrast);
    };
  }, []);

  return isHighContrast;
};

// Reduced Motion Detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
};

// Color Contrast Checker
export const checkColorContrast = (foreground, background) => {
  const getLuminance = (color) => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(c => {
      c = parseInt(c) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const foregroundLuminance = getLuminance(foreground);
  const backgroundLuminance = getLuminance(background);
  
  const contrast = (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) / 
                   (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
  
  return {
    ratio: contrast,
    isAA: contrast >= 4.5,
    isAAA: contrast >= 7
  };
};

// Announcement Component for Screen Readers
export const Announcement = ({ message, priority = 'polite' }) => {
  const [announcement, setAnnouncement] = React.useState('');

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      // Clear announcement after a delay
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
    >
      {announcement}
    </div>
  );
};

export default {
  useAccessibility,
  AriaLabels,
  ScreenReaderOnly,
  useFocusManagement,
  SkipLink,
  useHighContrastMode,
  useReducedMotion,
  checkColorContrast,
  Announcement
};
