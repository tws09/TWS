import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UserIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  TrendingUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { tenantApiService } from '../../../../../../shared/services/tenant/tenant-api.service';

const DashboardOverview = () => {
  const { tenantSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [seedError, setSeedError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [tenantSlug]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantApiService.getDashboardOverview(tenantSlug);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateSampleData = async () => {
    if (seedLoading) return;
    if (!window.confirm('This will create sample projects, clients, tasks, employees, departments, and users in this organization. Continue?')) return;
    try {
      setSeedLoading(true);
      setSeedError(null);
      setSeedResult(null);
      const result = await tenantApiService.createSampleData(tenantSlug);
      setSeedResult(result);
      await fetchDashboardData();
    } catch (err) {
      console.error('Error creating sample data:', err);
      setSeedError(err.message || 'Failed to create sample data');
    } finally {
      setSeedLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0078d4] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#605e5c]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[#edebe9] rounded p-6 shadow-sm">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-[#d13438] mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[#323130] mb-1">Error</h3>
            <p className="text-sm text-[#605e5c] mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-[#0078d4] text-white rounded hover:bg-[#106ebe] transition-colors text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-white border border-[#edebe9] rounded p-6 shadow-sm">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-[#0078d4] mr-3 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-[#323130] mb-1">No Data</h3>
            <p className="text-sm text-[#605e5c]">No dashboard data available</p>
          </div>
        </div>
      </div>
    );
  }

  const { overview, recentActivity, projectStatus, taskStatus } = dashboardData;

  const totalProjects = projectStatus.reduce((sum, item) => sum + item.count, 0);
  const completedProjects = projectStatus.find(item => item._id === 'completed')?.count || 0;
  const projectCompletionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

  const totalTasks = taskStatus.reduce((sum, item) => sum + item.count, 0);
  const completedTasks = taskStatus.find(item => item._id === 'completed')?.count || 0;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const metricCards = [
    {
      label: 'Total Users',
      value: overview.totalUsers,
      icon: UserIcon,
      color: 'text-[#0078d4]',
      bgColor: 'bg-[#deecf9]',
      change: '+12%',
      trend: 'up'
    },
    {
      label: 'Total Employees',
      value: overview.totalEmployees,
      icon: UsersIcon,
      color: 'text-[#107c10]',
      bgColor: 'bg-[#dff6dd]',
      change: '+8%',
      trend: 'up'
    },
    {
      label: 'Active Projects',
      value: overview.totalProjects,
      icon: ClipboardDocumentListIcon,
      color: 'text-[#8764b8]',
      bgColor: 'bg-[#f3e8ff]',
      change: '+5%',
      trend: 'up'
    },
    {
      label: 'Total Tasks',
      value: overview.totalTasks,
      icon: CheckCircleIcon,
      color: 'text-[#ff8c00]',
      bgColor: 'bg-[#fff4e5]',
      change: '+15%',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Populate sample data - only show when overview exists */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handlePopulateSampleData}
          disabled={seedLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#8764b8] text-white rounded hover:bg-[#7b52b0] disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          {seedLoading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Creating sample data...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5" />
              Populate sample data
            </>
          )}
        </button>
        {seedResult && (
          <span className="text-sm text-[#107c10]">
            Created: {seedResult.departments} departments, {seedResult.users} users, {seedResult.clients} clients, {seedResult.projects} projects, {seedResult.tasks} tasks, {seedResult.employees} employees.
          </span>
        )}
        {seedError && (
          <span className="text-sm text-[#d13438]">{seedError}</span>
        )}
      </div>

      {/* Microsoft Style Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white border border-[#edebe9] rounded shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 ${card.bgColor} rounded flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div className={`flex items-center space-x-1 text-xs ${
                  card.trend === 'up' ? 'text-[#107c10]' : 'text-[#d13438]'
                }`}>
                  {card.trend === 'up' ? (
                    <ArrowUpIcon className="h-3 w-3" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3" />
                  )}
                  <span className="font-semibold">{card.change}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#605e5c] mb-1">{card.label}</p>
                <p className="text-2xl font-semibold text-[#323130]">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Cards - Microsoft Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Project Completion */}
        <div className="bg-white border border-[#edebe9] rounded shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#323130] mb-1">Project Completion</h3>
              <p className="text-sm text-[#605e5c]">Track your project progress</p>
            </div>
            <div className="h-12 w-12 bg-[#deecf9] rounded flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-[#0078d4]" />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-semibold text-[#323130]">
                {projectCompletionRate.toFixed(1)}%
              </span>
              <span className="text-sm text-[#605e5c]">
                {completedProjects} of {totalProjects} completed
              </span>
            </div>
            <div className="relative h-2 bg-[#edebe9] rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-[#0078d4] rounded-full transition-all duration-500"
                style={{ width: `${projectCompletionRate}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(projectStatus || []).length > 0 ? (
              projectStatus.map((status) => (
                <span
                  key={status._id || 'unknown'}
                  className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(status._id)}`}
                >
                  {status._id || 'Unknown'}: {status.count || 0}
                </span>
              ))
            ) : (
              <span className="text-sm text-[#605e5c]">No project data available</span>
            )}
          </div>
        </div>

        {/* Task Completion */}
        <div className="bg-white border border-[#edebe9] rounded shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#323130] mb-1">Task Completion</h3>
              <p className="text-sm text-[#605e5c]">Monitor task performance</p>
            </div>
            <div className="h-12 w-12 bg-[#dff6dd] rounded flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-[#107c10]" />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-semibold text-[#323130]">
                {taskCompletionRate.toFixed(1)}%
              </span>
              <span className="text-sm text-[#605e5c]">
                {completedTasks} of {totalTasks} completed
              </span>
            </div>
            <div className="relative h-2 bg-[#edebe9] rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-[#107c10] rounded-full transition-all duration-500"
                style={{ width: `${taskCompletionRate}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(taskStatus || []).length > 0 ? (
              taskStatus.map((status) => (
                <span
                  key={status._id || 'unknown'}
                  className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(status._id)}`}
                >
                  {status._id || 'Unknown'}: {status.count || 0}
                </span>
              ))
            ) : (
              <span className="text-sm text-[#605e5c]">No task data available</span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions - Microsoft Style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white border border-[#edebe9] rounded shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#edebe9] bg-[#faf9f8]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-[#605e5c]" />
                <h3 className="text-base font-semibold text-[#323130]">Recent Activity</h3>
              </div>
              <button 
                onClick={() => navigate('/tenant/' + tenantSlug + '/org/analytics')}
                className="text-sm font-semibold text-[#0078d4] hover:text-[#106ebe] transition-colors"
              >
                View all
              </button>
            </div>
          </div>
          <div className="divide-y divide-[#edebe9]">
            {(recentActivity || []).length > 0 ? (
              recentActivity.map((item, index) => (
                <div key={index} className="px-6 py-4 hover:bg-[#faf9f8] transition-colors">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-8 w-8 rounded flex items-center justify-center ${getStatusColor(item.status || 'pending')}`}>
                      <ClockIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#323130] truncate">
                          {item.title || item.name || 'Activity'}
                        </p>
                        <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(item.status || 'pending')} whitespace-nowrap`}>
                          {item.status || 'pending'}
                        </span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {item.assignedTo?.fullName && (
                          <p className="text-xs text-[#605e5c]">Assigned to: {item.assignedTo.fullName}</p>
                        )}
                        {item.project?.name && (
                          <p className="text-xs text-[#605e5c]">Project: {item.project.name}</p>
                        )}
                        {item.updatedAt && (
                          <p className="text-xs text-[#605e5c]">{new Date(item.updatedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <ClockIcon className="h-12 w-12 text-[#c8c6c4] mx-auto mb-3" />
                <p className="text-[#605e5c] font-medium">No recent activity</p>
                <p className="text-sm text-[#a19f9d] mt-1">Activity will appear here as you use the system</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-[#edebe9] rounded shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#323130] mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/tenant/' + tenantSlug + '/org/projects/tasks?create=task')}
              className="w-full bg-gradient-to-r from-[#0078d4] to-[#106ebe] text-white px-4 py-2.5 rounded hover:opacity-90 transition-opacity text-sm font-semibold"
            >
              Add Task
            </button>
            <button 
              onClick={() => navigate('/tenant/' + tenantSlug + '/org/my-work')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded hover:opacity-90 transition-opacity text-sm font-semibold"
            >
              My Work
            </button>
            <button 
              onClick={() => navigate('/tenant/' + tenantSlug + '/org/projects')}
              className="w-full bg-[#0078d4] text-white px-4 py-2.5 rounded hover:bg-[#106ebe] transition-colors text-sm font-semibold"
            >
              Create New Project
            </button>
            <button 
              onClick={() => navigate('/tenant/' + tenantSlug + '/org/users/create')}
              className="w-full bg-white border border-[#8a8886] text-[#323130] px-4 py-2.5 rounded hover:bg-[#f3f2f1] transition-colors text-sm font-semibold"
            >
              Add New User
            </button>
            <button 
              onClick={() => navigate('/tenant/' + tenantSlug + '/org/reports')}
              className="w-full bg-white border border-[#8a8886] text-[#323130] px-4 py-2.5 rounded hover:bg-[#f3f2f1] transition-colors text-sm font-semibold"
            >
              Generate Report
            </button>
            <button 
              onClick={() => navigate('/tenant/' + tenantSlug + '/org/analytics')}
              className="w-full bg-white border border-[#8a8886] text-[#323130] px-4 py-2.5 rounded hover:bg-[#f3f2f1] transition-colors text-sm font-semibold"
            >
              View Analytics
            </button>
            <button 
              onClick={() => navigate('/tenant/' + tenantSlug + '/org/software-house/hr/employees/create')}
              className="w-full bg-white border border-[#8a8886] text-[#323130] px-4 py-2.5 rounded hover:bg-[#f3f2f1] transition-colors text-sm font-semibold"
            >
              Add Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Microsoft Fluent Design Status Colors
const getStatusColor = (status) => {
  const colors = {
    completed: 'bg-[#107c10] text-white',
    in_progress: 'bg-[#0078d4] text-white',
    pending: 'bg-[#ff8c00] text-white',
    cancelled: 'bg-[#d13438] text-white',
    on_hold: 'bg-[#8764b8] text-white',
    planning: 'bg-[#00bcf2] text-white'
  };
  return colors[status] || 'bg-[#8a8886] text-white';
};

export default DashboardOverview;
