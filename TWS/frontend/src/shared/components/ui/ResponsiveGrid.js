import React from 'react';
import { useResponsiveContent } from '../../../shared/hooks/useResponsive';

const ResponsiveGrid = ({
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
    if (typeof columns === 'object') {
      const { xs, sm, md, lg, xl } = columns;
      return `
        ${xs ? `grid-cols-${xs}` : 'grid-cols-1'}
        ${sm ? `sm:grid-cols-${sm}` : ''}
        ${md ? `md:grid-cols-${md}` : ''}
        ${lg ? `lg:grid-cols-${lg}` : ''}
        ${xl ? `xl:grid-cols-${xl}` : ''}
      `;
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

const ResponsiveFlex = ({
  children,
  direction = 'row',
  wrap = 'wrap',
  justify = 'start',
  align = 'start',
  gap = 'default',
  className = '',
  ...props
}) => {
  const { spacing } = useResponsiveContent();

  const directionClasses = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    col: 'flex-col',
    'col-reverse': 'flex-col-reverse'
  };

  const wrapClasses = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse'
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
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
      className={`
        flex
        ${directionClasses[direction]}
        ${wrapClasses[wrap]}
        ${justifyClasses[justify]}
        ${alignClasses[align]}
        ${gapClasses[gap]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

const ResponsiveContainer = ({
  children,
  maxWidth = '7xl',
  padding = 'default',
  className = '',
  ...props
}) => {
  const { spacing } = useResponsiveContent();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: 'px-0',
    sm: `px-${spacing(2)}`,
    default: `px-${spacing(4)}`,
    lg: `px-${spacing(6)}`,
    xl: `px-${spacing(8)}`
  };

  return (
    <div
      className={`
        mx-auto
        ${maxWidthClasses[maxWidth]}
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

const ResponsiveStack = ({
  children,
  direction = 'vertical',
  spacing = 'default',
  className = '',
  ...props
}) => {
  const { spacing: spacingFn } = useResponsiveContent();

  const directionClasses = {
    vertical: 'flex-col',
    horizontal: 'flex-row'
  };

  const spacingClasses = {
    none: 'space-y-0',
    sm: `space-y-${spacingFn(2)}`,
    default: `space-y-${spacingFn(4)}`,
    lg: `space-y-${spacingFn(6)}`,
    xl: `space-y-${spacingFn(8)}`
  };

  const horizontalSpacingClasses = {
    none: 'space-x-0',
    sm: `space-x-${spacingFn(2)}`,
    default: `space-x-${spacingFn(4)}`,
    lg: `space-x-${spacingFn(6)}`,
    xl: `space-x-${spacingFn(8)}`
  };

  return (
    <div
      className={`
        flex
        ${directionClasses[direction]}
        ${direction === 'vertical' ? spacingClasses[spacing] : horizontalSpacingClasses[spacing]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

const ResponsiveColumns = ({
  children,
  columns = 2,
  gap = 'default',
  className = '',
  ...props
}) => {
  const { spacing } = useResponsiveContent();

  const getColumnsClasses = () => {
    if (typeof columns === 'object') {
      const { xs, sm, md, lg, xl } = columns;
      return `
        ${xs ? `columns-${xs}` : 'columns-1'}
        ${sm ? `sm:columns-${sm}` : ''}
        ${md ? `md:columns-${md}` : ''}
        ${lg ? `lg:columns-${lg}` : ''}
        ${xl ? `xl:columns-${xl}` : ''}
      `;
    }
    return `columns-${columns}`;
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
      className={`
        ${getColumnsClasses()}
        ${gapClasses[gap]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

const ResponsiveMasonry = ({
  children,
  columns = 'auto',
  gap = 'default',
  className = '',
  ...props
}) => {
  const { gridColumns, spacing } = useResponsiveContent();

  const getMasonryClasses = () => {
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
      className={`
        grid
        ${getMasonryClasses()}
        ${gapClasses[gap]}
        auto-rows-max
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

const ResponsiveAspectRatio = ({
  children,
  ratio = '16/9',
  className = '',
  ...props
}) => {
  const ratioClasses = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
    '16/9': 'aspect-video',
    '21/9': 'aspect-[21/9]'
  };

  return (
    <div
      className={`
        relative
        ${ratioClasses[ratio]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

const ResponsiveBreakpoint = ({
  children,
  show = 'all',
  hide = 'none',
  className = '',
  ...props
}) => {
  const getVisibilityClasses = () => {
    const classes = [];
    
    if (show !== 'all') {
      if (show.includes('xs')) classes.push('block');
      if (show.includes('sm')) classes.push('sm:block');
      if (show.includes('md')) classes.push('md:block');
      if (show.includes('lg')) classes.push('lg:block');
      if (show.includes('xl')) classes.push('xl:block');
      if (show.includes('2xl')) classes.push('2xl:block');
    }
    
    if (hide !== 'none') {
      if (hide.includes('xs')) classes.push('hidden');
      if (hide.includes('sm')) classes.push('sm:hidden');
      if (hide.includes('md')) classes.push('md:hidden');
      if (hide.includes('lg')) classes.push('lg:hidden');
      if (hide.includes('xl')) classes.push('xl:hidden');
      if (hide.includes('2xl')) classes.push('2xl:hidden');
    }
    
    return classes.join(' ');
  };

  return (
    <div
      className={`
        ${getVisibilityClasses()}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export {
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveContainer,
  ResponsiveStack,
  ResponsiveColumns,
  ResponsiveMasonry,
  ResponsiveAspectRatio,
  ResponsiveBreakpoint
};

export default ResponsiveGrid;
