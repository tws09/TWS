import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app/providers/AuthContext';
import axios from 'axios';
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  CalendarIcon,
  MapPinIcon,
  StarIcon,
  LightBulbIcon,
  CpuChipIcon,
  BoltIcon,
  RocketLaunchIcon,
  FireIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut, Radar, Scatter, Bubble } from 'react-chartjs-2';

const WorkforceAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [workforceMetrics, setWorkforceMetrics] = useState(null);
  const [predictiveInsights, setPredictiveInsights] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    fetchWorkforceAnalytics();
  }, [selectedPeriod, selectedDepartment]);

  const fetchWorkforceAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch workforce intelligence data
      const response = await axios.get('/api/payroll/ai/optimize');
      setAnalyticsData(response.data.data);
      setWorkforceMetrics(response.data.data.currentCosts);
      setPredictiveInsights(response.data.data.projectedSavings);
    } catch (error) {
      console.error('Error fetching workforce analytics:', error);
      // Mock data for development
      setAnalyticsData({
        currentCosts: {
          headcount: {
            total: 125,
            byDepartment: {
              Engineering: 45,
              Sales: 25,
              Marketing: 20,
              Operations: 15,
              Support: 20
            },
            byRole: {
              Senior: 35,
              Mid: 55,
              Junior: 35
            },
            byLocation: {
              'San Francisco': 60,
              'New York': 40,
              'Remote': 25
            }
          },
          compensation: {
            totalPayroll: 1250000,
            averageSalary: 95000,
            medianSalary: 85000,
            payrollGrowth: 12.5,
            costPerEmployee: 10000
          },
          productivity: {
            billableHours: 8500,
            revenuePerEmployee: 185000,
            utilizationRate: 0.78,
            efficiencyScore: 85
          },
          retention: {
            turnoverRate: 8.5,
            retentionRate: 91.5,
            averageTenure: 3.2,
            timeToFill: 45
          }
        },
        optimizationOpportunities: [
          {
            category: 'Workforce Allocation',
            description: 'Optimize team distribution across projects',
            estimatedSavings: 125000,
            implementationEffort: 'medium'
          },
          {
            category: 'Skill Utilization',
            description: 'Better match skills to project requirements',
            estimatedSavings: 85000,
            implementationEffort: 'low'
          },
          {
            category: 'Remote Work Optimization',
            description: 'Reduce office overhead costs',
            estimatedSavings: 200000,
            implementationEffort: 'high'
          }
        ],
        projectedSavings: 410000
      });
      setWorkforceMetrics({
        headcount: { total: 125 },
        compensation: { totalPayroll: 1250000, averageSalary: 95000 },
        productivity: { utilizationRate: 0.78, efficiencyScore: 85 },
        retention: { turnoverRate: 8.5, retentionRate: 91.5 }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const MetricCard = ({ title, value, change, changeType, icon: Icon, color = 'blue', subtitle, trend, onClick }) => (
    <div 
      className={`bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer transform hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-14 h-14 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-2xl flex items-center justify-center shadow-lg`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    changeType === 'increase' ? 'text-green-600' : 
                    changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {changeType === 'increase' && <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />}
                    {changeType === 'decrease' && <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
                    {change}
                  </div>
                )}
              </dd>
              {subtitle && (
                <dd className="text-sm text-gray-600 mt-1">{subtitle}</dd>
              )}
            </dl>
          </div>
        </div>
        {trend && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Trend</span>
              <span className={`${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
              </span>
            </div>
            <div className="mt-1 h-2 bg-gray-200 rounded-full">
              <div 
                className={`h-2 rounded-full ${trend > 0 ? 'bg-green-400' : 'bg-red-400'}`}
                style={{ width: `${Math.min(Math.abs(trend), 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ViewTab = ({ id, label, icon: Icon, active, onClick, count }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-5 w-5 mr-2" />
      {label}
      {count && (
        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
          active ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <CpuChipIcon className="h-8 w-8 text-blue-600 mt-4 animate-pulse" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Analyzing Workforce Data...</h3>
            <p className="mt-2 text-sm text-gray-600">Generating AI-powered insights and predictions</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Workforce Intelligence
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                AI-powered analytics for workforce optimization and strategic planning
              </p>
              <div className="mt-4 flex items-center space-x-6">
                <div className="flex items-center text-sm text-gray-500">
                  <UsersIcon className="w-4 h-4 mr-2" />
                  {workforceMetrics?.headcount?.total || 0} Employees
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                  {formatCurrency(workforceMetrics?.compensation?.totalPayroll)} Total Payroll
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
                  {formatPercentage(workforceMetrics?.productivity?.utilizationRate)} Utilization
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 shadow-sm"
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="ytd">Year to Date</option>
              </select>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 shadow-sm"
              >
                <option value="all">All Departments</option>
                <option value="engineering">Engineering</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="operations">Operations</option>
                <option value="support">Support</option>
              </select>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
          <div className="flex space-x-2">
            <ViewTab id="overview" label="Overview" icon={ChartBarIcon} active={activeView === 'overview'} onClick={setActiveView} />
            <ViewTab id="productivity" label="Productivity" icon={ArrowTrendingUpIcon} active={activeView === 'productivity'} onClick={setActiveView} />
            <ViewTab id="compensation" label="Compensation" icon={CurrencyDollarIcon} active={activeView === 'compensation'} onClick={setActiveView} />
            <ViewTab id="retention" label="Retention" icon={ShieldCheckIcon} active={activeView === 'retention'} onClick={setActiveView} />
            <ViewTab id="predictions" label="AI Predictions" icon={CpuChipIcon} active={activeView === 'predictions'} onClick={setActiveView} />
            <ViewTab id="optimization" label="Optimization" icon={RocketLaunchIcon} active={activeView === 'optimization'} onClick={setActiveView} />
          </div>
        </div>

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Employees"
                value={workforceMetrics?.headcount?.total || 0}
                change="+5"
                changeType="increase"
                icon={UsersIcon}
                color="blue"
                subtitle="Active workforce"
                trend={8.2}
              />
              <MetricCard
                title="Avg Salary"
                value={formatCurrency(workforceMetrics?.compensation?.averageSalary)}
                change="+12%"
                changeType="increase"
                icon={CurrencyDollarIcon}
                color="green"
                subtitle="Market competitive"
                trend={12.5}
              />
              <MetricCard
                title="Utilization Rate"
                value={formatPercentage(workforceMetrics?.productivity?.utilizationRate)}
                change="+3.2%"
                changeType="increase"
                icon={ChartBarIcon}
                color="purple"
                subtitle="Billable efficiency"
                trend={3.2}
              />
              <MetricCard
                title="Retention Rate"
                value={formatPercentage(workforceMetrics?.retention?.retentionRate / 100)}
                change="-1.5%"
                changeType="decrease"
                icon={ShieldCheckIcon}
                color="orange"
                subtitle="Employee satisfaction"
                trend={-1.5}
              />
            </div>

            {/* Department Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Headcount by Department */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Headcount by Department
                </h3>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: ['Engineering', 'Sales', 'Marketing', 'Operations', 'Support'],
                      datasets: [
                        {
                          label: 'Current',
                          data: [45, 25, 20, 15, 20],
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(249, 115, 22, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(236, 72, 153, 0.8)'
                          ],
                          borderColor: [
                            'rgb(59, 130, 246)',
                            'rgb(16, 185, 129)',
                            'rgb(249, 115, 22)',
                            'rgb(139, 92, 246)',
                            'rgb(236, 72, 153)'
                          ],
                          borderWidth: 2
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 10
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Performance Distribution */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <StarIcon className="h-5 w-5 mr-2 text-yellow-500" />
                  Performance Distribution
                </h3>
                <div className="h-64">
                  <Doughnut
                    data={{
                      labels: ['Top Performers', 'High Performers', 'Average', 'Below Average', 'Needs Improvement'],
                      datasets: [
                        {
                          data: [15, 35, 35, 12, 3],
                          backgroundColor: [
                            'rgba(34, 197, 94, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(249, 115, 22, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(107, 114, 128, 0.8)'
                          ],
                          borderWidth: 2,
                          borderColor: '#ffffff'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-green-600" />
                Recent Workforce Activities
              </h3>
              <div className="space-y-4">
                {[
                  { type: 'hire', name: 'Sarah Johnson', department: 'Engineering', time: '2 hours ago', icon: UsersIcon, color: 'green' },
                  { type: 'promotion', name: 'Michael Chen', department: 'Sales', time: '1 day ago', icon: ArrowTrendingUpIcon, color: 'blue' },
                  { type: 'resignation', name: 'Alex Rodriguez', department: 'Marketing', time: '3 days ago', icon: ArrowTrendingDownIcon, color: 'red' },
                  { type: 'performance', name: 'Emma Davis', department: 'Operations', time: '1 week ago', icon: StarIcon, color: 'yellow' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${activity.color}-100`}>
                      <activity.icon className={`h-5 w-5 text-${activity.color}-600`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type === 'hire' && `${activity.name} joined ${activity.department}`}
                        {activity.type === 'promotion' && `${activity.name} was promoted in ${activity.department}`}
                        {activity.type === 'resignation' && `${activity.name} left ${activity.department}`}
                        {activity.type === 'performance' && `${activity.name} received performance review`}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Productivity Tab */}
        {activeView === 'productivity' && (
          <div className="space-y-8">
            {/* Productivity Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricCard
                title="Billable Hours"
                value="8,500"
                change="+320"
                changeType="increase"
                icon={ClockIcon}
                color="blue"
                subtitle="This month"
              />
              <MetricCard
                title="Revenue/Employee"
                value={formatCurrency(185000)}
                change="+8%"
                changeType="increase"
                icon={CurrencyDollarIcon}
                color="green"
                subtitle="Annual rate"
              />
              <MetricCard
                title="Efficiency Score"
                value="85%"
                change="+5%"
                changeType="increase"
                icon={ArrowTrendingUpIcon}
                color="purple"
                subtitle="Above target"
              />
              <MetricCard
                title="Project Delivery"
                value="96%"
                change="+2%"
                changeType="increase"
                icon={CheckCircleIcon}
                color="orange"
                subtitle="On-time rate"
              />
            </div>

            {/* Productivity Trends */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Productivity Trends</h3>
              <div className="h-80">
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                      {
                        label: 'Billable Hours',
                        data: [7800, 8100, 8300, 8200, 8400, 8500],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                      },
                      {
                        label: 'Efficiency Score',
                        data: [78, 82, 85, 83, 87, 85],
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y1'
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      mode: 'index',
                      intersect: false
                    },
                    plugins: {
                      legend: { position: 'top' }
                    },
                    scales: {
                      x: { display: true },
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left'
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { drawOnChartArea: false }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly... */}
        {/* This is a comprehensive foundation for the workforce analytics dashboard */}
      </div>
    </div>
  );
};

export default WorkforceAnalyticsDashboard;
