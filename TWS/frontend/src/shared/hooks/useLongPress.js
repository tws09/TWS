import { useCallback, useRef, useState } from 'react';

/**
 * Custom hook for handling long press gestures
 * @param {Function} onLongPress - Callback function to execute on long press
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Time in milliseconds to trigger long press (default: 500)
 * @param {Function} options.onStart - Callback when press starts
 * @param {Function} options.onFinish - Callback when press finishes
 * @param {Function} options.onCancel - Callback when press is cancelled
 * @returns {Object} Event handlers and state
 */
export const useLongPress = (
  onLongPress,
  {
    threshold = 500,
    onStart,
    onFinish,
    onCancel
  } = {}
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef();
  const target = useRef();

  const start = useCallback(
    (event) => {
      // Prevent default to avoid context menus on mobile
      event.preventDefault();
      
      if (onStart) {
        onStart(event);
      }

      target.current = event.target;
      
      timeout.current = setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
      }, threshold);
    },
    [onLongPress, threshold, onStart]
  );

  const clear = useCallback(
    (event, shouldTriggerOnFinish = true) => {
      timeout.current && clearTimeout(timeout.current);
      shouldTriggerOnFinish && onFinish && onFinish(event);
    },
    [onFinish]
  );

  const cancel = useCallback(
    (event) => {
      clear(event, false);
      setLongPressTriggered(false);
      onCancel && onCancel(event);
    },
    [clear, onCancel]
  );

  return {
    onMouseDown: (e) => start(e),
    onTouchStart: (e) => start(e),
    onMouseUp: (e) => clear(e),
    onMouseLeave: (e) => cancel(e),
    onTouchEnd: (e) => clear(e),
    onTouchCancel: (e) => cancel(e),
    longPressTriggered
  };
};

export default useLongPress;
