import React from 'react';
import { Typography } from 'antd';

const { Text, Title, Paragraph } = Typography;

// Responsive Typography Components
export const ResponsiveTitle = ({ level = 1, children, ...props }) => {
  const getResponsiveStyle = (level) => {
    const baseSizes = {
      1: '2rem',
      2: '1.5rem', 
      3: '1.25rem',
      4: '1.125rem',
      5: '1rem'
    };
    
    const baseSize = baseSizes[level] || '1rem';
    
    return {
      fontSize: `clamp(${parseFloat(baseSize) * 0.75}rem, 4vw, ${baseSize})`,
      lineHeight: 1.2,
      marginBottom: '0.5rem'
    };
  };

  return (
    <Title 
      level={level} 
      style={getResponsiveStyle(level)}
      {...props}
    >
      {children}
    </Title>
  );
};

export const ResponsiveText = ({ children, type, ...props }) => {
  const getResponsiveStyle = () => ({
    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
    lineHeight: 1.5
  });

  return (
    <Text 
      type={type}
      style={getResponsiveStyle()}
      {...props}
    >
      {children}
    </Text>
  );
};

export const ResponsiveParagraph = ({ children, ...props }) => {
  const getResponsiveStyle = () => ({
    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
    lineHeight: 1.6,
    marginBottom: '1rem'
  });

  return (
    <Paragraph 
      style={getResponsiveStyle()}
      {...props}
    >
      {children}
    </Paragraph>
  );
};

// Responsive Statistic Component
export const ResponsiveStatistic = ({ title, value, suffix, prefix, ...props }) => {
  const getResponsiveStyle = () => ({
    '.ant-statistic-title': {
      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
      marginBottom: '0.25rem'
    },
    '.ant-statistic-content': {
      fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
      fontWeight: 600
    }
  });

  return (
    <div style={getResponsiveStyle()}>
      <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', marginBottom: '0.25rem', color: '#666' }}>
        {title}
      </div>
      <div style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 600, color: '#262626' }}>
        {prefix}{value}{suffix}
      </div>
    </div>
  );
};

// Responsive Card Title
export const ResponsiveCardTitle = ({ children, ...props }) => {
  const getResponsiveStyle = () => ({
    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
    fontWeight: 600,
    marginBottom: '0.5rem'
  });

  return (
    <div style={getResponsiveStyle()} {...props}>
      {children}
    </div>
  );
};

// Responsive Label
export const ResponsiveLabel = ({ children, required = false, ...props }) => {
  const getResponsiveStyle = () => ({
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    fontWeight: 500,
    marginBottom: '0.25rem',
    display: 'block'
  });

  return (
    <label style={getResponsiveStyle()} {...props}>
      {children}
      {required && <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>*</span>}
    </label>
  );
};

export default {
  ResponsiveTitle,
  ResponsiveText,
  ResponsiveParagraph,
  ResponsiveStatistic,
  ResponsiveCardTitle,
  ResponsiveLabel
};
