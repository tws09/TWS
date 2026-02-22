import { useEffect } from 'react';

/**
 * Hook to detect clicks outside of a referenced element
 * 
 * Useful for closing dropdowns, modals, or menus when user clicks outside.
 * Uses capture phase to catch events early and prevent race conditions.
 * 
 * @param {React.RefObject<HTMLElement>} ref - React ref to the element to detect outside clicks for
 * @param {Function} handler - Callback function to execute when outside click detected
 * @param {boolean} enabled - Whether the hook is enabled (default: true)
 * 
 * @example
 * const dropdownRef = useRef(null);
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);
 * 
 * return (
 *   <div ref={dropdownRef}>
 *     Dropdown content
 *   </div>
 * );
 */
export const useClickOutside = (ref, handler, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      
      handler(event);
    };

    // Use capture phase to catch events early and prevent race conditions
    document.addEventListener('mousedown', listener, true);
    document.addEventListener('touchstart', listener, true);

    return () => {
      document.removeEventListener('mousedown', listener, true);
      document.removeEventListener('touchstart', listener, true);
    };
  }, [ref, handler, enabled]);
};
