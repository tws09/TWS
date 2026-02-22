import React, { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  CpuChipIcon,
  BoltIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const AttendanceForecasting = ({ timeRange }) => {
  const [forecasts, setForecasts] = useState({
    attendanceRate: { current: 0, predicted: 0, trend: 'up', confidence: 0 },
    punctuality: { current: 0, predicted: 0, trend: 'up', confidence: 0 },
    productivity: { current: 0, predicted: 0, trend: 'up', confidence: 0 },
    remoteWork: { current: 0, predicted: 0, trend: 'up', confidence: 0 },
    overtime: { current: 0, predicted: 0, trend: 'down', confidence: 0 },
    absenteeism: { current: 0, predicted: 0, trend: 'down', confidence: 0 }
  });

  const [predictions, setPredictions] = useState({
    weekly: [],
    monthly: [],
    quarterly: []
  });

  const [seasonalPatterns, setSeasonalPatterns] = useState([]);
  const [riskFactors, setRiskFactors] = useState([]);

  useEffect(() => {
    fetchForecastingData();
  }, [timeRange]);

  const fetchForecastingData = async () => {
    try {
      // Simulate API call - replace with actual endpoint
      const mockData = {
        forecasts: {
          attendanceRate: { current: 87, predicted: 91, trend: 'up', confidence: 89 },
          punctuality: { current: 82, predicted: 85, trend: 'up', confidence: 85 },
          productivity: { current: 78, predicted: 83, trend: 'up', confidence: 82 },
          remoteWork: { current: 45, predicted: 52, trend: 'up', confidence: 88 },
          overtime: { current: 12, predicted: 8, trend: 'down', confidence: 75 },
          absenteeism: { current: 8, predicted: 6, trend: 'down', confidence: 80 }
        },
        predictions: {
          weekly: [
            { date: '2024-01-15', attendance: 89, productivity: 82, confidence: 85 },
            { date: '2024-01-16', attendance: 91, productivity: 84, confidence: 87 },
            { date: '2024-01-17', attendance: 88, productivity: 81, confidence: 83 },
            { date: '2024-01-18', attendance: 92, productivity: 85, confidence: 89 },
            { date: '2024-01-19', attendance: 87, productivity: 83, confidence: 86 }
          ],
          monthly: [
            { month: 'Jan 2024', attendance: 89, productivity: 83, confidence: 87 },
            { month: 'Feb 2024', attendance: 91, productivity: 85, confidence: 89 },
            { month: 'Mar 2024', attendance: 88, productivity: 82, confidence: 85 },
            { month: 'Apr 2024', attendance: 90, productivity: 84, confidence: 88 }
          ],
          quarterly: [
            { quarter: 'Q1 2024', attendance: 89, productivity: 83, confidence: 87 },
            { quarter: 'Q2 2024', attendance: 91, productivity: 85, confidence: 89 },
            { quarter: 'Q3 2024', attendance: 88, productivity: 82, confidence: 85 },
            { quarter: 'Q4 2024', attendance: 90, productivity: 84, confidence: 88 }
          ]
        },
        seasonalPatterns: [
          { period: 'Monday', attendance: 85, productivity: 80, trend: 'down' },
          { period: 'Tuesday', attendance: 92, productivity: 85, trend: 'up' },
          { period: 'Wednesday', attendance: 90, productivity: 83, trend: 'stable' },
          { period: 'Thursday', attendance: 88, productivity: 82, trend: 'down' },
          { period: 'Friday', attendance: 85, productivity: 78, trend: 'down' }
        ],
        riskFactors: [
          { factor: 'Holiday Season', impact: 'high', probability: 85, mitigation: 'Flexible scheduling' },
          { factor: 'Weather Conditions', impact: 'medium', probability: 60, mitigation: 'Remote work options' },
          { factor: 'Project Deadlines', impact: 'high', probability: 90, mitigation: 'Overtime management' },
          { factor: 'Team Events', impact: 'low', probability: 30, mitigation: 'Event scheduling' }
        ]
      };

      setForecasts(mockData.forecasts);
      setPredictions(mockData.predictions);
      setSeasonalPatterns(mockData.seasonalPatterns);
      setRiskFactors(mockData.riskFactors);
    } catch (error) {
      console.error('Error fetching forecasting data:', error);
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

  const getConfidenceColor = (confidence) => {
    if (confidence >= 85) return 'text-gray-800 bg-gray-100';
    if (confidence >= 70) return 'text-gray-800 bg-gray-200';
    return 'text-gray-800 bg-gray-300';
  };

  const getRiskColor = (impact) => {
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
          <h2 className="text-lg font-semibold text-gray-900">Predictive Analytics</h2>
          <p className="text-sm text-gray-600">AI-powered attendance forecasting and trend analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center px-3 py-1.5 bg-gray-100 rounded">
            <CpuChipIcon className="h-4 w-4 text-gray-600 mr-2" />
            <span className="text-xs text-gray-600">ML Model Active</span>
          </div>
        </div>
      </div>

      {/* Forecast Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(forecasts).map(([key, forecast]) => (
          <div key={key} className="border border-gray-200 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              {getTrendIcon(forecast.trend)}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Current</span>
                <span className="text-sm font-semibold text-gray-900">{forecast.current}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Predicted</span>
                <span className={`text-sm font-semibold ${getTrendColor(forecast.trend)}`}>
                  {forecast.predicted}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Confidence</span>
                <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(forecast.confidence)}`}>
                  {forecast.confidence}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Predictions Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Predictions */}
        <div className="border border-gray-200 rounded p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Weekly Predictions</h3>
          <div className="space-y-2">
            {predictions.weekly.map((prediction, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(prediction.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-gray-600">
                    Attendance: {prediction.attendance}% | Productivity: {prediction.productivity}%
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded ${getConfidenceColor(prediction.confidence)}`}>
                    {prediction.confidence}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Predictions */}
        <div className="border border-gray-200 rounded p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Monthly Predictions</h3>
          <div className="space-y-2">
            {predictions.monthly.map((prediction, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <div className="text-sm font-medium text-gray-900">{prediction.month}</div>
                  <div className="text-xs text-gray-600">
                    Attendance: {prediction.attendance}% | Productivity: {prediction.productivity}%
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded ${getConfidenceColor(prediction.confidence)}`}>
                    {prediction.confidence}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seasonal Patterns */}
      <div className="border border-gray-200 rounded p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Seasonal Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {seasonalPatterns.map((pattern, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium text-gray-900">{pattern.period}</div>
              <div className="text-xs text-gray-600 mt-1">
                Attendance: {pattern.attendance}%
              </div>
              <div className="text-xs text-gray-600">
                Productivity: {pattern.productivity}%
              </div>
              <div className="flex items-center justify-center mt-2">
                {getTrendIcon(pattern.trend)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors */}
      <div className="border border-gray-200 rounded p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Risk Factors & Mitigation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskFactors.map((risk, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{risk.factor}</span>
                <span className={`text-xs px-2 py-1 rounded ${getRiskColor(risk.impact)}`}>
                  {risk.impact}
                </span>
              </div>
              <div className="text-xs text-gray-600 mb-2">
                Probability: {risk.probability}%
              </div>
              <div className="text-xs text-gray-700">
                <strong>Mitigation:</strong> {risk.mitigation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="border border-gray-200 rounded p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">AI Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <div className="flex items-center mb-2">
              <BoltIcon className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Optimization Opportunity</span>
            </div>
            <p className="text-xs text-gray-700">
              Implementing flexible work hours could increase attendance by 8% and productivity by 12%.
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="flex items-center mb-2">
              <UserGroupIcon className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Team Performance</span>
            </div>
            <p className="text-xs text-gray-700">
              Engineering team shows 15% higher productivity on Tuesdays and Wednesdays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceForecasting;
