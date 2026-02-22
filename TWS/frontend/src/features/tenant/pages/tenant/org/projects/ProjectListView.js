/**
 * Project-scoped List view for the project workspace.
 * Renders ProjectTasks with projectId from URL and list view locked.
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectTasks from './ProjectTasks';

const ProjectListView = () => {
  const { projectId } = useParams();
  return (
    <div className="p-4">
      <ProjectTasks
        scopeProjectId={projectId}
        defaultView="list"
        hideScopedHeader
      />
    </div>
  );
};

export default ProjectListView;
