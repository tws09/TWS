import React from 'react';
import AdminPageTemplate from '../../../../../../features/admin/components/admin/AdminPageTemplate';
import { 
  ChartPieIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const FinanceBudgeting = () => {
  const stats = [
    { label: 'Total Budget', value: '$2.4M', icon: CurrencyDollarIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Allocated', value: '$1.8M', icon: ChartPieIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'Available', value: '$600K', icon: ArrowTrendingUpIcon, iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' },
    { label: 'Departments', value: '8', icon: CheckCircleIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' }
  ];

  const actions = (
    <button className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
      <PlusIcon className="w-5 h-5" />
      <span className="font-medium">Create Budget</span>
    </button>
  );

  const budgetByDepartment = [
    { department: 'Engineering', allocated: 850000, spent: 680000, percentage: 80 },
    { department: 'Sales & Marketing', allocated: 450000, spent: 380000, percentage: 84 },
    { department: 'Operations', allocated: 320000, spent: 290000, percentage: 91 },
    { department: 'HR', allocated: 180000, spent: 145000, percentage: 81 }
  ];

  return (
    <AdminPageTemplate
      title="Budgeting"
      description="Manage departmental budgets and allocations"
      stats={stats}
      actions={actions}
    >
      <div className="glass-card-premium p-6 hover-glow">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
          Budget by Department
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Department</th>
                <th className="text-right py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Allocated</th>
                <th className="text-right py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Spent</th>
                <th className="text-right py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Remaining</th>
                <th className="text-right py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Usage</th>
              </tr>
            </thead>
            <tbody>
              {budgetByDepartment.map((dept, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-bold text-gray-900 dark:text-white">{dept.department}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">${(dept.allocated / 1000).toFixed(0)}K</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">${(dept.spent / 1000).toFixed(0)}K</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">${((dept.allocated - dept.spent) / 1000).toFixed(0)}K</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${dept.percentage > 90 ? 'bg-red-500' : dept.percentage > 75 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${dept.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white w-12">{dept.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-premium p-6 hover-glow">
          <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
            Monthly Spending Trend
          </h3>
          <div className="text-center py-12">
            <ChartPieIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>

        <div className="glass-card-premium p-6 hover-glow">
          <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
            Budget Alerts
          </h3>
          <div className="space-y-3">
            {[
              { department: 'Operations', message: 'Exceeding 90% of budget', severity: 'high' },
              { department: 'Sales', message: 'On track, 84% utilized', severity: 'normal' }
            ].map((alert, index) => (
              <div key={index} className={`glass-card p-4 border-l-4 ${alert.severity === 'high' ? 'border-red-500' : 'border-green-500'}`}>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{alert.department}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default FinanceBudgeting;
