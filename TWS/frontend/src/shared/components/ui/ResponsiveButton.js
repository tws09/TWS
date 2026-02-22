import React from 'react';
import { useResponsiveTouch } from '../../../shared/hooks/useResponsive';
import { LoadingSpinner } from './Loading/UnifiedLoading';

const ResponsiveButton = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const { touchTargetSize, touchPadding, isTouchDevice } = useResponsiveTouch();

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${touchTargetSize}
    ${isTouchDevice ? touchPadding : 'px-4 py-2'}
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-primary-600 to-primary-700
      text-white
      hover:from-primary-700 hover:to-primary-800
      focus:ring-primary-500
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-gradient-to-r from-secondary-600 to-secondary-700
      text-white
      hover:from-secondary-700 hover:to-secondary-800
      focus:ring-secondary-500
      shadow-sm hover:shadow-md
    `,
    accent: `
      bg-gradient-to-r from-accent-600 to-accent-700
      text-white
      hover:from-accent-700 hover:to-accent-800
      focus:ring-accent-500
      shadow-sm hover:shadow-md
    `,
    outline: `
      border-2 border-primary-600
      text-primary-600
      hover:bg-primary-50 dark:hover:bg-primary-900/20
      focus:ring-primary-500
      bg-transparent
    `,
    ghost: `
      text-primary-600
      hover:bg-primary-50 dark:hover:bg-primary-900/20
      focus:ring-primary-500
      bg-transparent
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700
      text-white
      hover:from-red-700 hover:to-red-800
      focus:ring-red-500
      shadow-sm hover:shadow-md
    `,
    success: `
      bg-gradient-to-r from-green-600 to-green-700
      text-white
      hover:from-green-700 hover:to-green-800
      focus:ring-green-500
      shadow-sm hover:shadow-md
    `,
    warning: `
      bg-gradient-to-r from-yellow-600 to-yellow-700
      text-white
      hover:from-yellow-700 hover:to-yellow-800
      focus:ring-yellow-500
      shadow-sm hover:shadow-md
    `,
    info: `
      bg-gradient-to-r from-blue-600 to-blue-700
      text-white
      hover:from-blue-700 hover:to-blue-800
      focus:ring-blue-500
      shadow-sm hover:shadow-md
    `
  };

  const sizeClasses = {
    xs: isTouchDevice ? 'text-xs px-3 py-2' : 'text-xs px-2 py-1',
    sm: isTouchDevice ? 'text-sm px-4 py-2' : 'text-sm px-3 py-1.5',
    md: isTouchDevice ? 'text-sm px-6 py-3' : 'text-sm px-4 py-2',
    lg: isTouchDevice ? 'text-base px-8 py-4' : 'text-base px-6 py-3',
    xl: isTouchDevice ? 'text-lg px-10 py-5' : 'text-lg px-8 py-4'
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" variant="white" className="mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

// Icon Button variant for compact spaces
export const ResponsiveIconButton = ({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  'aria-label': ariaLabel,
  ...props
}) => {
  const { touchTargetSize, isTouchDevice } = useResponsiveTouch();

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${touchTargetSize}
    ${isTouchDevice ? 'p-3' : 'p-2'}
  `;

  const variantClasses = {
    primary: `
      bg-primary-600 text-white
      hover:bg-primary-700
      focus:ring-primary-500
    `,
    secondary: `
      bg-secondary-600 text-white
      hover:bg-secondary-700
      focus:ring-secondary-500
    `,
    accent: `
      bg-accent-600 text-white
      hover:bg-accent-700
      focus:ring-accent-500
    `,
    outline: `
      border border-primary-600 text-primary-600
      hover:bg-primary-50 dark:hover:bg-primary-900/20
      focus:ring-primary-500
    `,
    ghost: `
      text-gray-600 dark:text-gray-400
      hover:bg-gray-100 dark:hover:bg-gray-800
      focus:ring-gray-500
    `,
    danger: `
      bg-red-600 text-white
      hover:bg-red-700
      focus:ring-red-500
    `
  };

  const sizeClasses = {
    xs: isTouchDevice ? 'w-8 h-8' : 'w-6 h-6',
    sm: isTouchDevice ? 'w-10 h-10' : 'w-8 h-8',
    md: isTouchDevice ? 'w-12 h-12' : 'w-10 h-10',
    lg: isTouchDevice ? 'w-14 h-14' : 'w-12 h-12',
    xl: isTouchDevice ? 'w-16 h-16' : 'w-14 h-14'
  };

  const iconSizes = {
    xs: isTouchDevice ? 'w-4 h-4' : 'w-3 h-3',
    sm: isTouchDevice ? 'w-5 h-5' : 'w-4 h-4',
    md: isTouchDevice ? 'w-6 h-6' : 'w-5 h-5',
    lg: isTouchDevice ? 'w-7 h-7' : 'w-6 h-6',
    xl: isTouchDevice ? 'w-8 h-8' : 'w-7 h-7'
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" variant="white" />
      ) : (
        <Icon className={iconSizes[size]} />
      )}
    </button>
  );
};

// Floating Action Button for mobile
export const ResponsiveFAB = ({
  icon: Icon,
  variant = 'primary',
  size = 'md',
  position = 'bottom-right',
  className = '',
  onClick,
  'aria-label': ariaLabel,
  ...props
}) => {
  const { isTouchDevice } = useResponsiveTouch();

  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };

  const sizeClasses = {
    sm: isTouchDevice ? 'w-14 h-14' : 'w-12 h-12',
    md: isTouchDevice ? 'w-16 h-16' : 'w-14 h-14',
    lg: isTouchDevice ? 'w-20 h-20' : 'w-16 h-16'
  };

  const iconSizes = {
    sm: isTouchDevice ? 'w-6 h-6' : 'w-5 h-5',
    md: isTouchDevice ? 'w-7 h-7' : 'w-6 h-6',
    lg: isTouchDevice ? 'w-8 h-8' : 'w-7 h-7'
  };

  const baseClasses = `
    ${positionClasses[position]}
    ${sizeClasses[size]}
    inline-flex items-center justify-center
    bg-gradient-to-r from-primary-600 to-primary-700
    text-white
    rounded-full
    shadow-lg hover:shadow-xl
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    z-50
    ${className}
  `;

  return (
    <button
      className={baseClasses}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
};

export default ResponsiveButton;
