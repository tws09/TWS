import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app/providers/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  CalendarIcon,
  BriefcaseIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    newHires: 0,
    departures: 0,
    averageSalary: 0,
    departmentStats: [],
    performanceStats: [],
    recentHires: [],
    upcomingReviews: [],
    salaryDistribution: [],
    skillsGaps: [],
    complianceAlerts: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/employees/dashboard?timeRange=${timeRange}`);
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, changeType, icon: Icon, color = 'blue' }) => {
    const getColorClasses = (color) => {
      const colorMap = {
        blue: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-300' },
        green: { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-300' },
        yellow: { bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-300' },
        purple: { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-300' },
        red: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-300' },
        indigo: { bg: 'bg-indigo-100 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-300' }
      };
      return colorMap[color] || colorMap.blue;
    };
    
    const colors = getColorClasses(color);
    
    return (
      <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden shadow-lg dark:shadow-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-600/50 hover:shadow-xl dark:hover:shadow-slate-900/70 transition-all duration-200 hover:scale-105">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-lg ${colors.bg} border border-white/20 dark:border-slate-500/30`}>
              <Icon className={`h-6 w-6 ${colors.text}`} />
            </div>
            {change && (
              <div className={`text-sm font-semibold ${
                changeType === 'increase' ? 'text-green-600 dark:text-green-300' : 
                changeType === 'decrease' ? 'text-red-600 dark:text-red-300' : 'text-gray-600 dark:text-slate-400'
              }`}>
                {change}
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-300 tracking-wide uppercase">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-slate-100 mt-2">
              {value}
            </p>
            {change && (
              <div className={`flex items-center mt-2 text-sm font-medium ${
                changeType === 'increase' ? 'text-green-700 dark:text-green-300' : 
                changeType === 'decrease' ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-slate-400'
              }`}>
                {changeType === 'increase' && <ArrowUpIcon className="h-4 w-4 mr-1" />}
                {changeType === 'decrease' && <ArrowDownIcon className="h-4 w-4 mr-1" />}
                {changeType === 'neutral' && <MinusIcon className="h-4 w-4 mr-1" />}
                <span>{changeType === 'increase' ? 'Increased' : changeType === 'decrease' ? 'Decreased' : 'No change'} from last period</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DepartmentChart = () => (
    <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm shadow-lg dark:shadow-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-600/50 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 border border-white/20 dark:border-slate-500/30">
          <ChartBarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Department Distribution</h3>
      </div>
      <div className="space-y-4">
        {dashboardData.departmentStats.map((dept, index) => {
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500'];
          const colorClass = colors[index % 6];
          
          return (
            <div key={dept.name} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:scale-102">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${colorClass} shadow-sm`}></div>
                <span className="text-sm font-semibold text-gray-900 dark:text-slate-200">{dept.name}</span>
              </div>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 dark:bg-slate-600/50 rounded-full h-3 mr-3 shadow-inner">
                  <div 
                    className={`h-3 rounded-full ${colorClass} shadow-sm`}
                    style={{ width: `${(dept.count / dashboardData.totalEmployees) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-slate-100 w-8 text-right">{dept.count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const PerformanceOverview = () => (
    <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm shadow-lg dark:shadow-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-600/50 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 border border-white/20 dark:border-slate-500/30">
          <StarIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Performance Overview</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {dashboardData.performanceStats.map((stat, index) => (
          <div key={stat.rating} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600/30 hover:bg-gray-100 dark:hover:bg-slate-700/70 transition-all duration-200">
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon 
                    key={i} 
                    className={`h-4 w-4 ${
                      i < stat.rating ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-300 dark:text-slate-500'
                    }`} 
                  />
                ))}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-slate-300">{stat.rating} Star{stat.rating !== 1 ? 's' : ''}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{stat.count} employees</span>
          </div>
        ))}
      </div>
    </div>
  );

  const RecentHires = () => (
    <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm shadow-lg dark:shadow-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-600/50 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20 border border-white/20 dark:border-slate-500/30">
          <UsersIcon className="w-5 h-5 text-green-600 dark:text-green-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Recent Hires</h3>
      </div>
      <div className="space-y-3">
        {dashboardData.recentHires.map((hire) => (
          <div key={hire._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-600">
                  <span className="text-white font-bold text-sm">
                    {hire.userId?.fullName?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{hire.userId?.fullName}</p>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{hire.department} • {hire.jobTitle}</p>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {new Date(hire.hireDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const UpcomingReviews = () => (
    <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm shadow-lg dark:shadow-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-600/50 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20 border border-white/20 dark:border-slate-500/30">
          <CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Upcoming Reviews</h3>
      </div>
      <div className="space-y-3">
        {dashboardData.upcomingReviews.map((review) => (
          <div key={review._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-600">
                  <span className="text-white font-bold text-sm">
                    {review.userId?.fullName?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{review.userId?.fullName}</p>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Performance Review</p>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {new Date(review.nextReviewDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ComplianceAlerts = () => (
    <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm shadow-lg dark:shadow-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-600/50 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-500/20 border border-white/20 dark:border-slate-500/30">
          <ShieldCheckIcon className="w-5 h-5 text-red-600 dark:text-red-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Compliance Alerts</h3>
      </div>
      <div className="space-y-3">
        {dashboardData.complianceAlerts.length > 0 ? (
          dashboardData.complianceAlerts.map((alert, index) => (
            <div key={index} className="flex items-center p-4 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-200">
              <ShieldCheckIcon className="h-5 w-5 text-red-600 dark:text-red-300 mr-3" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">{alert.title}</p>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{alert.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-green-500 dark:text-green-400" />
            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-slate-300">All compliance requirements are up to date</p>
          </div>
        )}
      </div>
    </div>
  );

  const SkillsGaps = () => (
    <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm shadow-lg dark:shadow-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-600/50 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20 border border-white/20 dark:border-slate-500/30">
          <AcademicCapIcon className="w-5 h-5 text-orange-600 dark:text-orange-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Skills Gap Analysis</h3>
      </div>
      <div className="space-y-3">
        {dashboardData.skillsGaps.map((gap, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg border border-yellow-200 dark:border-yellow-500/30 hover:bg-yellow-100 dark:hover:bg-yellow-500/20 transition-all duration-200">
            <div className="flex items-center">
              <AcademicCapIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-300 mr-3" />
              <div>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">{gap.skill}</p>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">{gap.gapCount} employees need training</p>
              </div>
            </div>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              gap.priority === 'High' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300' :
              gap.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' :
              'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
            }`}>{gap.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <div className="space-y-8 p-6">
        {/* Beautiful Dark Mode Header */}
        <div className="bg-white dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-slate-600/50 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-slate-700 dark:to-slate-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30 dark:border-slate-500/50">
                  <UsersIcon className="w-8 h-8 text-white dark:text-slate-200" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white dark:text-slate-100">Employee Dashboard</h1>
                  <p className="text-purple-100 dark:text-slate-300">Comprehensive overview of your workforce and HR metrics</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 bg-white/20 dark:bg-slate-700/70 backdrop-blur-sm border border-white/30 dark:border-slate-500/50 rounded-xl text-sm focus:ring-2 focus:ring-white/50 dark:focus:ring-slate-400/50 focus:border-white/50 dark:focus:border-slate-400/50 transition-all text-white dark:text-slate-200 placeholder-white/70 dark:placeholder-slate-400"
                >
                  <option value="7d" className="text-gray-900 dark:text-slate-100 dark:bg-slate-800">Last 7 days</option>
                  <option value="30d" className="text-gray-900 dark:text-slate-100 dark:bg-slate-800">Last 30 days</option>
                  <option value="90d" className="text-gray-900 dark:text-slate-100 dark:bg-slate-800">Last 90 days</option>
                  <option value="1y" className="text-gray-900 dark:text-slate-100 dark:bg-slate-800">Last year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={dashboardData.totalEmployees}
          change="+12%"
          changeType="increase"
          icon={UsersIcon}
          color="blue"
        />
        <StatCard
          title="Active Employees"
          value={dashboardData.activeEmployees}
          change="+5%"
          changeType="increase"
          icon={BriefcaseIcon}
          color="green"
        />
        <StatCard
          title="Average Salary"
          value={`$${dashboardData.averageSalary.toLocaleString()}`}
          change="+8%"
          changeType="increase"
          icon={CurrencyDollarIcon}
          color="yellow"
        />
        <StatCard
          title="New Hires"
          value={dashboardData.newHires}
          change="+3"
          changeType="increase"
          icon={TrendingUpIcon}
          color="purple"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DepartmentChart />
        <PerformanceOverview />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentHires />
        <UpcomingReviews />
      </div>

        {/* Alerts and Insights */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ComplianceAlerts />
          <SkillsGaps />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
