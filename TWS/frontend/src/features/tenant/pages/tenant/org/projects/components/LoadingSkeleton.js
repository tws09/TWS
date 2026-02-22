/**
 * Loading Skeleton Components for Tenant Projects
 * Provides skeleton loaders for various components
 */

import React from 'react';

export const ProjectCardSkeleton = () => {
  return (
    <div className="glass-card-premium p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6 mt-2"></div>
        </div>
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-20"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
    </div>
  );
};

export const TaskCardSkeleton = () => {
  return (
    <div className="glass-card p-4 mb-3 animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full mb-3"></div>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
      </div>
    </div>
  );
};

export const MetricCardSkeleton = () => {
  return (
    <div className="glass-card-premium p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      </div>
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
    </div>
  );
};

export const TableRowSkeleton = () => {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-28"></div>
      </td>
    </tr>
  );
};

export const KanbanColumnSkeleton = () => {
  return (
    <div className="flex-shrink-0 w-72">
      <div className="glass-card p-4 animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      </div>
    </div>
  );
};

export const PageSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xl w-32"></div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-premium p-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-40 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
        <div className="glass-card-premium p-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-40 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  ProjectCardSkeleton,
  TaskCardSkeleton,
  MetricCardSkeleton,
  TableRowSkeleton,
  KanbanColumnSkeleton,
  PageSkeleton
};

