/**
 * Z-Index Constants
 * 
 * Standardized z-index scale for consistent layering across the application.
 * Use these constants instead of arbitrary z-index values.
 * 
 * @example
 * import { Z_INDEX } from '@/shared/constants/zIndex';
 * 
 * <div style={{ zIndex: Z_INDEX.DROPDOWN }}>
 *   Dropdown content
 * </div>
 */

export const Z_INDEX = {
  /** Base layer - background elements */
  BASE: 0,
  
  /** Dropdown menus, popovers */
  DROPDOWN: 1000,
  
  /** Sticky elements (headers, footers) */
  STICKY: 1010,
  
  /** Fixed elements (fixed headers, sidebars) */
  FIXED: 1020,
  
  /** Modal backdrop/overlay */
  MODAL_BACKDROP: 1030,
  
  /** Modal dialogs */
  MODAL: 1040,
  
  /** Popovers, tooltips (highest interactive) */
  POPOVER: 1050,
  
  /** Tooltips (highest) */
  TOOLTIP: 1060,
};

/**
 * CSS custom properties for z-index values
 * Use in CSS: z-index: var(--z-dropdown);
 */
export const Z_INDEX_CSS_VARS = {
  '--z-base': Z_INDEX.BASE,
  '--z-dropdown': Z_INDEX.DROPDOWN,
  '--z-sticky': Z_INDEX.STICKY,
  '--z-fixed': Z_INDEX.FIXED,
  '--z-modal-backdrop': Z_INDEX.MODAL_BACKDROP,
  '--z-modal': Z_INDEX.MODAL,
  '--z-popover': Z_INDEX.POPOVER,
  '--z-tooltip': Z_INDEX.TOOLTIP,
};
