import React from 'react';

/**
 * TableWrapper Component
 * 
 * Wraps tables to handle horizontal overflow on smaller screens.
 * Provides smooth scrolling and proper spacing.
 * 
 * @param {React.ReactNode} children - Table element(s) to wrap
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 * 
 * @example
 * <TableWrapper>
 *   <table>
 *     <thead>...</thead>
 *     <tbody>...</tbody>
 *   </table>
 * </TableWrapper>
 */
const TableWrapper = ({ children, className = '', style = {} }) => {
  return (
    <div 
      className={`table-wrapper ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default TableWrapper;
