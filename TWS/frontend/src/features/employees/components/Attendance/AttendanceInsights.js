import React, { useState } from 'react';
import { 
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
  CpuChipIcon,
  BoltIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const AttendanceInsights = ({ insights }) => {
  const [selectedInsight, setSelectedInsight] = useState(null);

  const insightCategories = [
    {
      id: 'performance',
      title: 'Performance Insights',
      icon: BoltIcon,
      insights: insights.productivityInsights || [],
      color: 'bg-gray-100'
    },
    {
      id: 'alerts',
      title: 'Smart Alerts',
      icon: ExclamationTriangleIcon,
      insights: insights.attendanceAlerts || [],
      color: 'bg-gray-100'
    },
    {
      id: 'recommendations',
      title: 'AI Recommendations',
      icon: LightBulbIcon,
      insights: insights.recommendations || [],
      color: 'bg-gray-100'
    },
    {
      id: 'compliance',
      title: 'Compliance Insights',
      icon: CheckCircleIcon,
      insights: insights.complianceIssues || [],
      color: 'bg-gray-100'
    }
  ];

  const getInsightIcon = (type) => {
    switch (type) {
      case 'performance': return <BoltIcon className="h-5 w-5 text-gray-600" />;
      case 'alert': return <ExclamationTriangleIcon className="h-5 w-5 text-gray-600" />;
      case 'recommendation': return <LightBulbIcon className="h-5 w-5 text-gray-600" />;
      case 'compliance': return <CheckCircleIcon className="h-5 w-5 text-gray-600" />;
      default: return <CpuChipIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightPriority = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h2>
          <p className="text-sm text-gray-600">Intelligent analysis of your attendance patterns</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center px-3 py-1.5 bg-gray-100 rounded">
            <CpuChipIcon className="h-4 w-4 text-gray-600 mr-2" />
            <span className="text-xs text-gray-600">AI Active</span>
          </div>
        </div>
      </div>

      {/* Insight Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insightCategories.map((category) => (
          <div
            key={category.id}
            className={`p-4 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 ${selectedInsight === category.id ? 'ring-2 ring-gray-300' : ''}`}
            onClick={() => setSelectedInsight(selectedInsight === category.id ? null : category.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <category.icon className="h-5 w-5 text-gray-600" />
              <span className="text-xs text-gray-500">{category.insights.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900">{category.title}</h3>
            <p className="text-xs text-gray-600 mt-1">
              {category.insights.length > 0 ? `${category.insights.length} insights available` : 'No insights yet'}
            </p>
          </div>
        ))}
      </div>

      {/* Selected Category Insights */}
      {selectedInsight && (
        <div className="border border-gray-200 rounded p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {insightCategories.find(cat => cat.id === selectedInsight)?.title}
            </h3>
            <button
              onClick={() => setSelectedInsight(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            {insightCategories.find(cat => cat.id === selectedInsight)?.insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 border-l-4 rounded ${getInsightPriority(insight.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getInsightIcon(insight.type)}
                      <span className="ml-2 text-sm font-medium text-gray-900">{insight.title}</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded ${getInsightPriority(insight.priority)}`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {insight.timestamp}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    {insight.impact && (
                      <div className="text-sm font-semibold text-gray-900">{insight.impact}</div>
                    )}
                    {insight.trend && (
                      <div className="flex items-center text-xs text-gray-600">
                        {insight.trend === 'up' ? (
                          <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                        )}
                        {insight.trend}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div className="border border-gray-200 rounded p-6">
        <div className="flex items-center mb-4">
          <LightBulbIcon className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">AI Recommendations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center mb-2">
              <UserGroupIcon className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Team Optimization</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Consider adjusting work schedules for Engineering team to improve attendance rates by 15%.
            </p>
            <div className="text-xs text-gray-500">Confidence: 87%</div>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center mb-2">
              <CalendarIcon className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Schedule Adjustment</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Implement flexible hours for remote workers to reduce late arrivals by 23%.
            </p>
            <div className="text-xs text-gray-500">Confidence: 92%</div>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center mb-2">
              <ChartBarIcon className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Productivity Boost</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Introduce break reminders to increase productivity scores by 18%.
            </p>
            <div className="text-xs text-gray-500">Confidence: 78%</div>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center mb-2">
              <BoltIcon className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Performance Enhancement</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Implement gamification elements to improve overall engagement by 25%.
            </p>
            <div className="text-xs text-gray-500">Confidence: 85%</div>
          </div>
        </div>
      </div>

      {/* Insight Summary */}
      <div className="border border-gray-200 rounded p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Insight Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-semibold text-gray-900">
              {insights.productivityInsights?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Performance Insights</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-semibold text-gray-900">
              {insights.attendanceAlerts?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Active Alerts</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-semibold text-gray-900">
              {insights.recommendations?.length || 0}
            </div>
            <div className="text-sm text-gray-600">AI Recommendations</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceInsights;
