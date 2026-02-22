import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  FolderIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const DashboardWidget = ({ type, user, data = {} }) => {
  const widgets = {
    overview: {
      title: 'System Overview',
      icon: ChartBarIcon,
      color: 'blue',
      description: 'Key metrics and system status',
      link: '/',
      stats: [
        { label: 'Active Users', value: data.activeUsers || '24' },
        { label: 'Active Projects', value: data.activeProjects || '12' },
        { label: 'Pending Tasks', value: data.pendingTasks || '8' },
        { label: 'This Month Revenue', value: data.monthlyRevenue || '$45,000' }
      ]
    },
    users: {
      title: 'People Management',
      icon: UsersIcon,
      color: 'green',
      description: 'User and team management',
      link: '/users',
      stats: [
        { label: 'Total Users', value: data.totalUsers || '156' },
        { label: 'Active Teams', value: data.activeTeams || '8' },
        { label: 'New This Month', value: data.newUsers || '3' },
        { label: 'Pending Reviews', value: data.pendingReviews || '5' }
      ]
    },
    projects: {
      title: 'Projects & Workspaces',
      icon: FolderIcon,
      color: 'purple',
      description: 'Project management and collaboration',
      link: '/projects',
      stats: [
        { label: 'Active Projects', value: data.activeProjects || '12' },
        { label: 'Completed This Month', value: data.completedProjects || '4' },
        { label: 'Team Members', value: data.teamMembers || '24' },
        { label: 'Overdue Tasks', value: data.overdueTasks || '3' }
      ]
    },
    finance: {
      title: 'Finance & Payroll',
      icon: CurrencyDollarIcon,
      color: 'emerald',
      description: 'Financial management and payroll',
      link: '/finance',
      stats: [
        { label: 'Monthly Revenue', value: data.monthlyRevenue || '$45,000' },
        { label: 'Pending Invoices', value: data.pendingInvoices || '7' },
        { label: 'Payroll Due', value: data.payrollDue || '$12,500' },
        { label: 'Expenses This Month', value: data.monthlyExpenses || '$8,200' }
      ]
    },
    hr: {
      title: 'Human Resources',
      icon: UserGroupIcon,
      color: 'indigo',
      description: 'HR management and employee services',
      link: '/hr',
      stats: [
        { label: 'Total Employees', value: data.totalEmployees || '48' },
        { label: 'On Leave', value: data.onLeave || '3' },
        { label: 'Performance Reviews', value: data.performanceReviews || '12' },
        { label: 'Training Programs', value: data.trainingPrograms || '5' }
      ]
    },
    tasks: {
      title: 'My Tasks',
      icon: DocumentTextIcon,
      color: 'orange',
      description: 'Personal task management',
      link: '/tasks',
      stats: [
        { label: 'Assigned to Me', value: data.assignedTasks || '8' },
        { label: 'Completed Today', value: data.completedToday || '3' },
        { label: 'Due This Week', value: data.dueThisWeek || '5' },
        { label: 'Overdue', value: data.overdueTasks || '1' }
      ]
    },
    attendance: {
      title: 'Time & Attendance',
      icon: ClockIcon,
      color: 'teal',
      description: 'Time tracking and attendance',
      link: '/attendance',
      stats: [
        { label: 'Hours This Week', value: data.hoursThisWeek || '32.5' },
        { label: 'Days Present', value: data.daysPresent || '4' },
        { label: 'Overtime Hours', value: data.overtimeHours || '2.5' },
        { label: 'Leave Balance', value: data.leaveBalance || '12 days' }
      ]
    },
    analytics: {
      title: 'Analytics & Reports',
      icon: ChartBarIcon,
      color: 'pink',
      description: 'Business intelligence and reporting',
      link: '/analytics',
      stats: [
        { label: 'Reports Generated', value: data.reportsGenerated || '24' },
        { label: 'Data Points', value: data.dataPoints || '1,247' },
        { label: 'Trending Up', value: data.trendingUp || '8 metrics' },
        { label: 'Alerts', value: data.alerts || '3' }
      ]
    }
  };

  const widget = widgets[type];
  if (!widget) return null;

  const IconComponent = widget.icon;

  return (
    <div className="ws-card-premium p-4 md:p-6 group hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className={`
            w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-glow
            ${widget.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : ''}
            ${widget.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' : ''}
            ${widget.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : ''}
            ${widget.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : ''}
            ${widget.color === 'indigo' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : ''}
            ${widget.color === 'orange' ? 'bg-gradient-to-br from-orange-500 to-orange-600' : ''}
            ${widget.color === 'teal' ? 'bg-gradient-to-br from-teal-500 to-teal-600' : ''}
            ${widget.color === 'pink' ? 'bg-gradient-to-br from-pink-500 to-pink-600' : ''}
          `}>
            <IconComponent className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div>
            <h3 className="ws-heading-5 text-gray-900 dark:text-white">
              {widget.title}
            </h3>
            <p className="ws-text-small text-gray-600 dark:text-gray-400">
              {widget.description}
            </p>
          </div>
        </div>
        <Link
          to={widget.link}
          className="p-2 rounded-xl text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 group-hover:scale-110"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-6">
        {widget.stats.map((stat, index) => (
          <div key={index} className="text-center p-3 md:p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="ws-text-caption text-gray-600 dark:text-gray-400 text-xs md:text-sm">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          to={widget.link}
          className="ws-btn ws-btn-ghost w-full justify-center group"
        >
          View Details
          <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default DashboardWidget;
