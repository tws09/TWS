/**
 * Gantt Chart Header Component
 * Controls for zoom, filters, and view options
 */

import React from 'react';
import {
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  FunnelIcon,
  UserGroupIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

const GanttChartHeader = ({
  viewType,
  zoomLevel,
  onViewTypeChange,
  onZoomChange,
  settings,
  onSettingsChange,
  onFilterChange,
  filters = {}
}) => {
  const viewTypes = [
    { value: 'daily', label: 'Day' },
    { value: 'weekly', label: 'Week' },
    { value: 'monthly', label: 'Month' },
    { value: 'quarterly', label: 'Quarter' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'planning', label: 'Planning' },
    { value: 'design', label: 'Design' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'integration', label: 'Integration' },
    { value: 'testing', label: 'Testing' },
    { value: 'deployment', label: 'Deployment' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'optimization', label: 'Optimization' }
  ];

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoomLevel + 0.25, 3));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoomLevel - 0.25, 0.5));
  };

  return (
    <div className="gantt-header border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Gantt Chart</h3>
        
        {/* View Type Selector */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <select
            value={viewType}
            onChange={(e) => onViewTypeChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {viewTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-gray-200 rounded"
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-gray-200 rounded"
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 border-l border-gray-300 pl-4">
        <FunnelIcon className="h-5 w-5 text-gray-500" />
        <select
          value={filters.category || 'all'}
          onChange={(e) => onFilterChange && onFilterChange({ ...filters, category: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <select
          value={filters.sprint || 'all'}
          onChange={(e) => onFilterChange && onFilterChange({ ...filters, sprint: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Sprints</option>
          <option value="Sprint 1">Sprint 1</option>
          <option value="Sprint 2">Sprint 2</option>
        </select>
      </div>

      {/* Settings Toggle */}
      <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.showCriticalPath}
            onChange={(e) => onSettingsChange({ ...settings, showCriticalPath: e.target.checked })}
            className="rounded"
          />
          Critical Path
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.showDependencies}
            onChange={(e) => onSettingsChange({ ...settings, showDependencies: e.target.checked })}
            className="rounded"
          />
          Dependencies
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.showProgressIndicator}
            onChange={(e) => onSettingsChange({ ...settings, showProgressIndicator: e.target.checked })}
            className="rounded"
          />
          Progress
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.showResourceAllocation}
            onChange={(e) => onSettingsChange({ ...settings, showResourceAllocation: e.target.checked })}
            className="rounded"
          />
          Resources
        </label>
      </div>
    </div>
  );
};

export default GanttChartHeader;
