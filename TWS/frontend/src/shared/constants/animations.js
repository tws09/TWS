/**
 * Animation Duration Constants
 * 
 * Standardized animation durations for consistent feel across the application.
 * Use these constants instead of arbitrary duration values.
 * 
 * @example
 * import { ANIMATION_DURATION } from '@/shared/constants/animations';
 * 
 * <div style={{ transition: `all ${ANIMATION_DURATION.FAST}ms ease` }}>
 *   Content
 * </div>
 */

export const ANIMATION_DURATION = {
  /** Fast micro-interactions (150ms) */
  FAST: 150,
  
  /** Standard transitions (200ms) */
  NORMAL: 200,
  
  /** Comfortable animations (300ms) */
  SLOW: 300,
  
  /** Deliberate transitions (500ms) */
  SLOWER: 500,
};

/**
 * CSS custom properties for animation durations
 * Use in CSS: transition-duration: var(--duration-fast);
 */
export const ANIMATION_DURATION_CSS = {
  '--duration-fast': `${ANIMATION_DURATION.FAST}ms`,
  '--duration-normal': `${ANIMATION_DURATION.NORMAL}ms`,
  '--duration-slow': `${ANIMATION_DURATION.SLOW}ms`,
  '--duration-slower': `${ANIMATION_DURATION.SLOWER}ms`,
};
