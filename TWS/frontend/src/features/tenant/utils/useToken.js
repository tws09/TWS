/**
 * useToken Hook
 * 
 * Provides access to design tokens for components.
 * This hook abstracts token access and provides fallback chain:
 * component → module → industry → theme
 * 
 * Usage:
 * ```jsx
 * const { token } = useToken();
 * 
 * <button style={{ 
 *   background: token('button-primary-bg'),
 *   color: token('button-primary-text')
 * }}>
 *   Click me
 * </button>
 * ```
 */

import { useTenantTheme } from '../providers/TenantThemeProvider';

export const useToken = () => {
  const { theme } = useTenantTheme();

  /**
   * Get a token value by name
   * @param {string} tokenName - Token name without '--token-' prefix (e.g., 'button-primary-bg')
   * @param {string} fallback - Fallback value if token is not found
   * @returns {string} Token value or fallback
   */
  const token = (tokenName, fallback = null) => {
    if (typeof window === 'undefined') return fallback || '';
    
    const fullTokenName = `--token-${tokenName}`;
    const root = document.documentElement;
    
    // Try to get computed token value
    const computedValue = getComputedStyle(root).getPropertyValue(fullTokenName).trim();
    
    if (computedValue) {
      return computedValue;
    }
    
    // Fallback to theme variable if token doesn't exist
    // This provides backward compatibility during migration
    const themeFallbacks = {
      'button-primary-bg': 'var(--theme-primary)',
      'button-primary-hover': 'var(--theme-primary-600)',
      'button-primary-text': 'white',
      'card-header-bg': 'var(--theme-primary-50)',
      'menu-item-active-bg': 'var(--theme-primary-100)',
      'menu-item-active-text': 'var(--theme-primary-700)',
      'menu-item-icon-bg': 'var(--theme-primary)',
      'gradient-primary': 'linear-gradient(to right, var(--theme-primary), var(--theme-accent))',
    };
    
    if (themeFallbacks[tokenName]) {
      return themeFallbacks[tokenName];
    }
    
    return fallback || '';
  };

  /**
   * Get multiple tokens at once
   * @param {string[]} tokenNames - Array of token names
   * @returns {Object} Object with token names as keys and values as values
   */
  const tokens = (tokenNames) => {
    const result = {};
    tokenNames.forEach(name => {
      result[name] = token(name);
    });
    return result;
  };

  /**
   * Check if a token exists
   * @param {string} tokenName - Token name
   * @returns {boolean} True if token exists
   */
  const hasToken = (tokenName) => {
    if (typeof window === 'undefined') return false;
    const fullTokenName = `--token-${tokenName}`;
    const root = document.documentElement;
    const value = getComputedStyle(root).getPropertyValue(fullTokenName).trim();
    return value !== '';
  };

  return {
    token,
    tokens,
    hasToken,
    theme // Expose theme for backward compatibility
  };
};

export default useToken;
