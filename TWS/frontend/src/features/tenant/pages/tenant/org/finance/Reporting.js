import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChartPieIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  UserGroupIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { tenantApiService } from '../../../../../../shared/services/tenant/tenant-api.service';

const Reporting = () => {
  const { tenantSlug } = useParams();
  const [reports, setReports] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReports();
  }, [tenantSlug]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Available reports for software houses
      const availableReports = [
        {
          id: 'profit-loss',
          name: 'Profit & Loss Statement',
          description: 'Revenue, expenses, and net profit for the selected period',
          icon: ChartBarIcon,
          category: 'Financial Statements',
          frequency: 'monthly'
        },
        {
          id: 'balance-sheet',
          name: 'Balance Sheet',
          description: 'Assets, liabilities, and equity at a specific point in time',
          icon: DocumentTextIcon,
          category: 'Financial Statements',
          frequency: 'monthly'
        },
        {
          id: 'cash-flow',
          name: 'Cash Flow Statement',
          description: 'Cash inflows and outflows from operating, investing, and financing activities',
          icon: CurrencyDollarIcon,
          category: 'Financial Statements',
          frequency: 'monthly'
        },
        {
          id: 'project-profitability',
          name: 'Project Profitability Report',
          description: 'Revenue, costs, and margins for each project',
          icon: ChartPieIcon,
          category: 'Project Reports',
          frequency: 'weekly'
        },
        {
          id: 'client-analysis',
          name: 'Client Analysis Report',
          description: 'Revenue and profitability by client',
          icon: UserGroupIcon,
          category: 'Client Reports',
          frequency: 'monthly'
        },
        {
          id: 'time-tracking',
          name: 'Time Tracking Report',
          description: 'Hours logged by employee and project',
          icon: ClockIcon,
          category: 'Time Reports',
          frequency: 'weekly'
        },
        {
          id: 'expense-analysis',
          name: 'Expense Analysis',
          description: 'Expenses by category and project',
          icon: ArrowTrendingDownIcon,
          category: 'Expense Reports',
          frequency: 'monthly'
        },
        {
          id: 'revenue-trends',
          name: 'Revenue Trends',
          description: 'Revenue growth and trends over time',
          icon: ArrowTrendingUpIcon,
          category: 'Trend Reports',
          frequency: 'monthly'
        }
      ];

      setReports(availableReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportId) => {
    try {
      setLoading(true);
      setSelectedReport(reportId);
      
      // Fetch report data from API
      const reportDataResponse = await tenantApiService.generateFinanceReport(
        tenantSlug, 
        reportId, 
        dateRange.startDate, 
        dateRange.endDate
      );
      
      setReportData(reportDataResponse || {
        title: 'Report Generated',
        period: `${dateRange.startDate} to ${dateRange.endDate}`,
        message: 'Report data will be available here'
      });
    } catch (error) {
      console.error('Error generating report:', error);
      // Fallback to mock data if API fails
      setReportData({
        title: 'Report Generated',
        period: `${dateRange.startDate} to ${dateRange.endDate}`,
        message: 'Report data will be available here'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      await tenantApiService.exportFinanceReport(
        tenantSlug,
        selectedReport,
        format,
        dateRange.startDate,
        dateRange.endDate
      );
    } catch (error) {
      console.error(`Error exporting report as ${format}:`, error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Financial Statements': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Project Reports': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Client Reports': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'Time Reports': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'Expense Reports': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'Trend Reports': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-card-premium">
        <div className="px-6 py-8 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl xl:text-3xl font-bold font-heading text-gray-900 dark:text-white">
                Financial Reports & Analytics 📊
              </h1>
              <p className="mt-2 text-sm xl:text-base text-gray-600 dark:text-gray-300">
                Generate comprehensive financial reports and insights for your software house
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  Financial Statements
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  Project Analytics
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  Export Options
                </span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <ChartPieIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="glass-input px-4 py-2 rounded-xl text-sm font-medium"
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="glass-input px-4 py-2 rounded-xl text-sm font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
        {reports.map((report, index) => {
          const Icon = report.icon;
          return (
            <div 
              key={report.id} 
              className="glass-card-premium p-6 rounded-xl hover-lift transition-all duration-200"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getCategoryColor(report.category)}`}>
                    {report.category}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{report.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Frequency: {report.frequency}</span>
                <button
                  onClick={() => generateReport(report.id)}
                  className="glass-button px-3 py-2 rounded-xl hover-scale flex items-center gap-2 text-sm bg-gradient-to-r from-primary-500 to-accent-500 text-white"
                  disabled={loading}
                >
                  <EyeIcon className="h-4 w-4" />
                  Generate
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="glass-card-premium">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white">{reportData.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Period: {reportData.period}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => exportReport('PDF')}
                  className="glass-button px-3 py-2 rounded-xl hover-scale flex items-center gap-2 text-sm bg-gradient-to-r from-red-500 to-rose-600 text-white"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  PDF
                </button>
                <button
                  onClick={() => exportReport('Excel')}
                  className="glass-button px-3 py-2 rounded-xl hover-scale flex items-center gap-2 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Excel
                </button>
                <button
                  onClick={() => exportReport('CSV')}
                  className="glass-button px-3 py-2 rounded-xl hover-scale flex items-center gap-2 text-sm"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  CSV
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Generating report...</p>
                </div>
              </div>
            ) : (
              <>
                {selectedReport === 'profit-loss' && reportData.revenue && (
                  <div className="space-y-6">
                    {/* Revenue Section */}
                    <div>
                      <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">Revenue</h3>
                      <div className="glass-card rounded-xl p-4 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-medium text-green-800 dark:text-green-400">Total Revenue</span>
                          <span className="text-2xl font-bold text-green-800 dark:text-green-400">{formatCurrency(reportData.revenue.total)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {reportData.revenue.breakdown?.map((item, index) => (
                          <div key={index} className="glass-card flex justify-between items-center py-3 px-4 rounded-lg">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{item.category}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expenses Section */}
                    <div>
                      <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">Expenses</h3>
                      <div className="glass-card rounded-xl p-4 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-medium text-red-800 dark:text-red-400">Total Expenses</span>
                          <span className="text-2xl font-bold text-red-800 dark:text-red-400">{formatCurrency(reportData.expenses?.total || 0)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {reportData.expenses?.breakdown?.map((item, index) => (
                          <div key={index} className="glass-card flex justify-between items-center py-3 px-4 rounded-lg">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{item.category}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Net Profit */}
                    <div className="glass-card rounded-xl p-6">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-medium text-blue-800 dark:text-blue-400">Net Profit</span>
                        <span className="text-3xl font-bold text-blue-800 dark:text-blue-400">{formatCurrency(reportData.netProfit || 0)}</span>
                      </div>
                      {reportData.grossMargin !== undefined && (
                        <div className="mt-2">
                          <span className="text-sm text-blue-600 dark:text-blue-400">Gross Margin: {reportData.grossMargin}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedReport === 'project-profitability' && reportData.projects && (
                  <div className="space-y-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="glass-card">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Costs</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Margin</th>
                          </tr>
                        </thead>
                        <tbody className="glass-card divide-y divide-gray-200 dark:divide-gray-700">
                          {reportData.projects.map((project, index) => (
                            <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{project.client}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(project.revenue)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(project.costs)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm font-medium ${project.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {formatCurrency(project.profit)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm font-medium ${project.margin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {project.margin}%
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedReport === 'client-analysis' && reportData.clients && (
                  <div className="space-y-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="glass-card">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Projects</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Project Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Terms</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="glass-card divide-y divide-gray-200 dark:divide-gray-700">
                          {reportData.clients.map((client, index) => (
                            <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(client.revenue)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{client.projects}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(client.avgProjectValue)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{client.paymentTerms}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                                  {client.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedReport && !['profit-loss', 'project-profitability', 'client-analysis'].includes(selectedReport) && (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">{reportData.message || 'Report data will be displayed here'}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reporting;

