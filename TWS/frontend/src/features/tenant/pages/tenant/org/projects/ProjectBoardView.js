/**
 * Project-scoped Board view (Kanban) for the project workspace.
 * Renders ProjectTasks with projectId from URL and board view locked.
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectTasks from './ProjectTasks';

const ProjectBoardView = () => {
  const { projectId } = useParams();
  return (
    <div className="p-4">
      <ProjectTasks
        scopeProjectId={projectId}
        defaultView="kanban"
        hideScopedHeader
      />
    </div>
  );
};

export default ProjectBoardView;
