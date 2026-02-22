import { useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../app/providers/ThemeContext';

const useKeyboardShortcuts = ({
  onSearch,
  onShortcuts,
  onSendMessage,
  onNewLine,
  onBold,
  onItalic,
  onInlineCode,
  onCodeBlock,
  onLink,
  onMention,
  onNavigateUp,
  onNavigateDown,
  onScrollUp,
  onScrollDown,
  onGoToTop,
  onGoToBottom,
  onNavigateChats,
  onClose,
  enabled = true
}) => {
  const { toggleTheme } = useTheme();
  const shortcutsRef = useRef(new Map());

  // Register a shortcut
  const registerShortcut = useCallback((key, handler, options = {}) => {
    const { preventDefault = true, stopPropagation = false } = options;
    
    shortcutsRef.current.set(key, {
      handler,
      preventDefault,
      stopPropagation
    });
  }, []);

  // Unregister a shortcut
  const unregisterShortcut = useCallback((key) => {
    shortcutsRef.current.delete(key);
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    const key = getKeyString(event);
    const shortcut = shortcutsRef.current.get(key);

    if (shortcut) {
      if (shortcut.preventDefault) {
        event.preventDefault();
      }
      if (shortcut.stopPropagation) {
        event.stopPropagation();
      }
      shortcut.handler(event);
    }
  }, [enabled]);

  // Get key string from event
  const getKeyString = (event) => {
    const keys = [];
    
    if (event.ctrlKey) keys.push('Ctrl');
    if (event.shiftKey) keys.push('Shift');
    if (event.altKey) keys.push('Alt');
    if (event.metaKey) keys.push('Meta');
    
    // Handle special keys
    if (event.key === ' ') {
      keys.push('Space');
    } else if (event.key === 'ArrowUp') {
      keys.push('↑');
    } else if (event.key === 'ArrowDown') {
      keys.push('↓');
    } else if (event.key === 'ArrowLeft') {
      keys.push('←');
    } else if (event.key === 'ArrowRight') {
      keys.push('→');
    } else if (event.key === 'Enter') {
      keys.push('Enter');
    } else if (event.key === 'Escape') {
      keys.push('Esc');
    } else if (event.key === 'Tab') {
      keys.push('Tab');
    } else if (event.key === 'Backspace') {
      keys.push('Backspace');
    } else if (event.key === 'Delete') {
      keys.push('Delete');
    } else if (event.key === 'Home') {
      keys.push('Home');
    } else if (event.key === 'End') {
      keys.push('End');
    } else if (event.key === 'PageUp') {
      keys.push('Page Up');
    } else if (event.key === 'PageDown') {
      keys.push('Page Down');
    } else if (event.key.length === 1) {
      // Single character keys
      keys.push(event.key.toUpperCase());
    } else {
      keys.push(event.key);
    }
    
    return keys.join(' + ');
  };

  // Register default shortcuts
  useEffect(() => {
    if (!enabled) return;

    // General shortcuts
    registerShortcut('Ctrl + K', onSearch);
    registerShortcut('Ctrl + /', onShortcuts);
    registerShortcut('Ctrl + D', toggleTheme);
    registerShortcut('Esc', onClose);

    // Messaging shortcuts
    if (onSendMessage) {
      registerShortcut('Enter', onSendMessage, { preventDefault: false });
    }
    if (onNewLine) {
      registerShortcut('Shift + Enter', onNewLine);
    }
    if (onBold) {
      registerShortcut('Ctrl + B', onBold);
    }
    if (onItalic) {
      registerShortcut('Ctrl + I', onItalic);
    }
    if (onInlineCode) {
      registerShortcut('Ctrl + `', onInlineCode);
    }
    if (onCodeBlock) {
      registerShortcut('Ctrl + Shift + `', onCodeBlock);
    }
    if (onLink) {
      registerShortcut('Ctrl + K', onLink);
    }
    if (onMention) {
      registerShortcut('@', onMention, { preventDefault: false });
    }

    // Navigation shortcuts
    if (onNavigateUp) {
      registerShortcut('↑', onNavigateUp, { preventDefault: false });
    }
    if (onNavigateDown) {
      registerShortcut('↓', onNavigateDown, { preventDefault: false });
    }
    if (onScrollUp) {
      registerShortcut('Page Up', onScrollUp, { preventDefault: false });
    }
    if (onScrollDown) {
      registerShortcut('Page Down', onScrollDown, { preventDefault: false });
    }
    if (onGoToTop) {
      registerShortcut('Home', onGoToTop, { preventDefault: false });
    }
    if (onGoToBottom) {
      registerShortcut('End', onGoToBottom, { preventDefault: false });
    }
    if (onNavigateChats) {
      registerShortcut('Ctrl + ↑', () => onNavigateChats('up'));
      registerShortcut('Ctrl + ↓', () => onNavigateChats('down'));
    }

    // Search shortcuts
    registerShortcut('Ctrl + F', onSearch);
    registerShortcut('Ctrl + Shift + F', onSearch);

    return () => {
      shortcutsRef.current.clear();
    };
  }, [
    enabled,
    registerShortcut,
    onSearch,
    onShortcuts,
    toggleTheme,
    onClose,
    onSendMessage,
    onNewLine,
    onBold,
    onItalic,
    onInlineCode,
    onCodeBlock,
    onLink,
    onMention,
    onNavigateUp,
    onNavigateDown,
    onScrollUp,
    onScrollDown,
    onGoToTop,
    onGoToBottom,
    onNavigateChats
  ]);

  // Add event listener
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    registerShortcut,
    unregisterShortcut,
    getKeyString
  };
};

export default useKeyboardShortcuts;
