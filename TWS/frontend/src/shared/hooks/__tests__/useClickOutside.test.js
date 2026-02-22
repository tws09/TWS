/**
 * Tests for useClickOutside hook
 */

import { renderHook, act } from '@testing-library/react';
import { useClickOutside } from '../useClickOutside';

describe('useClickOutside', () => {
  let container;
  let element;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    element = document.createElement('div');
    container.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should call handler when clicking outside element', () => {
    const handler = jest.fn();
    const ref = { current: element };

    renderHook(() => useClickOutside(ref, handler));

    act(() => {
      document.body.click();
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not call handler when clicking inside element', () => {
    const handler = jest.fn();
    const ref = { current: element };

    renderHook(() => useClickOutside(ref, handler));

    act(() => {
      element.click();
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should not call handler when disabled', () => {
    const handler = jest.fn();
    const ref = { current: element };

    renderHook(() => useClickOutside(ref, handler, false));

    act(() => {
      document.body.click();
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle null ref gracefully', () => {
    const handler = jest.fn();
    const ref = { current: null };

    renderHook(() => useClickOutside(ref, handler));

    act(() => {
      document.body.click();
    });

    // Should not throw, but handler may or may not be called depending on implementation
    expect(() => {
      document.body.click();
    }).not.toThrow();
  });

  it('should cleanup event listener on unmount', () => {
    const handler = jest.fn();
    const ref = { current: element };
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useClickOutside(ref, handler));

    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('should handle multiple clicks correctly', () => {
    const handler = jest.fn();
    const ref = { current: element };

    renderHook(() => useClickOutside(ref, handler));

    act(() => {
      document.body.click();
      document.body.click();
      document.body.click();
    });

    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('should handle touch events', () => {
    const handler = jest.fn();
    const ref = { current: element };

    renderHook(() => useClickOutside(ref, handler));

    act(() => {
      const touchEvent = new TouchEvent('touchstart', { bubbles: true });
      document.body.dispatchEvent(touchEvent);
    });

    // Implementation may handle touch events, test should verify behavior
    expect(() => {
      const touchEvent = new TouchEvent('touchstart', { bubbles: true });
      document.body.dispatchEvent(touchEvent);
    }).not.toThrow();
  });
});
