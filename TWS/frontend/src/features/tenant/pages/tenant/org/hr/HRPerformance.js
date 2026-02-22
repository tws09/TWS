import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChartBarIcon, 
  StarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { tenantApiService } from '../../../../../../shared/services/tenant/tenant-api.service';

const HRPerformance = () => {
  const { tenantSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    reviewsDue: 0,
    topPerformers: 0,
    improvementPlans: 0
  });

  useEffect(() => {
    fetchPerformanceData();
  }, [tenantSlug]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const data = await tenantApiService.getPerformanceData(tenantSlug);
      
      // Transform API data to match component expectations
      const employees = data.employees || data.performanceReviews || [];
      const stats = data.stats || {
        averageRating: data.averageRating || 0,
        reviewsDue: data.reviewsDue || 0,
        topPerformers: data.topPerformers || 0,
        improvementPlans: data.improvementPlans || 0
      };
      
      setPerformanceData(employees);
      setStats(stats);
    } catch (err) {
      console.error('Error fetching performance data:', err);
      // Set empty state on error
      setPerformanceData([]);
      setStats({ averageRating: 0, reviewsDue: 0, topPerformers: 0, improvementPlans: 0 });
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { label: 'Average Rating', value: stats.averageRating.toFixed(1), icon: StarIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { label: 'Reviews Due', value: stats.reviewsDue.toString(), icon: ChartBarIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Top Performers', value: stats.topPerformers.toString(), icon: TrophyIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'Improvement Plans', value: stats.improvementPlans.toString(), icon: ArrowTrendingUpIcon, iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Performance Management
          </h1>
          <p className="text-sm xl:text-base text-gray-600 dark:text-gray-300 mt-1">
            Track and manage employee performance reviews
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="glass-card-premium p-5 xl:p-6 hover-lift">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 xl:w-14 xl:h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-glow-lg`}>
                <stat.icon className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
              </div>
              <div>
                <p className="text-xs xl:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl xl:text-3xl font-bold font-heading text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Overview */}
      <div className="glass-card-premium p-6 xl:p-8 hover-glow">
        <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
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
              {performanceData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <ChartBarIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No performance data available</p>
                  </td>
                </tr>
              ) : (
                performanceData.map((employee, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-premium p-6 xl:p-8 hover-glow">
          <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
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
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color} transition-all duration-300`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card-premium p-6 xl:p-8 hover-glow">
          <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
            Top Performers This Quarter
          </h3>
          <div className="space-y-3">
            {[
              { name: 'John Smith', score: 4.8, department: 'Engineering' },
              { name: 'Michael Chen', score: 4.7, department: 'Design' },
              { name: 'Sarah Johnson', score: 4.5, department: 'Management' },
              { name: 'Alice Cooper', score: 4.4, department: 'Sales' }
            ].map((performer, index) => (
              <div key={index} className="glass-card p-4 flex items-center gap-4 hover-lift">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-glow">
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

      {/* Additional Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-premium p-6 xl:p-8 hover-glow">
          <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
            Upcoming Reviews
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Alice Cooper', date: '2024-02-01', type: 'Quarterly', priority: 'high' },
              { name: 'Bob Martinez', date: '2024-02-05', type: 'Annual', priority: 'high' },
              { name: 'Carol White', date: '2024-02-10', type: 'Quarterly', priority: 'medium' },
              { name: 'David Lee', date: '2024-02-15', type: 'Quarterly', priority: 'medium' }
            ].map((review, index) => (
              <div key={index} className="glass-card p-3 flex items-center justify-between hover-lift">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{review.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{review.type} Review</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    review.priority === 'high' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {review.priority === 'high' ? 'Urgent' : 'Normal'}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card-premium p-6 xl:p-8 hover-glow">
          <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
            Performance Trends
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">This Quarter</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">+0.3</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Quarter</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">4.1</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: '68%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Year Average</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">4.0</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-purple-500 transition-all duration-300"
                  style={{ width: '67%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRPerformance;

