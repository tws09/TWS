import { useCallback, useRef, useState } from 'react';

/**
 * Custom hook for handling swipe gestures
 * @param {Object} handlers - Swipe direction handlers
 * @param {Function} handlers.onSwipeLeft - Callback for left swipe
 * @param {Function} handlers.onSwipeRight - Callback for right swipe
 * @param {Function} handlers.onSwipeUp - Callback for up swipe
 * @param {Function} handlers.onSwipeDown - Callback for down swipe
 * @param {Object} options - Configuration options
 * @param {number} options.minDistance - Minimum distance to trigger swipe (default: 50)
 * @param {number} options.maxTime - Maximum time for swipe gesture (default: 300)
 * @param {number} options.threshold - Velocity threshold (default: 0.3)
 * @returns {Object} Event handlers and state
 */
export const useSwipe = (
  handlers = {},
  {
    minDistance = 50,
    maxTime = 300,
    threshold = 0.3
  } = {}
) => {
  const [isTracking, setIsTracking] = useState(false);
  const startTime = useRef(0);
  const startTouch = useRef({ x: 0, y: 0 });
  const currentTouch = useRef({ x: 0, y: 0 });

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = handlers;

  const handleTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    startTime.current = Date.now();
    startTouch.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    currentTouch.current = startTouch.current;
    setIsTracking(true);
  }, []);

  const handleTouchMove = useCallback((event) => {
    if (!isTracking) return;
    
    const touch = event.touches[0];
    currentTouch.current = {
      x: touch.clientX,
      y: touch.clientY
    };
  }, [isTracking]);

  const handleTouchEnd = useCallback((event) => {
    if (!isTracking) return;

    const endTime = Date.now();
    const timeDiff = endTime - startTime.current;
    
    if (timeDiff > maxTime) {
      setIsTracking(false);
      return;
    }

    const deltaX = currentTouch.current.x - startTouch.current.x;
    const deltaY = currentTouch.current.y - startTouch.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < minDistance) {
      setIsTracking(false);
      return;
    }

    const velocity = distance / timeDiff;
    
    if (velocity < threshold) {
      setIsTracking(false);
      return;
    }

    // Determine swipe direction
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight(event, { deltaX, deltaY, velocity, distance });
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft(event, { deltaX, deltaY, velocity, distance });
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown(event, { deltaX, deltaY, velocity, distance });
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp(event, { deltaX, deltaY, velocity, distance });
      }
    }

    setIsTracking(false);
  }, [isTracking, maxTime, minDistance, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  const handleMouseDown = useCallback((event) => {
    startTime.current = Date.now();
    startTouch.current = {
      x: event.clientX,
      y: event.clientY
    };
    currentTouch.current = startTouch.current;
    setIsTracking(true);
  }, []);

  const handleMouseMove = useCallback((event) => {
    if (!isTracking) return;
    
    currentTouch.current = {
      x: event.clientX,
      y: event.clientY
    };
  }, [isTracking]);

  const handleMouseUp = useCallback((event) => {
    if (!isTracking) return;

    const endTime = Date.now();
    const timeDiff = endTime - startTime.current;
    
    if (timeDiff > maxTime) {
      setIsTracking(false);
      return;
    }

    const deltaX = currentTouch.current.x - startTouch.current.x;
    const deltaY = currentTouch.current.y - startTouch.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < minDistance) {
      setIsTracking(false);
      return;
    }

    const velocity = distance / timeDiff;
    
    if (velocity < threshold) {
      setIsTracking(false);
      return;
    }

    // Determine swipe direction
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight(event, { deltaX, deltaY, velocity, distance });
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft(event, { deltaX, deltaY, velocity, distance });
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown(event, { deltaX, deltaY, velocity, distance });
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp(event, { deltaX, deltaY, velocity, distance });
      }
    }

    setIsTracking(false);
  }, [isTracking, maxTime, minDistance, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    isTracking
  };
};

export default useSwipe;
