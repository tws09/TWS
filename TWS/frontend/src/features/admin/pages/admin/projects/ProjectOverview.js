import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  UsersIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  FolderIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const ProjectOverview = () => {
  // Mock data - in production, fetch from API
  const [metrics, setMetrics] = useState({
    totalProjects: 24,
    activeProjects: 16,
    completedProjects: 8,
    totalTeamMembers: 48,
    onTrackProjects: 12,
    atRiskProjects: 3,
    delayedProjects: 1,
    totalBudget: 1250000,
    spentBudget: 450000,
    totalHours: 12400,
    utilization: 78
  });

  const [recentProjects, setRecentProjects] = useState([
    { id: 1, name: 'E-Commerce Platform', client: 'TechCorp', status: 'on_track', progress: 75, deadline: '2025-11-15', team: 6 },
    { id: 2, name: 'Mobile Banking App', client: 'FinanceHub', status: 'at_risk', progress: 45, deadline: '2025-10-30', team: 8 },
    { id: 3, name: 'CRM System', client: 'SalesMax', status: 'on_track', progress: 90, deadline: '2025-10-20', team: 4 },
    { id: 4, name: 'Inventory Management', client: 'RetailPro', status: 'delayed', progress: 30, deadline: '2025-10-10', team: 5 }
  ]);

  const [upcomingMilestones, setUpcomingMilestones] = useState([
    { id: 1, title: 'UI/UX Design Approval', project: 'E-Commerce Platform', dueDate: '2025-10-12', status: 'pending' },
    { id: 2, title: 'Backend API Development', project: 'Mobile Banking App', dueDate: '2025-10-15', status: 'in_progress' },
    { id: 3, title: 'User Testing Phase', project: 'CRM System', dueDate: '2025-10-18', status: 'pending' }
  ]);

  const stats = [
    { 
      label: 'Total Projects', 
      value: metrics.totalProjects, 
      change: '+3 this month',
      icon: FolderIcon, 
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      trend: 'up'
    },
    { 
      label: 'Active Projects', 
      value: metrics.activeProjects, 
      change: '+2 this week',
      icon: ClipboardDocumentListIcon, 
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
      trend: 'up'
    },
    { 
      label: 'Team Members', 
      value: metrics.totalTeamMembers, 
      change: `${metrics.utilization}% utilized`,
      icon: UsersIcon, 
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600'
    },
    { 
      label: 'Total Budget', 
      value: `$${(metrics.totalBudget / 1000).toFixed(0)}K`, 
      change: `$${(metrics.spentBudget / 1000).toFixed(0)}K spent`,
      icon: CurrencyDollarIcon, 
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'at_risk':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'delayed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'on_track':
        return 'On Track';
      case 'at_risk':
        return 'At Risk';
      case 'delayed':
        return 'Delayed';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card-premium p-6 hover-glow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold font-heading text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Health Overview */}
      <div className="glass-card-premium p-6 hover-glow">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-6">
          Project Health Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">On Track</span>
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{metrics.onTrackProjects}</p>
            <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(metrics.onTrackProjects / metrics.activeProjects) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-card p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">At Risk</span>
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{metrics.atRiskProjects}</p>
            <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${(metrics.atRiskProjects / metrics.activeProjects) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-card p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Delayed</span>
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">{metrics.delayedProjects}</p>
            <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${(metrics.delayedProjects / metrics.activeProjects) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="glass-card-premium p-6 hover-glow">
          <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
            Active Projects
          </h3>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="glass-card p-4 hover-glow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                      {project.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Client: {project.client}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-bold text-gray-900 dark:text-white">{project.progress}%</span>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        project.status === 'on_track' ? 'bg-green-500' :
                        project.status === 'at_risk' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs mt-3">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <UsersIcon className="w-3 h-3" />
                      <span>{project.team} members</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <ClockIcon className="w-3 h-3" />
                      <span>{project.deadline}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="glass-card-premium p-6 hover-glow">
          <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
            Upcoming Milestones
          </h3>
          <div className="space-y-4">
            {upcomingMilestones.map((milestone) => (
              <div key={milestone.id} className="glass-card p-4 hover-glow border-l-4 border-primary-500">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex-1">
                    {milestone.title}
                  </h4>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    milestone.status === 'in_progress' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                    {milestone.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Project: {milestone.project}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <ClockIcon className="w-3 h-3" />
                  <span>Due: {milestone.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="glass-card-premium p-6 hover-glow">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
          Budget Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Allocated</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${(metrics.totalBudget / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Spent</p>
            <p className="text-2xl font-bold text-amber-600">
              ${(metrics.spentBudget / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
            <p className="text-2xl font-bold text-green-600">
              ${((metrics.totalBudget - metrics.spentBudget) / 1000).toFixed(0)}K
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-600 h-3 rounded-full" 
              style={{ width: `${(metrics.spentBudget / metrics.totalBudget) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {((metrics.spentBudget / metrics.totalBudget) * 100).toFixed(1)}% of budget utilized
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
