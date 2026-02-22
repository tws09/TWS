import React from 'react';
import { useResponsiveContent, useResponsiveTypography } from '../../../shared/hooks/useResponsive';

const ResponsiveCard = ({
  children,
  variant = 'default',
  padding = 'default',
  className = '',
  onClick,
  ...props
}) => {
  const { contentDensity, spacing } = useResponsiveContent();

  const baseClasses = `
    rounded-xl
    transition-all duration-200 ease-in-out
    ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
  `;

  const variantClasses = {
    default: `
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      shadow-sm
    `,
    glass: `
      bg-white/80 dark:bg-gray-800/80
      backdrop-blur-sm
      border border-white/20 dark:border-gray-700/50
      shadow-lg
    `,
    elevated: `
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      shadow-lg hover:shadow-xl
    `,
    outlined: `
      bg-transparent
      border-2 border-gray-300 dark:border-gray-600
      hover:border-primary-500 dark:hover:border-primary-400
    `,
    filled: `
      bg-gray-50 dark:bg-gray-700
      border border-gray-200 dark:border-gray-600
    `
  };

  const paddingClasses = {
    none: 'p-0',
    sm: `p-${spacing(2)}`,
    default: `p-${spacing(4)}`,
    lg: `p-${spacing(6)}`,
    xl: `p-${spacing(8)}`
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${className}
  `.trim();

  return (
    <div
      className={combinedClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

const ResponsiveCardHeader = ({
  children,
  className = '',
  ...props
}) => {
  const { spacing } = useResponsiveContent();

  return (
    <div
      className={`border-b border-gray-200 dark:border-gray-700 pb-${spacing(4)} mb-${spacing(4)} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const ResponsiveCardTitle = ({
  children,
  level = 2,
  className = '',
  ...props
}) => {
  const { getFontSize } = useResponsiveTypography();

  const HeadingTag = `h${level}`;
  const sizeClasses = {
    1: getFontSize('2xl'),
    2: getFontSize('xl'),
    3: getFontSize('lg'),
    4: getFontSize('base'),
    5: getFontSize('sm'),
    6: getFontSize('xs')
  };

  return (
    <HeadingTag
      className={`
        font-bold text-gray-900 dark:text-white
        ${sizeClasses[level]}
        ${className}
      `}
      {...props}
    >
      {children}
    </HeadingTag>
  );
};

const ResponsiveCardDescription = ({
  children,
  className = '',
  ...props
}) => {
  const { getFontSize } = useResponsiveTypography();

  return (
    <p
      className={`
        text-gray-600 dark:text-gray-400
        ${getFontSize('sm')}
        ${className}
      `}
      {...props}
    >
      {children}
    </p>
  );
};

const ResponsiveCardContent = ({
  children,
  className = '',
  ...props
}) => {
  const { contentDensity } = useResponsiveContent();

  return (
    <div
      className={`${contentDensity === 'dense' ? 'space-y-2' : 'space-y-4'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const ResponsiveCardFooter = ({
  children,
  className = '',
  ...props
}) => {
  const { spacing } = useResponsiveContent();

  return (
    <div
      className={`border-t border-gray-200 dark:border-gray-700 pt-${spacing(4)} mt-${spacing(4)} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const ResponsiveCardGrid = ({
  children,
  columns = 'auto',
  gap = 'default',
  className = '',
  ...props
}) => {
  const { gridColumns, spacing } = useResponsiveContent();

  const getGridClasses = () => {
    if (columns === 'auto') {
      return `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${gridColumns(3)} xl:grid-cols-${gridColumns(4)}`;
    }
    return `grid-cols-${columns}`;
  };

  const gapClasses = {
    none: 'gap-0',
    sm: `gap-${spacing(2)}`,
    default: `gap-${spacing(4)}`,
    lg: `gap-${spacing(6)}`,
    xl: `gap-${spacing(8)}`
  };

  return (
    <div
      className={`grid ${getGridClasses()} ${gapClasses[gap]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const ResponsiveCardList = ({
  items = [],
  renderItem,
  className = '',
  ...props
}) => {
  const { contentDensity } = useResponsiveContent();

  return (
    <div
      className={`space-y-${contentDensity === 'dense' ? '2' : '4'} ${className}`}
      {...props}
    >
      {items.map((item, index) => (
        <div key={index}>
          {renderItem ? renderItem(item, index) : item}
        </div>
      ))}
    </div>
  );
};

const ResponsiveCardStats = ({
  stats = [],
  className = '',
  ...props
}) => {
  const { getFontSize } = useResponsiveTypography();

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${stats.length} gap-4 ${className}`} {...props}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className={`font-bold text-primary-600 dark:text-primary-400 ${getFontSize('2xl')}`}>
            {stat.value}
          </div>
          <div className={`text-gray-600 dark:text-gray-400 ${getFontSize('sm')}`}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

const ResponsiveCardActions = ({
  children,
  alignment = 'right',
  className = '',
  ...props
}) => {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div
      className={`flex items-center space-x-3 ${alignmentClasses[alignment]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export {
  ResponsiveCard,
  ResponsiveCardHeader,
  ResponsiveCardTitle,
  ResponsiveCardDescription,
  ResponsiveCardContent,
  ResponsiveCardFooter,
  ResponsiveCardGrid,
  ResponsiveCardList,
  ResponsiveCardStats,
  ResponsiveCardActions
};

export default ResponsiveCard;
