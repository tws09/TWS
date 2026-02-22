/**
 * Tests for breakpoint constants and utilities
 */

import { BREAKPOINTS, MEDIA_QUERIES, matchesBreakpoint } from '../breakpoints';

describe('BREAKPOINTS constants', () => {
  it('should export all required breakpoints', () => {
    expect(BREAKPOINTS).toHaveProperty('xs');
    expect(BREAKPOINTS).toHaveProperty('sm');
    expect(BREAKPOINTS).toHaveProperty('md');
    expect(BREAKPOINTS).toHaveProperty('lg');
    expect(BREAKPOINTS).toHaveProperty('xl');
    expect(BREAKPOINTS).toHaveProperty('2xl');
  });

  it('should have numeric values', () => {
    Object.values(BREAKPOINTS).forEach(value => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThan(0);
    });
  });

  it('should have breakpoints in ascending order', () => {
    const values = Object.values(BREAKPOINTS);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });

  it('should have correct breakpoint values', () => {
    expect(BREAKPOINTS.xs).toBe(475);
    expect(BREAKPOINTS.sm).toBe(640);
    expect(BREAKPOINTS.md).toBe(768);
    expect(BREAKPOINTS.lg).toBe(1024);
    expect(BREAKPOINTS.xl).toBe(1280);
    expect(BREAKPOINTS['2xl']).toBe(1536);
  });
});

describe('MEDIA_QUERIES', () => {
  it('should export media query strings', () => {
    expect(MEDIA_QUERIES).toBeDefined();
    expect(typeof MEDIA_QUERIES).toBe('object');
  });

  it('should have media queries for all breakpoints', () => {
    Object.keys(BREAKPOINTS).forEach(key => {
      expect(MEDIA_QUERIES).toHaveProperty(key);
    });
  });

  it('should have valid media query format', () => {
    Object.values(MEDIA_QUERIES).forEach(query => {
      expect(typeof query).toBe('string');
      expect(query).toMatch(/^\(min-width:\s*\d+px\)$/);
    });
  });
});

describe('matchesBreakpoint', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
  });

  it('should return true when window width matches breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });

    expect(matchesBreakpoint('lg')).toBe(true);
  });

  it('should return false when window width is below breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800
    });

    expect(matchesBreakpoint('lg')).toBe(false);
  });

  it('should return true when window width is above breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200
    });

    expect(matchesBreakpoint('lg')).toBe(true);
  });

  it('should handle exact breakpoint match', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768
    });

    expect(matchesBreakpoint('md')).toBe(true);
  });

  it('should handle edge case at breakpoint boundary', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1023
    });

    expect(matchesBreakpoint('lg')).toBe(false);

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });

    expect(matchesBreakpoint('lg')).toBe(true);
  });

  it('should handle invalid breakpoint name gracefully', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });

    expect(() => matchesBreakpoint('invalid')).toThrow();
  });
});
