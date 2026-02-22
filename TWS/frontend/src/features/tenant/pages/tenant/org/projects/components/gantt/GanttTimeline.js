/**
 * Gantt Timeline Component
 * Displays the timeline header with dates
 */

import React, { useMemo } from 'react';

const GanttTimeline = ({ startDate, endDate, viewType, zoomLevel }) => {
  const dates = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      dates.push(new Date(current));
      
      switch (viewType) {
        case 'daily':
          current.setDate(current.getDate() + 1);
          break;
        case 'weekly':
          current.setDate(current.getDate() + 7);
          break;
        case 'monthly':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'quarterly':
          current.setMonth(current.getMonth() + 3);
          break;
        default:
          current.setDate(current.getDate() + 7);
      }
    }
    
    return dates;
  }, [startDate, endDate, viewType]);

  const getDateLabel = (date) => {
    switch (viewType) {
      case 'daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        const weekStart = new Date(date);
        const weekEnd = new Date(date);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.getDate()}-${weekEnd.getDate()} ${weekStart.toLocaleDateString('en-US', { month: 'short' })}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      default:
        return date.toLocaleDateString();
    }
  };

  const getColumnWidth = () => {
    const baseWidth = viewType === 'daily' ? 60 : viewType === 'weekly' ? 80 : viewType === 'monthly' ? 120 : 150;
    return baseWidth * zoomLevel;
  };

  return (
    <div className="gantt-timeline sticky top-0 z-10 bg-white border-b border-gray-300">
      <div className="flex" style={{ width: `${dates.length * getColumnWidth()}px` }}>
        {dates.map((date, index) => (
          <div
            key={index}
            className="border-r border-gray-300 px-2 py-2 text-xs font-medium text-gray-700"
            style={{ width: `${getColumnWidth()}px`, minWidth: `${getColumnWidth()}px` }}
          >
            {getDateLabel(date)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GanttTimeline;
