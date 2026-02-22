import React from 'react';
import AdminPageTemplate from '../../../../features/admin/components/admin/AdminPageTemplate';
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const HRDashboard = () => {
  const stats = [
    {
      label: 'Total Employees',
      value: '148',
      change: '+12 this month',
      icon: UserGroupIcon,
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600'
    },
    {
      label: 'Active Recruitments',
      value: '8',
      change: '+3 new',
      icon: ChartBarIcon,
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600'
    },
    {
      label: 'Pending Leave Requests',
      value: '12',
      change: 'Review required',
      icon: ClockIcon,
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600'
    },
    {
      label: 'Payroll This Month',
      value: '$428K',
      change: '+5.2%',
      icon: CurrencyDollarIcon,
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600'
    }
  ];

  const actions = (
    <>
      <button className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2">
        <PlusIcon className="w-5 h-5" />
        <span className="font-medium">Add Employee</span>
      </button>
    </>
  );

  return (
    <AdminPageTemplate
      title="HR Management"
      description="Comprehensive human resources management dashboard"
      stats={stats}
      actions={actions}
    >
      {/* Quick Actions */}
      <div className="glass-card-premium p-6 hover-glow">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="glass-card p-4 hover-lift text-left group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Manage Employees</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">View & edit staff</p>
              </div>
            </div>
          </button>

          <button className="glass-card p-4 hover-lift text-left group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Leave Requests</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Approve/Reject</p>
              </div>
            </div>
          </button>

          <button className="glass-card p-4 hover-lift text-left group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Payroll</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Process payments</p>
              </div>
            </div>
          </button>

          <button className="glass-card p-4 hover-lift text-left group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Performance</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Reviews & KPIs</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card-premium p-6 hover-glow">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[
            { type: 'New Employee', name: 'John Smith joined as Senior Developer', time: '2 hours ago', color: 'blue' },
            { type: 'Leave Request', name: 'Sarah Johnson requested 5 days leave', time: '4 hours ago', color: 'amber' },
            { type: 'Performance Review', name: 'Michael Chen completed quarterly review', time: '1 day ago', color: 'green' },
            { type: 'Recruitment', name: 'New opening: UI/UX Designer posted', time: '2 days ago', color: 'purple' }
          ].map((activity, index) => (
            <div key={index} className="glass-card p-4 flex items-center gap-4 hover-lift">
              <div className={`w-2 h-2 rounded-full bg-${activity.color}-500 animate-pulse`}></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{activity.type}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{activity.name}</p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default HRDashboard;
