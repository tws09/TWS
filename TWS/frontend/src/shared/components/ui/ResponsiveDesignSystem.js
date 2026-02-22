// Responsive Design System - Centralized exports
// This file provides a unified interface for all responsive components

// Core responsive hooks
export { useResponsive, useResponsiveSidebar, useResponsiveContent, useResponsiveTypography, useResponsiveTouch } from '../../../shared/hooks/useResponsive';

// Responsive components
export { default as ResponsiveButton, ResponsiveIconButton, ResponsiveFAB } from './ResponsiveButton';
export { 
  ResponsiveForm, 
  ResponsiveFormGroup, 
  ResponsiveLabel, 
  ResponsiveInput, 
  ResponsiveTextarea, 
  ResponsiveSelect, 
  ResponsiveCheckbox, 
  ResponsiveRadio, 
  ResponsiveFormError, 
  ResponsiveFormHelp 
} from './ResponsiveForm';
export { 
  ResponsiveCard, 
  ResponsiveCardHeader, 
  ResponsiveCardTitle, 
  ResponsiveCardDescription, 
  ResponsiveCardContent, 
  ResponsiveCardFooter, 
  ResponsiveCardGrid, 
  ResponsiveCardList, 
  ResponsiveCardStats, 
  ResponsiveCardActions 
} from './ResponsiveCard';
export { 
  ResponsiveGrid, 
  ResponsiveFlex, 
  ResponsiveContainer, 
  ResponsiveStack, 
  ResponsiveColumns, 
  ResponsiveMasonry, 
  ResponsiveAspectRatio, 
  ResponsiveBreakpoint 
} from './ResponsiveGrid';

// Progressive disclosure components
export { 
  ProgressiveDisclosure, 
  ProgressiveAccordion, 
  ProgressiveTabs, 
  ProgressiveList, 
  ProgressiveForm 
} from './ProgressiveDisclosure';

// Loading components
export { 
  default as UnifiedLoading, 
  LoadingSpinner, 
  LoadingSkeleton, 
  LoadingDots, 
  LoadingCard, 
  LoadingTable, 
  LoadingButton 
} from './Loading/UnifiedLoading';

// Optimized sidebar
export { default as OptimizedSidebar, MobileMenuButton } from './OptimizedSidebar';

// Demo components
export { default as DemoUserSelector } from './DemoUserSelector';

// Performance utilities
export * from '../../../shared/utils/performance';

// Design system constants
export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
  '4xl': 2560
};

export const SPACING = {
  xs: 0.5,
  sm: 0.75,
  md: 1,
  lg: 1.5,
  xl: 2,
  '2xl': 2.5,
  '3xl': 3
};

export const TYPOGRAPHY = {
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  },
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  lineHeights: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
};

export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  accent: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87'
  }
};

export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
};

export const BORDER_RADIUS = {
  none: '0px',
  sm: '0.125rem',
  default: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px'
};

export const TRANSITIONS = {
  none: 'none',
  all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  default: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1), text-decoration-color 150ms cubic-bezier(0.4, 0, 0.2, 1), fill 150ms cubic-bezier(0.4, 0, 0.2, 1), stroke 150ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1), filter 150ms cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  colors: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1), text-decoration-color 150ms cubic-bezier(0.4, 0, 0.2, 1), fill 150ms cubic-bezier(0.4, 0, 0.2, 1), stroke 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  shadow: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)'
};

// Utility functions
export const getResponsiveValue = (values, breakpoint) => {
  if (typeof values === 'object' && values !== null) {
    return values[breakpoint] || values.default || values;
  }
  return values;
};

export const createResponsiveClass = (baseClass, responsiveValues) => {
  const classes = [baseClass];
  
  Object.entries(responsiveValues).forEach(([breakpoint, value]) => {
    if (breakpoint === 'default') {
      classes.push(value);
    } else {
      classes.push(`${breakpoint}:${value}`);
    }
  });
  
  return classes.join(' ');
};

export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < BREAKPOINTS.sm) return 'mobile';
  if (width < BREAKPOINTS.md) return 'tablet';
  if (width < BREAKPOINTS.lg) return 'laptop';
  return 'desktop';
};

