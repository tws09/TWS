import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../../../app/providers/AuthContext';
import { useTheme } from '../../../../../../app/providers/ThemeContext';
import { useSocket } from '../../../../../../app/providers/SocketContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  ChartPieIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalculatorIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  CalendarIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  InformationCircleIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import CapTableGrid from '../../../../../../features/finance/components/Equity/CapTableGrid';
import DilutionSimulator from '../../../../../../features/finance/components/Equity/DilutionSimulator';
import VestingSchedule from '../../../../../../features/finance/components/Equity/VestingSchedule';
import OptionPoolManagement from '../../../../../../features/finance/components/Equity/OptionPoolManagement';

const EquityCapTable = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [capTable, setCapTable] = useState([]);
  const [capTableSummary, setCapTableSummary] = useState(null);
  const [fullyDiluted, setFullyDiluted] = useState(null);
  const [shareClasses, setShareClasses] = useState([]);
  const [equityHolders, setEquityHolders] = useState([]);
  const [optionPools, setOptionPools] = useState([]);
  const [vestingSchedules, setVestingSchedules] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const refreshIntervalRef = useRef(null);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6', '#84cc16', '#f97316'];

  // Role-based permissions
  const userRole = user?.role || 'employee';
  const isFinanceAdmin = ['owner', 'admin', 'finance_manager'].includes(userRole);
  const canWrite = isFinanceAdmin;

  useEffect(() => {
    fetchAllData();
    
    // Set up WebSocket subscription for real-time updates
    if (socket && isConnected) {
      socket.emit('equity:subscribe');
      
      socket.on('equity:data-updated', (data) => {
        console.log('Equity data updated via WebSocket:', data);
        fetchAllData();
      });
    }

    // Fallback polling
    refreshIntervalRef.current = setInterval(() => {
      if (!isConnected) {
        fetchAllData();
      }
    }, 30000);

    return () => {
      if (socket && isConnected) {
        socket.emit('equity:unsubscribe');
        socket.off('equity:data-updated');
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [socket, isConnected]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [
        dashboardRes,
        capTableRes,
        shareClassesRes,
        holdersRes,
        poolsRes,
        schedulesRes
      ] = await Promise.all([
        axios.get('/api/equity/dashboard'),
        axios.get('/api/equity/cap-table?includeOptions=true&includeConvertibles=true'),
        axios.get('/api/equity/share-classes'),
        axios.get('/api/equity/holders'),
        axios.get('/api/equity/option-pools'),
        axios.get('/api/equity/vesting-schedules')
      ]);

      if (dashboardRes.data.success) {
        setDashboardData(dashboardRes.data.data);
        setRecentActivity(dashboardRes.data.data.recentActivity || []);
      }

      if (capTableRes.data.success) {
        setCapTable(capTableRes.data.data.capTable);
        setCapTableSummary(capTableRes.data.data.summary);
        setFullyDiluted(capTableRes.data.data.fullyDiluted);
      }

      if (shareClassesRes.data.success) {
        setShareClasses(shareClassesRes.data.data.shareClasses);
      }

      if (holdersRes.data.success) {
        setEquityHolders(holdersRes.data.data.holders);
      }

      if (poolsRes.data.success) {
        setOptionPools(poolsRes.data.data.pools);
      }

      if (schedulesRes.data.success) {
        setVestingSchedules(schedulesRes.data.data.schedules);
      }

      // Generate alerts
      generateAlerts(dashboardRes.data.data);
    } catch (error) {
      console.error('Error fetching equity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = (data) => {
    const newAlerts = [];
    
    if (data?.summary) {
      const { totalOptionPools, grantedOptions, availableOptions } = data.summary;
      const utilization = totalOptionPools > 0 ? (grantedOptions / totalOptionPools) * 100 : 0;
      
      if (utilization > 90) {
        newAlerts.push({
          id: 'option-pool-high',
          severity: 'high',
          message: `Option pool utilization is ${utilization.toFixed(1)}%. Consider creating a new pool.`,
          type: 'option_pool'
        });
      } else if (utilization > 70) {
        newAlerts.push({
          id: 'option-pool-medium',
          severity: 'medium',
          message: `Option pool utilization is ${utilization.toFixed(1)}%. Monitor closely.`,
          type: 'option_pool'
        });
      }

      if (availableOptions < totalOptionPools * 0.1) {
        newAlerts.push({
          id: 'option-pool-low',
          severity: 'medium',
          message: `Only ${availableOptions.toLocaleString()} options remaining in pool.`,
          type: 'option_pool'
        });
      }
    }

    // Check for upcoming vesting milestones
    if (vestingSchedules.length > 0) {
      const upcomingVesting = vestingSchedules.filter(schedule => {
        if (schedule.vestingInfo) {
          const nextVest = schedule.vestingInfo.nextVestDate;
          if (nextVest) {
            const daysUntil = Math.ceil((new Date(nextVest) - new Date()) / (1000 * 60 * 60 * 24));
            return daysUntil > 0 && daysUntil <= 30;
          }
        }
        return false;
      });

      if (upcomingVesting.length > 0) {
        newAlerts.push({
          id: 'upcoming-vesting',
          severity: 'low',
          message: `${upcomingVesting.length} vesting schedule(s) have upcoming milestones.`,
          type: 'vesting'
        });
      }
    }

    setAlerts(newAlerts);
  };

  const handleSeedData = async () => {
    if (!window.confirm('This will create sample equity data. Continue?')) {
      return;
    }

    try {
      const response = await axios.post('/api/equity/seed');
      if (response.data.success) {
        alert('Sample equity data created successfully!');
        fetchAllData();
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Error creating sample data. It may already exist.');
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await axios.get(`/api/equity/cap-table/export?format=${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cap-table.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting cap table:', error);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};
  const totalShares = capTableSummary?.totalShares || 0;
  const totalHolders = capTableSummary?.totalHolders || 0;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50/30'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="wolfstack-card-glass wolfstack-animate-fadeIn mb-6" style={{ animationDelay: '0s' }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="wolfstack-heading-1 text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <ChartPieIcon className="h-8 w-8 text-white" />
                  </div>
                  Equity & Cap Table
                </h1>
                <p className="wolfstack-text-body text-gray-600 dark:text-gray-400">
                  Comprehensive equity management, ownership tracking, and dilution analysis
                </p>
              </div>
              <div className="flex items-center gap-3">
                {canWrite && (
                  <button
                    onClick={handleSeedData}
                    className="wolfstack-button-secondary px-4 py-2 flex items-center gap-2 text-sm"
                  >
                    <SparklesIcon className="h-5 w-5" />
                    Seed Data
                  </button>
                )}
                <div className="relative group">
                  <button
                    onClick={() => handleExport('csv')}
                    className="wolfstack-button-primary px-4 py-2 flex items-center space-x-2 text-sm"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span>Export</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      <span>Export as CSV</span>
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      <span>Export as JSON</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Bar */}
        {alerts.length > 0 && (
          <div className="wolfstack-card-glass wolfstack-animate-fadeIn mb-6" style={{ animationDelay: '0.1s' }}>
            <div className="p-4 space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl flex items-center space-x-3 backdrop-blur-sm ${
                    alert.severity === 'high'
                      ? 'bg-red-50/80 dark:bg-red-900/30 border border-red-200/60 dark:border-red-800/60'
                      : alert.severity === 'medium'
                      ? 'bg-yellow-50/80 dark:bg-yellow-900/30 border border-yellow-200/60 dark:border-yellow-800/60'
                      : 'bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-800/60'
                  }`}
                >
                  <ExclamationTriangleIcon
                    className={`h-5 w-5 ${
                      alert.severity === 'high'
                        ? 'text-red-600 dark:text-red-400'
                        : alert.severity === 'medium'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white wolfstack-text-body">
                    {alert.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Cards Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {/* Total Shares */}
          <div className="wolfstack-stats-card-premium wolfstack-hover-lift cursor-pointer wolfstack-animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <BanknotesIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="wolfstack-text-caption text-gray-600 dark:text-gray-400 mb-1">Total Shares</p>
                <p className="wolfstack-heading-2 text-gray-900 dark:text-white">
                  {totalShares.toLocaleString()}
                </p>
                <p className="wolfstack-text-caption text-gray-500 dark:text-gray-500 mt-1">
                  Outstanding
                </p>
              </div>
            </div>
          </div>

          {/* Equity Holders */}
          <div className="wolfstack-stats-card-premium wolfstack-hover-lift cursor-pointer wolfstack-animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="wolfstack-text-caption text-gray-600 dark:text-gray-400 mb-1">Equity Holders</p>
                <p className="wolfstack-heading-2 text-gray-900 dark:text-white">
                  {totalHolders}
                </p>
                <p className="wolfstack-text-caption text-gray-500 dark:text-gray-500 mt-1">
                  Active holders
                </p>
              </div>
            </div>
          </div>

          {/* Option Pools */}
          <div className="wolfstack-stats-card-premium wolfstack-hover-lift cursor-pointer wolfstack-animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <ChartPieIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="wolfstack-text-caption text-gray-600 dark:text-gray-400 mb-1">Option Pools</p>
                <p className="wolfstack-heading-2 text-gray-900 dark:text-white">
                  {summary.totalOptionPools?.toLocaleString() || '0'}
                </p>
                <p className="wolfstack-text-caption text-gray-500 dark:text-gray-500 mt-1">
                  {summary.grantedOptions ? `${((summary.grantedOptions / summary.totalOptionPools) * 100).toFixed(1)}% utilized` : '0% utilized'}
                </p>
              </div>
            </div>
          </div>

          {/* Vesting Schedules */}
          <div className="wolfstack-stats-card-premium wolfstack-hover-lift cursor-pointer wolfstack-animate-fadeIn" style={{ animationDelay: '0.5s' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="wolfstack-text-caption text-gray-600 dark:text-gray-400 mb-1">Vesting Schedules</p>
                <p className="wolfstack-heading-2 text-gray-900 dark:text-white">
                  {summary.activeVestingSchedules || 0}
                </p>
                <p className="wolfstack-text-caption text-gray-500 dark:text-gray-500 mt-1">
                  Active schedules
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ownership Distribution Chart */}
        {capTable.length > 0 && (
          <div className="wolfstack-card-premium wolfstack-animate-fadeIn mb-6" style={{ animationDelay: '0.6s' }}>
            <div className="p-6">
              <h2 className="wolfstack-heading-3 text-gray-900 dark:text-white mb-6 flex items-center">
                <ChartPieIcon className="h-6 w-6 mr-2 text-purple-600 dark:text-purple-400" />
                Ownership Distribution
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={capTable}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ holderName, ownershipPercent }) => 
                      `${holderName}: ${ownershipPercent}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="ownershipPercent"
                  >
                    {capTable.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value}%`}
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                      border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="wolfstack-card-glass wolfstack-animate-fadeIn mb-6" style={{ animationDelay: '0.7s' }}>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                { id: 'cap-table', label: 'Cap Table', icon: DocumentTextIcon },
                { id: 'dilution', label: 'Dilution Simulator', icon: CalculatorIcon },
                { id: 'vesting', label: 'Vesting Schedules', icon: CalendarIcon },
                { id: 'option-pools', label: 'Option Pools', icon: ChartPieIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="wolfstack-animate-fadeIn" style={{ animationDelay: '0.8s' }}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Activity */}
              {recentActivity.length > 0 && (
                <div className="wolfstack-card-premium">
                  <div className="p-6">
                    <h3 className="wolfstack-heading-3 text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {recentActivity.map((activity, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {activity.holderId?.name || 'Unknown'} - {activity.numberOfShares.toLocaleString()} shares
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {activity.shareClassId?.name || 'Unknown class'} • {new Date(activity.issueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              activity.status === 'issued' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              activity.status === 'vested' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="wolfstack-card-premium">
                  <div className="p-6">
                    <h3 className="wolfstack-heading-4 text-gray-900 dark:text-white mb-4">Share Classes</h3>
                    <p className="wolfstack-heading-2 text-purple-600 dark:text-purple-400">
                      {shareClasses.length}
                    </p>
                    <p className="wolfstack-text-caption text-gray-500 dark:text-gray-400 mt-1">
                      Active share classes
                    </p>
                  </div>
                </div>

                <div className="wolfstack-card-premium">
                  <div className="p-6">
                    <h3 className="wolfstack-heading-4 text-gray-900 dark:text-white mb-4">Total Issuances</h3>
                    <p className="wolfstack-heading-2 text-blue-600 dark:text-blue-400">
                      {summary.totalIssuances || 0}
                    </p>
                    <p className="wolfstack-text-caption text-gray-500 dark:text-gray-400 mt-1">
                      Share issuances
                    </p>
                  </div>
                </div>

                <div className="wolfstack-card-premium">
                  <div className="p-6">
                    <h3 className="wolfstack-heading-4 text-gray-900 dark:text-white mb-4">Available Options</h3>
                    <p className="wolfstack-heading-2 text-green-600 dark:text-green-400">
                      {summary.availableOptions?.toLocaleString() || '0'}
                    </p>
                    <p className="wolfstack-text-caption text-gray-500 dark:text-gray-400 mt-1">
                      Options available for grant
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cap-table' && (
            <CapTableGrid
              capTable={capTable}
              shareClasses={shareClasses}
              equityHolders={equityHolders}
              onRefresh={fetchAllData}
            />
          )}

          {activeTab === 'dilution' && (
            <DilutionSimulator
              currentHoldings={capTable}
              onSimulate={fetchAllData}
            />
          )}

          {activeTab === 'vesting' && (
            <VestingSchedule
              schedules={vestingSchedules}
              onRefresh={fetchAllData}
            />
          )}

          {activeTab === 'option-pools' && (
            <OptionPoolManagement
              pools={optionPools}
              shareClasses={shareClasses}
              onRefresh={fetchAllData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EquityCapTable;
