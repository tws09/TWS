/**
 * Empty State Components for Tenant Projects
 * Provides consistent empty states across the project management system
 */

import React from 'react';
import {
  FolderIcon,
  ClipboardDocumentListIcon,
  FlagIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const EmptyState = ({ 
  icon: Icon = FolderIcon,
  title, 
  description, 
  actionLabel,
  onAction,
  variant = 'default'
}) => {
  const variants = {
    default: {
      icon: 'text-gray-400 dark:text-gray-600',
      bg: 'bg-gray-100 dark:bg-gray-800'
    },
    primary: {
      icon: 'text-primary-400 dark:text-primary-600',
      bg: 'bg-primary-100 dark:bg-primary-900/30'
    },
    warning: {
      icon: 'text-yellow-400 dark:text-yellow-600',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30'
    }
  };

  const style = variants[variant] || variants.default;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className={`${style.bg} rounded-full p-6 mb-4`}>
        <Icon className={`h-12 w-12 ${style.icon}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="glass-button px-4 py-2 rounded-xl hover-scale bg-gradient-to-r from-primary-500 to-accent-500 text-white"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const EmptyProjects = ({ onCreateProject }) => (
  <EmptyState
    icon={FolderIcon}
    title="No Projects Yet"
    description="Get started by creating your first project. Track progress, manage resources, and deliver results."
    actionLabel="Create Your First Project"
    onAction={onCreateProject}
    variant="primary"
  />
);

export const EmptyTasks = ({ onCreateTask }) => (
  <EmptyState
    icon={ClipboardDocumentListIcon}
    title="No Tasks Found"
    description="Create tasks to organize your work and track progress through your workflow."
    actionLabel="Create New Task"
    onAction={onCreateTask}
    variant="primary"
  />
);

export const EmptyMilestones = ({ onCreateMilestone }) => (
  <EmptyState
    icon={FlagIcon}
    title="No Milestones Yet"
    description="Set milestones to track major project achievements and deadlines."
    actionLabel="Create Milestone"
    onAction={onCreateMilestone}
    variant="primary"
  />
);

export const EmptyResources = () => (
  <EmptyState
    icon={UsersIcon}
    title="No Resources Available"
    description="Resources will appear here once they are added to projects."
    variant="default"
  />
);

export const EmptyTimesheets = ({ onCreateEntry }) => (
  <EmptyState
    icon={ClockIcon}
    title="No Time Entries"
    description="Start tracking your time to see detailed reports and analytics."
    actionLabel="Log Time"
    onAction={onCreateEntry}
    variant="primary"
  />
);

export const EmptySprints = ({ onCreateSprint }) => (
  <EmptyState
    icon={CalendarIcon}
    title="No Sprints Created"
    description="Create sprints to organize your work in agile iterations."
    actionLabel="Create Sprint"
    onAction={onCreateSprint}
    variant="primary"
  />
);

export const EmptySearchResults = ({ searchTerm }) => (
  <EmptyState
    icon={FolderIcon}
    title="No Results Found"
    description={`No projects match "${searchTerm}". Try adjusting your search criteria.`}
    variant="warning"
  />
);

export default EmptyState;

