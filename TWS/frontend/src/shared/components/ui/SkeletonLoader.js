import React from 'react';

const SkeletonLoader = ({ width = '100%', height = '20px', className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-300 dark:bg-gray-600 rounded ${className}`}
      style={{ width, height }}
    />
  );
};

// Table skeleton component for loading states
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader
              key={colIndex}
              width={colIndex === 0 ? '200px' : '150px'}
              height="40px"
              className="flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
