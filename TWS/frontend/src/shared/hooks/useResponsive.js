import { useState, useEffect, useCallback } from 'react';

// Custom hook for responsive behavior
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const [breakpoint, setBreakpoint] = useState('lg');

  const breakpoints = {
    xs: 475,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
    '3xl': 1920,
    '4xl': 2560,
  };

  const updateScreenSize = useCallback(() => {
    setScreenSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Determine current breakpoint
    const width = window.innerWidth;
    if (width >= breakpoints['4xl']) {
      setBreakpoint('4xl');
    } else if (width >= breakpoints['3xl']) {
      setBreakpoint('3xl');
    } else if (width >= breakpoints['2xl']) {
      setBreakpoint('2xl');
    } else if (width >= breakpoints.xl) {
      setBreakpoint('xl');
    } else if (width >= breakpoints.lg) {
      setBreakpoint('lg');
    } else if (width >= breakpoints.md) {
      setBreakpoint('md');
    } else if (width >= breakpoints.sm) {
      setBreakpoint('sm');
    } else {
      setBreakpoint('xs');
    }
  }, []);

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [updateScreenSize]);

  return {
    screenSize,
    breakpoint,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isLargeDesktop: breakpoint === '3xl' || breakpoint === '4xl',
    isSmallScreen: breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md',
    isLargeScreen: breakpoint === 'xl' || breakpoint === '2xl' || breakpoint === '3xl' || breakpoint === '4xl',
  };
};

// Hook for responsive sidebar behavior
export const useResponsiveSidebar = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  }, [isMobile, isTablet, sidebarOpen, sidebarCollapsed]);

  const closeSidebar = useCallback(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [isMobile, isTablet]);

  // Auto-close mobile sidebar when screen becomes desktop
  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  return {
    sidebarOpen,
    sidebarCollapsed,
    setSidebarOpen,
    setSidebarCollapsed,
    toggleSidebar,
    closeSidebar,
    isMobileSidebar: isMobile || isTablet,
    isDesktopSidebar: isDesktop,
  };
};

// Hook for responsive content density
export const useResponsiveContent = () => {
  const { breakpoint } = useResponsive();

  const getContentDensity = useCallback(() => {
    switch (breakpoint) {
      case 'xs':
      case 'sm':
        return 'dense';
      case 'md':
        return 'compact';
      case 'lg':
      case 'xl':
        return 'comfortable';
      case '2xl':
      case '3xl':
      case '4xl':
        return 'spacious';
      default:
        return 'comfortable';
    }
  }, [breakpoint]);

  const getSpacing = useCallback((base = 4) => {
    switch (breakpoint) {
      case 'xs':
      case 'sm':
        return base * 0.5;
      case 'md':
        return base * 0.75;
      case 'lg':
      case 'xl':
        return base;
      case '2xl':
      case '3xl':
      case '4xl':
        return base * 1.25;
      default:
        return base;
    }
  }, [breakpoint]);

  const getGridColumns = useCallback((base = 1) => {
    switch (breakpoint) {
      case 'xs':
        return 1;
      case 'sm':
        return Math.min(2, base);
      case 'md':
        return Math.min(3, base);
      case 'lg':
        return Math.min(4, base);
      case 'xl':
        return Math.min(6, base);
      case '2xl':
      case '3xl':
      case '4xl':
        return Math.min(8, base);
      default:
        return base;
    }
  }, [breakpoint]);

  return {
    contentDensity: getContentDensity(),
    spacing: getSpacing,
    gridColumns: getGridColumns,
    breakpoint,
  };
};

// Hook for responsive typography
export const useResponsiveTypography = () => {
  const { breakpoint } = useResponsive();

  const getFontSize = useCallback((base = 'base') => {
    const sizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    };

    const responsiveSizes = {
      xs: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
        '2xl': 'text-xl',
        '3xl': 'text-2xl',
        '4xl': 'text-3xl',
      },
      sm: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
      },
      md: {
        xs: 'text-sm',
        sm: 'text-base',
        base: 'text-lg',
        lg: 'text-xl',
        xl: 'text-2xl',
        '2xl': 'text-3xl',
        '3xl': 'text-4xl',
        '4xl': 'text-5xl',
      },
      lg: {
        xs: 'text-sm',
        sm: 'text-base',
        base: 'text-lg',
        lg: 'text-xl',
        xl: 'text-2xl',
        '2xl': 'text-3xl',
        '3xl': 'text-4xl',
        '4xl': 'text-5xl',
      },
      xl: {
        xs: 'text-base',
        sm: 'text-lg',
        base: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-3xl',
        '2xl': 'text-4xl',
        '3xl': 'text-5xl',
        '4xl': 'text-6xl',
      },
      '2xl': {
        xs: 'text-base',
        sm: 'text-lg',
        base: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-3xl',
        '2xl': 'text-4xl',
        '3xl': 'text-5xl',
        '4xl': 'text-6xl',
      },
      '3xl': {
        xs: 'text-lg',
        sm: 'text-xl',
        base: 'text-2xl',
        lg: 'text-3xl',
        xl: 'text-4xl',
        '2xl': 'text-5xl',
        '3xl': 'text-6xl',
        '4xl': 'text-7xl',
      },
      '4xl': {
        xs: 'text-lg',
        sm: 'text-xl',
        base: 'text-2xl',
        lg: 'text-3xl',
        xl: 'text-4xl',
        '2xl': 'text-5xl',
        '3xl': 'text-6xl',
        '4xl': 'text-7xl',
      },
    };

    return responsiveSizes[breakpoint]?.[base] || sizes[base];
  }, [breakpoint]);

  return {
    getFontSize,
    breakpoint,
  };
};

// Hook for responsive touch targets
export const useResponsiveTouch = () => {
  const { isMobile, isTablet } = useResponsive();

  const getTouchTargetSize = useCallback(() => {
    if (isMobile) {
      return 'min-h-[44px] min-w-[44px]';
    } else if (isTablet) {
      return 'min-h-[40px] min-w-[40px]';
    } else {
      return 'min-h-[36px] min-w-[36px]';
    }
  }, [isMobile, isTablet]);

  const getTouchPadding = useCallback(() => {
    if (isMobile) {
      return 'p-3';
    } else if (isTablet) {
      return 'p-2.5';
    } else {
      return 'p-2';
    }
  }, [isMobile, isTablet]);

  return {
    touchTargetSize: getTouchTargetSize(),
    touchPadding: getTouchPadding(),
    isTouchDevice: isMobile || isTablet,
  };
};

export default useResponsive;