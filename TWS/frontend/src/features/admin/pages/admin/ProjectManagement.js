import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../app/providers/AuthContext';
import { 
  ChartBarIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  FlagIcon,
  UsersIcon,
  ClockIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PlusIcon,
  ArrowRightIcon,
  EyeIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon as ClockIconSolid,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ProjectManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data for dashboard metrics
  const dashboardStats = {
    totalProjects: 24,
    activeProjects: 18,
    completedProjects: 6,
    overdueProjects: 3,
    totalTasks: 156,
    completedTasks: 98,
    inProgressTasks: 42,
    overdueTasks: 16,
    totalTeamMembers: 12,
    availableMembers: 4,
    totalHours: 1240,
    hoursThisWeek: 320
  };

  const recentProjects = [
    {
      id: 1,
      name: 'E-Commerce Platform',
      status: 'in_progress',
      progress: 75,
      dueDate: '2025-10-30',
      team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      priority: 'high'
    },
    {
      id: 2,
      name: 'Mobile Banking App',
      status: 'planning',
      progress: 25,
      dueDate: '2025-11-15',
      team: ['Sarah Wilson', 'David Brown'],
      priority: 'medium'
    },
    {
      id: 3,
      name: 'CRM System',
      status: 'review',
      progress: 90,
      dueDate: '2025-10-20',
      team: ['Emily Davis', 'Alex Garcia'],
      priority: 'high'
    }
  ];

  const quickActions = [
    {
      id: 'create-project',
      title: 'Create New Project',
      description: 'Start a new project from scratch or template',
      icon: PlusIcon,
      color: 'from-blue-500 to-indigo-600',
      action: () => navigate('/projects/create')
    },
    {
      id: 'add-task',
      title: 'Add Task',
      description: 'Create a new task for any project',
      icon: ClipboardDocumentListIcon,
      color: 'from-green-500 to-emerald-600',
      action: () => navigate('/projects/tasks')
    },
    {
      id: 'log-time',
      title: 'Log Time',
      description: 'Record time spent on tasks',
      icon: ClockIconSolid,
      color: 'from-purple-500 to-pink-600',
      action: () => navigate('/projects/timesheets')
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Access project analytics and reports',
      icon: ChartBarIcon,
      color: 'from-orange-500 to-red-600',
      action: () => navigate('/reports/projects')
    }
  ];

  const navigationCards = [
    {
      id: 'overview',
      title: 'Project Overview',
      description: 'High-level dashboard with key metrics and KPIs',
      icon: ChartBarIcon,
      color: 'from-blue-500 to-indigo-600',
      path: '/projects',
      stats: `${dashboardStats.totalProjects} Projects`
    },
    {
      id: 'my-projects',
      title: 'My Projects',
      description: 'View and manage your assigned projects',
      icon: FolderIcon,
      color: 'from-purple-500 to-pink-600',
      path: '/projects/my',
      stats: `${dashboardStats.activeProjects} Active`
    },
    {
      id: 'tasks',
      title: 'Task Board',
      description: 'Kanban-style task management with drag & drop',
      icon: ClipboardDocumentListIcon,
      color: 'from-green-500 to-emerald-600',
      path: '/projects/tasks',
      stats: `${dashboardStats.totalTasks} Tasks`
    },
    {
      id: 'milestones',
      title: 'Milestones',
      description: 'Track project milestones and dependencies',
      icon: FlagIcon,
      color: 'from-yellow-500 to-orange-600',
      path: '/projects/milestones',
      stats: '32 Milestones'
    },
    {
      id: 'resources',
      title: 'Resources',
      description: 'Manage team members and workload allocation',
      icon: UsersIcon,
      color: 'from-cyan-500 to-blue-600',
      path: '/projects/resources',
      stats: `${dashboardStats.totalTeamMembers} Members`
    },
    {
      id: 'timesheets',
      title: 'Timesheets',
      description: 'Time tracking and attendance management',
      icon: ClockIcon,
      color: 'from-red-500 to-rose-600',
      path: '/projects/timesheets',
      stats: `${dashboardStats.totalHours} Hours`
    },
    {
      id: 'workspaces',
      title: 'Workspaces',
      description: 'Organize projects by client, department, or team',
      icon: BuildingOfficeIcon,
      color: 'from-teal-500 to-cyan-600',
      path: '/projects/workspaces',
      stats: '4 Workspaces'
    },
    {
      id: 'templates',
      title: 'Templates',
      description: 'Pre-built project and task templates',
      icon: DocumentTextIcon,
      color: 'from-indigo-500 to-purple-600',
      path: '/projects/templates',
      stats: '6 Templates'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'planning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'review': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card-premium p-6 hover-glow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white tracking-tight">
              Project Management Hub
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
              Central dashboard for all project management activities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 glass-card rounded-xl">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Current User</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.fullName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card-premium p-6 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalProjects}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                <ArrowTrendingUpIcon className="w-3 h-3 inline mr-1" />
                +12% this month
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FolderIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card-premium p-6 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.inProgressTasks}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {dashboardStats.overdueTasks} overdue
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card-premium p-6 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalTeamMembers}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {dashboardStats.availableMembers} available
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card-premium p-6 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hours This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.hoursThisWeek}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {dashboardStats.totalHours} total
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card-premium p-6 hover-glow">
        <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className="group p-4 glass-card rounded-xl hover-glow transition-all hover-scale text-left"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="glass-card-premium p-6 hover-glow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">Recent Projects</h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-1"
          >
            View All <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {recentProjects.map((project) => (
            <div key={project.id} className="p-4 glass-card rounded-xl hover-glow transition-all">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                  <span>Team: {project.team.length} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{project.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="glass-card-premium p-6 hover-glow">
        <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-4">Project Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {navigationCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => navigate(card.path)}
                className="group p-4 glass-card rounded-xl hover-glow transition-all hover-scale text-left"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{card.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{card.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary-600 dark:text-primary-400">{card.stats}</span>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;