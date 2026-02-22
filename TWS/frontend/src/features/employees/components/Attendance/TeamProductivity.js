import React, { useState, useEffect } from 'react';
import { 
  BoltIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  CalendarIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

const TeamProductivity = ({ timeRange, filters }) => {
  const [productivityMetrics, setProductivityMetrics] = useState({
    overall: { score: 0, trend: 'up', change: 0 },
    byDepartment: [],
    byLocation: [],
    byWorkMode: [],
    topPerformers: [],
    improvementAreas: []
  });

  const [teamInsights, setTeamInsights] = useState({
    collaboration: { score: 0, trend: 'up' },
    efficiency: { score: 0, trend: 'up' },
    engagement: { score: 0, trend: 'up' },
    workLifeBalance: { score: 0, trend: 'up' }
  });

  const [productivityFactors, setProductivityFactors] = useState([]);

  useEffect(() => {
    fetchProductivityData();
  }, [timeRange, filters]);

  const fetchProductivityData = async () => {
    try {
      // Simulate API call - replace with actual endpoint
      const mockData = {
        productivityMetrics: {
          overall: { score: 82, trend: 'up', change: 5 },
          byDepartment: [
            { department: 'Engineering', score: 89, trend: 'up', change: 7 },
            { department: 'Marketing', score: 78, trend: 'up', change: 3 },
            { department: 'Sales', score: 85, trend: 'down', change: -2 },
            { department: 'HR', score: 91, trend: 'up', change: 4 },
            { department: 'Finance', score: 87, trend: 'up', change: 6 }
          ],
          byLocation: [
            { location: 'Headquarters', score: 85, trend: 'up', change: 4 },
            { location: 'Branch Office 1', score: 79, trend: 'up', change: 6 },
            { location: 'Branch Office 2', score: 88, trend: 'down', change: -1 },
            { location: 'Remote', score: 83, trend: 'up', change: 8 }
          ],
          byWorkMode: [
            { mode: 'Office', score: 84, trend: 'up', change: 3 },
            { mode: 'Remote', score: 81, trend: 'up', change: 7 },
            { mode: 'Hybrid', score: 87, trend: 'up', change: 5 }
          ],
          topPerformers: [
            { name: 'Sarah Johnson', department: 'Engineering', score: 95, improvement: 12 },
            { name: 'Mike Chen', department: 'Marketing', score: 92, improvement: 8 },
            { name: 'Emily Davis', department: 'HR', score: 94, improvement: 15 },
            { name: 'David Wilson', department: 'Finance', score: 91, improvement: 6 },
            { name: 'Lisa Brown', department: 'Sales', score: 89, improvement: 9 }
          ],
          improvementAreas: [
            { area: 'Meeting Efficiency', current: 65, target: 80, impact: 'high' },
            { area: 'Focus Time', current: 70, target: 85, impact: 'medium' },
            { area: 'Collaboration', current: 75, target: 90, impact: 'high' },
            { area: 'Work-Life Balance', current: 68, target: 80, impact: 'medium' }
          ]
        },
        teamInsights: {
          collaboration: { score: 78, trend: 'up' },
          efficiency: { score: 82, trend: 'up' },
          engagement: { score: 85, trend: 'up' },
          workLifeBalance: { score: 73, trend: 'up' }
        },
        productivityFactors: [
          { factor: 'Flexible Hours', impact: 15, description: 'Allows better work-life balance' },
          { factor: 'Remote Work', impact: 12, description: 'Reduces commute stress' },
          { factor: 'Team Collaboration', impact: 18, description: 'Improves project outcomes' },
          { factor: 'Clear Goals', impact: 20, description: 'Provides direction and focus' },
          { factor: 'Regular Feedback', impact: 14, description: 'Enables continuous improvement' }
        ]
      };

      setProductivityMetrics(mockData.productivityMetrics);
      setTeamInsights(mockData.teamInsights);
      setProductivityFactors(mockData.productivityFactors);
    } catch (error) {
      console.error('Error fetching productivity data:', error);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="h-4 w-4 text-gray-600" />;
      case 'down': return <ArrowTrendingDownIcon className="h-4 w-4 text-gray-600" />;
      default: return <MinusIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-gray-800';
      case 'down': return 'text-gray-600';
      default: return 'text-gray-700';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-gray-800 bg-gray-100';
    if (score >= 80) return 'text-gray-800 bg-gray-200';
    if (score >= 70) return 'text-gray-800 bg-gray-300';
    return 'text-gray-800 bg-gray-400';
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-gray-800 bg-gray-300';
      case 'medium': return 'text-gray-800 bg-gray-200';
      case 'low': return 'text-gray-800 bg-gray-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Team Productivity Analytics</h2>
          <p className="text-sm text-gray-600">Comprehensive productivity insights and optimization recommendations</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center px-3 py-1.5 bg-gray-100 rounded">
            <BoltIcon className="h-4 w-4 text-gray-600 mr-2" />
            <span className="text-xs text-gray-600">Productivity Score: {productivityMetrics.overall.score}</span>
          </div>
        </div>
      </div>

      {/* Overall Productivity Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(teamInsights).map(([key, insight]) => (
          <div key={key} className="border border-gray-200 rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              {getTrendIcon(insight.trend)}
            </div>
            <div className="text-2xl font-semibold text-gray-900">{insight.score}</div>
            <div className="text-xs text-gray-600">Productivity Score</div>
          </div>
        ))}
      </div>

      {/* Department Performance */}
      <div className="border border-gray-200 rounded p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Department Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {productivityMetrics.byDepartment.map((dept, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium text-gray-900">{dept.department}</div>
              <div className="text-lg font-semibold text-gray-900 mt-1">{dept.score}</div>
              <div className="flex items-center justify-center mt-2">
                {getTrendIcon(dept.trend)}
                <span className={`text-xs ml-1 ${getTrendColor(dept.trend)}`}>
                  {dept.change > 0 ? '+' : ''}{dept.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Work Mode Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Location */}
        <div className="border border-gray-200 rounded p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Performance by Location</h3>
          <div className="space-y-3">
            {productivityMetrics.byLocation.map((location, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{location.location}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-900 mr-2">{location.score}</span>
                  {getTrendIcon(location.trend)}
                  <span className={`text-xs ml-1 ${getTrendColor(location.trend)}`}>
                    {location.change > 0 ? '+' : ''}{location.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Work Mode */}
        <div className="border border-gray-200 rounded p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Performance by Work Mode</h3>
          <div className="space-y-3">
            {productivityMetrics.byWorkMode.map((mode, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  {mode.mode === 'Remote' ? (
                    <HomeIcon className="h-4 w-4 text-gray-600 mr-2" />
                  ) : mode.mode === 'Hybrid' ? (
                    <DevicePhoneMobileIcon className="h-4 w-4 text-gray-600 mr-2" />
                  ) : (
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-600 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-900">{mode.mode}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-900 mr-2">{mode.score}</span>
                  {getTrendIcon(mode.trend)}
                  <span className={`text-xs ml-1 ${getTrendColor(mode.trend)}`}>
                    {mode.change > 0 ? '+' : ''}{mode.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="border border-gray-200 rounded p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Top Performers</h3>
        <div className="space-y-2">
          {productivityMetrics.topPerformers.map((performer, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xs font-medium text-gray-700">
                    {performer.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{performer.name}</div>
                  <div className="text-xs text-gray-500">{performer.department}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{performer.score}</div>
                <div className="text-xs text-gray-500">+{performer.improvement}% improvement</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Areas */}
      <div className="border border-gray-200 rounded p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Improvement Areas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productivityMetrics.improvementAreas.map((area, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{area.area}</span>
                <span className={`text-xs px-2 py-1 rounded ${getImpactColor(area.impact)}`}>
                  {area.impact}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Current: {area.current}%</span>
                <span className="text-xs text-gray-600">Target: {area.target}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-600 h-2 rounded-full" 
                  style={{ width: `${(area.current / area.target) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Productivity Factors */}
      <div className="border border-gray-200 rounded p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Key Productivity Factors</h3>
        <div className="space-y-3">
          {productivityFactors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{factor.factor}</div>
                <div className="text-xs text-gray-600">{factor.description}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">+{factor.impact}%</div>
                <div className="text-xs text-gray-500">Impact</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="border border-gray-200 rounded p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">AI Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <div className="flex items-center mb-2">
              <BoltIcon className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Optimize Meeting Times</span>
            </div>
            <p className="text-xs text-gray-700">
              Schedule important meetings between 10 AM - 2 PM for maximum productivity.
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="flex items-center mb-2">
              <UserGroupIcon className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Enhance Collaboration</span>
            </div>
            <p className="text-xs text-gray-700">
              Implement weekly team check-ins to improve collaboration scores by 15%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamProductivity;