export const getViewportSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

// Media query helpers
export const createMediaQuery = (breakpoint) => {
  return `@media (min-width: ${BREAKPOINTS[breakpoint]}px)`;
};

export const matchesMediaQuery = (breakpoint) => {
  return window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`).matches;
};

// Accessibility helpers
export const getAriaLabel = (text, context = '') => {
  return context ? `${text} ${context}` : text;
};

export const getRoleDescription = (role) => {
  const descriptions = {
    button: 'Click to activate',
    link: 'Navigate to page',
    textbox: 'Enter text',
    checkbox: 'Toggle selection',
    radio: 'Select option',
    slider: 'Adjust value',
    tab: 'Switch to tab',
    menu: 'Open menu',
    dialog: 'Open dialog'
  };
  return descriptions[role] || '';
};

// Animation helpers
export const createAnimation = (keyframes, options = {}) => {
  const defaultOptions = {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'both',
    ...options
  };
  
  return {
    keyframes,
    options: defaultOptions
  };
};

export const fadeIn = createAnimation([
  { opacity: 0, transform: 'translateY(10px)' },
  { opacity: 1, transform: 'translateY(0)' }
]);

export const fadeOut = createAnimation([
  { opacity: 1, transform: 'translateY(0)' },
  { opacity: 0, transform: 'translateY(-10px)' }
]);

export const slideIn = createAnimation([
  { transform: 'translateX(-100%)' },
  { transform: 'translateX(0)' }
]);

export const slideOut = createAnimation([
  { transform: 'translateX(0)' },
  { transform: 'translateX(100%)' }
]);

export const scaleIn = createAnimation([
  { transform: 'scale(0.95)', opacity: 0 },
  { transform: 'scale(1)', opacity: 1 }
]);

export const scaleOut = createAnimation([
  { transform: 'scale(1)', opacity: 1 },
  { transform: 'scale(0.95)', opacity: 0 }
]);

// Default export with all utilities
export default {
  // Hooks
  useResponsive,
  useResponsiveSidebar,
  useResponsiveContent,
  useResponsiveTypography,
  useResponsiveTouch,
  
  // Components
  ResponsiveButton,
  ResponsiveIconButton,
  ResponsiveFAB,
  ResponsiveForm,
  ResponsiveFormGroup,
  ResponsiveLabel,
  ResponsiveInput,
  ResponsiveTextarea,
  ResponsiveSelect,
  ResponsiveCheckbox,
  ResponsiveRadio,
  ResponsiveFormError,
  ResponsiveFormHelp,
  ResponsiveCard,
  ResponsiveCardHeader,
  ResponsiveCardTitle,
  ResponsiveCardDescription,
  ResponsiveCardContent,
  ResponsiveCardFooter,
  ResponsiveCardGrid,
  ResponsiveCardList,
  ResponsiveCardStats,
  ResponsiveCardActions,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveContainer,
  ResponsiveStack,
  ResponsiveColumns,
  ResponsiveMasonry,
  ResponsiveAspectRatio,
  ResponsiveBreakpoint,
  ProgressiveDisclosure,
  ProgressiveAccordion,
  ProgressiveTabs,
  ProgressiveList,
  ProgressiveForm,
  UnifiedLoading,
  LoadingSpinner,
  LoadingSkeleton,
  LoadingDots,
  LoadingCard,
  LoadingTable,
  LoadingButton,
  OptimizedSidebar,
  MobileMenuButton,
  DemoUserSelector,
  
  // Constants
  BREAKPOINTS,
  SPACING,
  TYPOGRAPHY,
  COLORS,
  SHADOWS,
  BORDER_RADIUS,
  TRANSITIONS,
  
  // Utilities
  getResponsiveValue,
  createResponsiveClass,
  isTouchDevice,
  getDeviceType,
  getViewportSize,
  createMediaQuery,
  matchesMediaQuery,
  getAriaLabel,
  getRoleDescription,
  createAnimation,
  fadeIn,
  fadeOut,
  slideIn,
  slideOut,
  scaleIn,
  scaleOut
};
