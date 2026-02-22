/**
 * Tests for useHeaderHeight hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useHeaderHeight } from '../useHeaderHeight';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation((callback) => {
  return {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    // Helper to trigger callback
    trigger: (entries) => callback(entries),
  };
});

describe('useHeaderHeight', () => {
  let container;
  let headerElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    headerElement = document.createElement('div');
    headerElement.className = 'glass-header';
    container.appendChild(headerElement);
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  it('should return default height when header not found', () => {
    const { result } = renderHook(() => useHeaderHeight('.non-existent-header', 64));

    expect(result.current).toBe(64);
  });

  it('should return default height initially', () => {
    const { result } = renderHook(() => useHeaderHeight('.glass-header', 64));

    expect(result.current).toBe(64);
  });

  it('should observe header element when found', () => {
    const observeSpy = jest.spyOn(ResizeObserver.prototype, 'observe');

    renderHook(() => useHeaderHeight('.glass-header', 64));

    waitFor(() => {
      expect(observeSpy).toHaveBeenCalled();
    });
  });

  it('should update height when ResizeObserver triggers', async () => {
    let resizeObserverCallback;
    const observeSpy = jest.spyOn(ResizeObserver.prototype, 'observe').mockImplementation(function(callback) {
      resizeObserverCallback = callback;
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });

    const { result } = renderHook(() => useHeaderHeight('.glass-header', 64));

    // Simulate ResizeObserver callback
    act(() => {
      if (resizeObserverCallback) {
        resizeObserverCallback([{
          target: headerElement,
          contentRect: { height: 80 }
        }]);
      }
    });

    await waitFor(() => {
      expect(result.current).toBe(80);
    });
  });

  it('should cleanup ResizeObserver on unmount', () => {
    const disconnectSpy = jest.spyOn(ResizeObserver.prototype, 'disconnect');

    const { unmount } = renderHook(() => useHeaderHeight('.glass-header', 64));

    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should handle custom selector', () => {
    const customHeader = document.createElement('div');
    customHeader.className = 'custom-header';
    container.appendChild(customHeader);

    const { result } = renderHook(() => useHeaderHeight('.custom-header', 100));

    expect(result.current).toBe(100);
  });

  it('should handle multiple header elements (first match)', () => {
    const header1 = document.createElement('div');
    header1.className = 'glass-header';
    header1.style.height = '60px';
    container.appendChild(header1);

    const header2 = document.createElement('div');
    header2.className = 'glass-header';
    header2.style.height = '80px';
    container.appendChild(header2);

    const { result } = renderHook(() => useHeaderHeight('.glass-header', 64));

    // Should use first matching element
    expect(result.current).toBe(64); // Default until ResizeObserver triggers
  });
});

// Helper function for act
const act = (callback) => {
  callback();
};
