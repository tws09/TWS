/**
 * Tests for Z_INDEX constants
 */

import { Z_INDEX, Z_INDEX_CSS_VARS } from '../zIndex';

describe('Z_INDEX constants', () => {
  it('should export all required z-index values', () => {
    expect(Z_INDEX).toHaveProperty('BASE');
    expect(Z_INDEX).toHaveProperty('DROPDOWN');
    expect(Z_INDEX).toHaveProperty('STICKY');
    expect(Z_INDEX).toHaveProperty('FIXED');
    expect(Z_INDEX).toHaveProperty('MODAL_BACKDROP');
    expect(Z_INDEX).toHaveProperty('MODAL');
    expect(Z_INDEX).toHaveProperty('POPOVER');
    expect(Z_INDEX).toHaveProperty('TOOLTIP');
  });

  it('should have correct z-index hierarchy', () => {
    expect(Z_INDEX.BASE).toBeLessThan(Z_INDEX.DROPDOWN);
    expect(Z_INDEX.DROPDOWN).toBeLessThan(Z_INDEX.STICKY);
    expect(Z_INDEX.STICKY).toBeLessThan(Z_INDEX.FIXED);
    expect(Z_INDEX.FIXED).toBeLessThan(Z_INDEX.MODAL_BACKDROP);
    expect(Z_INDEX.MODAL_BACKDROP).toBeLessThan(Z_INDEX.MODAL);
    expect(Z_INDEX.MODAL).toBeLessThan(Z_INDEX.POPOVER);
    expect(Z_INDEX.POPOVER).toBeLessThan(Z_INDEX.TOOLTIP);
  });

  it('should have numeric values', () => {
    Object.values(Z_INDEX).forEach(value => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });

  it('should export CSS variables object', () => {
    expect(Z_INDEX_CSS_VARS).toBeDefined();
    expect(typeof Z_INDEX_CSS_VARS).toBe('object');
  });

  it('should have CSS variables for all z-index values', () => {
    Object.keys(Z_INDEX).forEach(key => {
      const cssVarKey = key.toLowerCase().replace(/_/g, '-');
      expect(Z_INDEX_CSS_VARS).toHaveProperty(cssVarKey);
    });
  });

  it('should have CSS variables with correct format', () => {
    Object.values(Z_INDEX_CSS_VARS).forEach(value => {
      expect(typeof value).toBe('string');
      expect(value).toMatch(/^var\(--z-[\w-]+\)$/);
    });
  });
});
