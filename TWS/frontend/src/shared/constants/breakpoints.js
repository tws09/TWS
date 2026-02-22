/**
 * Breakpoint Constants
 * 
 * Unified breakpoint system for consistent responsive design.
 * Use these constants instead of arbitrary width checks.
 * 
 * @example
 * import { BREAKPOINTS, useBreakpoint } from '@/shared/constants/breakpoints';
 * 
 * const breakpoint = useBreakpoint();
 * if (breakpoint >= BREAKPOINTS.lg) {
 *   // Desktop styles
 * }
 */

export const BREAKPOINTS = {
  /** Extra small devices (phones) */
  xs: 475,
  
  /** Small devices (landscape phones) */
  sm: 640,
  
  /** Medium devices (tablets) */
  md: 768,
  
  /** Large devices (desktops) */
  lg: 1024,
  
  /** Extra large devices (large desktops) */
  xl: 1280,
  
  /** 2X Large devices (larger desktops) */
  '2xl': 1536,
  
  /** 3X Large devices (ultrawide monitors) */
  '3xl': 1920,
  
  /** 4X Large devices (4K monitors) */
  '4xl': 2560,
};

/**
 * Breakpoint media query strings
 */
export const MEDIA_QUERIES = {
  xs: `(min-width: ${BREAKPOINTS.xs}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
  '3xl': `(min-width: ${BREAKPOINTS['3xl']}px)`,
  '4xl': `(min-width: ${BREAKPOINTS['4xl']}px)`,
};

/**
 * Check if current viewport matches a breakpoint
 * 
 * @param {string} breakpoint - Breakpoint name (xs, sm, md, lg, xl, 2xl, 3xl, 4xl)
 * @returns {boolean} True if viewport is at or above the breakpoint
 */
export const matchesBreakpoint = (breakpoint) => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS[breakpoint];
};
