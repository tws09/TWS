/**
 * Tests for throttle utility function
 */

import { throttle } from '../throttle';

describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should call the function immediately on first call', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn();

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should throttle function calls within the limit period', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    // Call multiple times rapidly
    throttledFn();
    throttledFn();
    throttledFn();

    // Should only be called once (first call)
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Fast-forward time
    jest.advanceTimersByTime(100);

    // Now another call should be allowed
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should pass arguments correctly', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn('arg1', 'arg2');

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should maintain context (this binding)', () => {
    const obj = {
      value: 42,
      fn: function() {
        return this.value;
      }
    };

    obj.throttledFn = throttle(obj.fn, 100);
    const result = obj.throttledFn();

    expect(result).toBe(42);
  });

  it('should handle rapid successive calls correctly', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    // Rapid calls
    for (let i = 0; i < 10; i++) {
      throttledFn(i);
    }

    // Should only be called once with first argument
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(0);

    // After throttle period, next call should work
    jest.advanceTimersByTime(100);
    throttledFn(10);
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith(10);
  });

  it('should handle zero delay', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 0);

    throttledFn();
    throttledFn();

    // With zero delay, should allow all calls
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should handle edge case with very small delay', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 1);

    throttledFn();
    throttledFn();

    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1);
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
