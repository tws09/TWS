import React from 'react';
import AdminPageTemplate from '../../../../features/admin/components/admin/AdminPageTemplate';
import { 
  ChartBarIcon, 
  StarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const HRPerformance = () => {
  const stats = [
    { label: 'Average Rating', value: '4.2', icon: StarIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { label: 'Reviews Due', value: '15', icon: ChartBarIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Top Performers', value: '24', icon: TrophyIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'Improvement Plans', value: '5', icon: ArrowTrendingUpIcon, iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' }
  ];

  const performanceData = [
    { name: 'John Smith', department: 'Engineering', rating: 4.8, lastReview: '2023-12-15', nextReview: '2024-03-15', status: 'Excellent' },
    { name: 'Sarah Johnson', department: 'Management', rating: 4.5, lastReview: '2023-11-20', nextReview: '2024-02-20', status: 'Very Good' },
    { name: 'Michael Chen', department: 'Design', rating: 4.7, lastReview: '2023-12-01', nextReview: '2024-03-01', status: 'Excellent' }
  ];

  return (
    <AdminPageTemplate
      title="Performance Management"
      description="Track and manage employee performance reviews"
      stats={stats}
    >
      {/* Performance Overview */}
      <div className="glass-card-premium p-6 hover-glow">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
          Recent Performance Reviews
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Employee</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Department</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Rating</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Last Review</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Next Review</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((employee, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{employee.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{employee.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{employee.department}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{employee.rating}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{employee.lastReview}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{employee.nextReview}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {employee.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium">
                      View Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-premium p-6 hover-glow">
          <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
            Performance Distribution
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Excellent (4.5+)', value: 45, color: 'bg-green-500' },
              { label: 'Very Good (4.0-4.4)', value: 30, color: 'bg-blue-500' },
              { label: 'Good (3.5-3.9)', value: 20, color: 'bg-amber-500' },
              { label: 'Needs Improvement (<3.5)', value: 5, color: 'bg-red-500' }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card-premium p-6 hover-glow">
          <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
            Top Performers This Quarter
          </h3>
          <div className="space-y-3">
            {[
              { name: 'John Smith', score: 4.8, department: 'Engineering' },
              { name: 'Michael Chen', score: 4.7, department: 'Design' },
              { name: 'Sarah Johnson', score: 4.5, department: 'Management' }
            ].map((performer, index) => (
              <div key={index} className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <TrophyIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{performer.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{performer.department}</p>
                </div>
                <div className="flex items-center gap-1">
                  <StarIcon className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{performer.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default HRPerformance;
