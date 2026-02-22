/**
 * Tests for animation duration constants
 */

import { ANIMATION_DURATION, ANIMATION_DURATION_CSS } from '../animations';

describe('ANIMATION_DURATION constants', () => {
  it('should export all required duration values', () => {
    expect(ANIMATION_DURATION).toHaveProperty('FAST');
    expect(ANIMATION_DURATION).toHaveProperty('NORMAL');
    expect(ANIMATION_DURATION).toHaveProperty('SLOW');
    expect(ANIMATION_DURATION).toHaveProperty('SLOWER');
  });

  it('should have numeric values in milliseconds', () => {
    expect(ANIMATION_DURATION.FAST).toBe(150);
    expect(ANIMATION_DURATION.NORMAL).toBe(200);
    expect(ANIMATION_DURATION.SLOW).toBe(300);
    expect(ANIMATION_DURATION.SLOWER).toBe(500);
  });

  it('should have durations in ascending order', () => {
    expect(ANIMATION_DURATION.FAST).toBeLessThan(ANIMATION_DURATION.NORMAL);
    expect(ANIMATION_DURATION.NORMAL).toBeLessThan(ANIMATION_DURATION.SLOW);
    expect(ANIMATION_DURATION.SLOW).toBeLessThan(ANIMATION_DURATION.SLOWER);
  });

  it('should have positive duration values', () => {
    Object.values(ANIMATION_DURATION).forEach(value => {
      expect(value).toBeGreaterThan(0);
      expect(typeof value).toBe('number');
    });
  });
});

describe('ANIMATION_DURATION_CSS', () => {
  it('should export CSS variable strings', () => {
    expect(ANIMATION_DURATION_CSS).toBeDefined();
    expect(typeof ANIMATION_DURATION_CSS).toBe('object');
  });

  it('should have CSS variables for all durations', () => {
    expect(ANIMATION_DURATION_CSS).toHaveProperty('FAST');
    expect(ANIMATION_DURATION_CSS).toHaveProperty('NORMAL');
    expect(ANIMATION_DURATION_CSS).toHaveProperty('SLOW');
    expect(ANIMATION_DURATION_CSS).toHaveProperty('SLOWER');
  });

  it('should have valid CSS variable format', () => {
    Object.values(ANIMATION_DURATION_CSS).forEach(value => {
      expect(typeof value).toBe('string');
      expect(value).toMatch(/^var\(--duration-[\w-]+\)$/);
    });
  });

  it('should map correctly to duration values', () => {
    expect(ANIMATION_DURATION_CSS.FAST).toBe('var(--duration-fast)');
    expect(ANIMATION_DURATION_CSS.NORMAL).toBe('var(--duration-normal)');
    expect(ANIMATION_DURATION_CSS.SLOW).toBe('var(--duration-slow)');
    expect(ANIMATION_DURATION_CSS.SLOWER).toBe('var(--duration-slower)');
  });
});
