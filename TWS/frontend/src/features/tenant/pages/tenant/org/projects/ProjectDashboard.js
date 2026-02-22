/**
 * Project Dashboard Component
 * Shows integrated view of project with all features
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  FlagIcon,
  ClockIcon,
  CalendarDaysIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  FolderIcon,
  BookmarkIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import tenantProjectApiService from './services/tenantProjectApiService';
import IntegrationStatus from './components/IntegrationStatus';
import ErrorBoundary from './components/ErrorBoundary';
// Client Portal - REMOVED COMPLETELY
import { DateValidationAlerts, AtRiskDeliverables } from './components/deliverables';
import { handleApiError } from './utils/errorHandler';

const ProjectDashboard = () => {
  const { tenantSlug, projectId } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId && tenantSlug) {
      fetchDashboard();
    }
  }, [projectId, tenantSlug]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tenantProjectApiService.getProjectDashboard(tenantSlug, projectId);
      const data = response?.data ?? response;
      if (data && (data.project || data.metrics)) {
        setDashboard(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
      handleApiError(err, 'Failed to load project dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">No dashboard data available</div>
      </div>
    );
  }

  const { project, settings, metrics, tasks = [], sprints, milestones } = dashboard;

  // Workload by status for overview
  const workloadByStatus = {
    todo: tasks.filter(t => t.status === 'todo' || t.status === 'to-do').length,
    in_progress: tasks.filter(t => t.status === 'in_progress' || t.status === 'in-progress').length,
    under_review: tasks.filter(t => t.status === 'under_review' || t.status === 'under-review').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };
  const totalForWorkload = workloadByStatus.todo + workloadByStatus.in_progress + workloadByStatus.under_review + workloadByStatus.completed;

  const stats = [
    {
      label: 'Total Tasks',
      value: metrics.totalTasks,
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500',
      onClick: () => navigate(`/${tenantSlug}/org/projects/${projectId}/board`)
    },
    {
      label: 'Completed Tasks',
      value: metrics.completedTasks,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      percentage: metrics.completionRate
    },
    {
      label: 'Active Sprints',
      value: metrics.activeSprints,
      icon: CalendarDaysIcon,
      color: 'bg-purple-500',
      onClick: () => navigate(`/${tenantSlug}/org/projects/sprints?projectId=${projectId}`)
    },
    {
      label: 'Milestones',
      value: `${metrics.completedMilestones}/${metrics.totalMilestones}`,
      icon: FlagIcon,
      color: 'bg-orange-500',
      onClick: () => navigate(`/${tenantSlug}/org/projects/milestones?projectId=${projectId}`)
    },
    {
      label: 'Estimated Hours',
      value: metrics.totalEstimatedHours || 0,
      icon: ClockIcon,
      color: 'bg-indigo-500'
    },
    {
      label: 'Actual Hours',
      value: metrics.totalActualHours || 0,
      icon: ClockIcon,
      color: 'bg-pink-500',
      variance: metrics.hoursVariance
    }
  ];

  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {project?.name || 'Project Dashboard'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Integrated view of all project features
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/${tenantSlug}/org/projects/${projectId}/gantt`)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
            >
              <CalendarDaysIcon className="w-5 h-5" />
              Gantt Chart
            </button>
          </div>
        </div>

        {/* Integration Status */}
        <IntegrationStatus projectId={projectId} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 ${
                stat.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
              }`}
              onClick={stat.onClick}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                {stat.variance !== undefined && (
                  <div className="flex items-center gap-1">
                    {stat.variance >= 0 ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-xs text-gray-600">
                      {stat.variance >= 0 ? '+' : ''}{stat.variance.toFixed(1)}h
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              {stat.percentage !== undefined && (
                <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Project overview: scope, files, docs, bookmark, folders, resources, workload by status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <ClipboardDocumentListIcon className="w-5 h-5 text-blue-500" />
                Scope
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {project?.description || project?.scope || 'No scope defined for this project.'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate(`/${tenantSlug}/org/documents`)}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left flex items-center gap-3"
              >
                <DocumentTextIcon className="w-6 h-6 text-indigo-500 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent files</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">View and edit documents</p>
                </div>
              </button>
              <button
                onClick={() => navigate(`/${tenantSlug}/org/documents`)}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left flex items-center gap-3"
              >
                <DocumentTextIcon className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Docs</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Organization documents</p>
                </div>
              </button>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3 opacity-90">
                <BookmarkIcon className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Bookmarks</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Saved links (coming soon)</p>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3 opacity-90">
                <FolderIcon className="w-6 h-6 text-purple-500 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Folders</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Project folders (coming soon)</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => navigate(`/${tenantSlug}/org/projects/${projectId}/team`)}
              className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left flex items-center gap-3"
            >
              <UsersIcon className="w-6 h-6 text-blue-500 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Resources</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Team and allocation</p>
              </div>
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <SignalIcon className="w-5 h-5 text-blue-500" />
                Workload by status
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'todo', label: 'To Do', count: workloadByStatus.todo, color: 'bg-gray-500' },
                  { key: 'in_progress', label: 'In Progress', count: workloadByStatus.in_progress, color: 'bg-blue-500' },
                  { key: 'under_review', label: 'Under Review', count: workloadByStatus.under_review, color: 'bg-amber-500' },
                  { key: 'completed', label: 'Completed', count: workloadByStatus.completed, color: 'bg-green-500' }
                ].map(({ key, label, count, color }) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{label}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all`}
                        style={{ width: totalForWorkload ? `${(count / totalForWorkload) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate(`/${tenantSlug}/org/projects/${projectId}/board`)}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left"
          >
            <ClipboardDocumentListIcon className="w-6 h-6 text-blue-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">View Tasks</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {metrics.totalTasks} tasks
            </p>
          </button>

          <button
            onClick={() => navigate(`/${tenantSlug}/org/projects/${projectId}/gantt`)}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left"
          >
            <CalendarDaysIcon className="w-6 h-6 text-purple-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Gantt Chart</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Timeline view
            </p>
          </button>

          <button
            onClick={() => navigate(`/${tenantSlug}/org/projects/milestones?projectId=${projectId}`)}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left"
          >
            <FlagIcon className="w-6 h-6 text-orange-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Milestones</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {metrics.completedMilestones}/{metrics.totalMilestones} completed
            </p>
          </button>

          <button
            onClick={() => navigate(`/${tenantSlug}/org/projects/timesheets?projectId=${projectId}`)}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left"
          >
            <ClockIcon className="w-6 h-6 text-indigo-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Timesheets</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {metrics.totalActualHours.toFixed(1)}h logged
            </p>
          </button>
        </div>

        {/* Nucleus Project OS - Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <button
            onClick={() => navigate(`/${tenantSlug}/org/projects/deliverables?projectId=${projectId}`)}
            className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <FlagIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                NEW
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Deliverables</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage project deliverables
            </p>
          </button>

          <button
            onClick={() => navigate(`/${tenantSlug}/org/projects/change-requests?projectId=${projectId}`)}
            className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <span className="px-2 py-0.5 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                NEW
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Change Requests</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage scope changes
            </p>
          </button>
        </div>

        {/* Client Portal - REMOVED COMPLETELY */}

        {/* Project Type Settings Info */}
        {settings && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Project Type: {settings.projectType?.replace(/_/g, ' ').toUpperCase()}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {settings.requiresSprint ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-gray-700 dark:text-gray-300">Sprints</span>
              </div>
              <div className="flex items-center gap-2">
                {settings.requiresMilestone ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-gray-700 dark:text-gray-300">Milestones</span>
              </div>
              <div className="flex items-center gap-2">
                {settings.requiresTimesheet ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-gray-700 dark:text-gray-300">Timesheets</span>
              </div>
              <div className="flex items-center gap-2">
                {settings.requiresGantt ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-gray-700 dark:text-gray-300">Gantt Chart</span>
              </div>
            </div>
          </div>
        )}

        {/* Nucleus Project OS - Date Validation Alerts */}
        <div className="mt-6">
          <DateValidationAlerts />
        </div>

        {/* Nucleus Project OS - At-Risk Deliverables */}
        <div className="mt-6">
          <AtRiskDeliverables projectId={projectId} />
        </div>

        {/* Client Portal Settings - REMOVED COMPLETELY */}
      </div>
    </ErrorBoundary>
  );
};

export default ProjectDashboard;
