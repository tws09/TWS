/**
 * Project Gantt Chart Page
 * Main page component for Gantt chart view
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import GanttChart from './components/gantt/GanttChart';
import ErrorBoundary from './components/ErrorBoundary';

const ProjectGantt = () => {
  const { projectId } = useParams();

  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <GanttChart projectId={projectId} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProjectGantt;
