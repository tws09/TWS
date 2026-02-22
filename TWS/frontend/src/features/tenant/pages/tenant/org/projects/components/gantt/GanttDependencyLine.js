/**
 * Gantt Dependency Line Component
 * Draws connecting lines between dependent tasks
 */

import React, { useMemo } from 'react';

const GanttDependencyLine = ({
  sourceTask,
  targetTask,
  sourceRowIndex = 0,
  targetRowIndex = 0,
  dependencyType,
  startDate,
  endDate,
  viewType,
  zoomLevel
}) => {
  if (!sourceTask || !targetTask) return null;

  const sourceStart = sourceTask.startDate ? new Date(sourceTask.startDate) : null;
  const sourceEnd = sourceTask.endDate || sourceTask.dueDate ? new Date(sourceTask.endDate || sourceTask.dueDate) : null;
  const targetStart = targetTask.startDate ? new Date(targetTask.startDate) : null;

  const getColumnWidth = () => {
    const baseWidth = viewType === 'daily' ? 60 : viewType === 'weekly' ? 80 : viewType === 'monthly' ? 120 : 150;
    return baseWidth * zoomLevel;
  };

  const getTaskPosition = (task) => {
    const taskStart = task.startDate ? new Date(task.startDate) : null;
    const taskEnd = task.endDate || task.dueDate ? new Date(task.endDate || task.dueDate) : null;
    
    if (!taskStart || !startDate) return { left: 0, width: 0, center: 0 };

    const daysDiff = Math.floor((taskStart - startDate) / (1000 * 60 * 60 * 24));
    const left = daysDiff * (getColumnWidth() / (viewType === 'daily' ? 1 : viewType === 'weekly' ? 7 : viewType === 'monthly' ? 30 : 90));

    let width = 0;
    if (taskEnd) {
      const duration = Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24));
      width = duration * (getColumnWidth() / (viewType === 'daily' ? 1 : viewType === 'weekly' ? 7 : viewType === 'monthly' ? 30 : 90));
    } else {
      width = getColumnWidth();
    }

    return {
      left: Math.max(0, left),
      width: Math.max(getColumnWidth() * 0.5, width),
      center: Math.max(0, left) + (width / 2)
    };
  };

  const sourcePos = getTaskPosition(sourceTask);
  const targetPos = getTaskPosition(targetTask);

  // Calculate line coordinates
  const sourceX = sourcePos.left + (dependencyType === 'finish-to-start' || dependencyType === 'finish-to-finish' ? sourcePos.width : 0);
  const sourceY = 25; // Middle of task row (50px height / 2)
  const targetX = targetPos.left + (dependencyType === 'start-to-start' || dependencyType === 'finish-to-start' ? 0 : targetPos.width);
  const targetY = 25;

  // Calculate row positions
  const rowHeight = 50;
  const sourceYActual = sourceRowIndex * rowHeight + 25;
  const targetYActual = targetRowIndex * rowHeight + 25;

  // Draw arrow line
  const path = `M ${sourceX} ${sourceYActual} L ${targetX} ${targetYActual}`;

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#6B7280" />
        </marker>
      </defs>
      <path
        d={path}
        stroke="#6B7280"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        strokeDasharray={dependencyType === 'relates_to' ? '5,5' : '0'}
      />
    </svg>
  );
};

export default GanttDependencyLine;
