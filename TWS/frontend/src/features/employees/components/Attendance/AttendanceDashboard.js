import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../app/providers/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ClockIcon, 
  MapPinIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon as TimeIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';
import AttendanceCheckInOut from './AttendanceCheckInOut';
import AttendanceAnalytics from './AttendanceAnalytics';
import AttendanceSecurity from './AttendanceSecurity';
import AttendanceReports from './AttendanceReports';
import BiometricEnrollment from './BiometricEnrollment';

const AttendanceDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('checkin');
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalHours: 0,
    overtimeHours: 0,
    breaks: 0,
    qualityScore: 100,
    riskLevel: 'low'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);

  useEffect(() => {
    if (user) {
      fetchTodayAttendance();
      fetchStats();
      fetchRecentActivity();
      fetchSecurityAlerts();
    }
  }, [user]);

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance/today');
      setTodayAttendance(response.data.data.attendance);
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/attendance/analytics?from=' + 
        new Date(new Date().setDate(new Date().getDate() - 30)).toISOString() + 
        '&to=' + new Date().toISOString());
      
      if (response.data.success) {
        const data = response.data.data.statistics;
        setStats({
          totalHours: Math.round((data.avgDuration || 0) / 60 * 30), // Approximate monthly hours
          overtimeHours: Math.round((data.avgOvertime || 0) / 60 * 30),
          breaks: 0, // Would need separate calculation
          qualityScore: Math.round(data.avgQualityScore || 100),
          riskLevel: data.riskDistribution?.high > 0 ? 'high' : 
                   data.riskDistribution?.medium > 0 ? 'medium' : 'low'
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await axios.get('/api/attendance?limit=5');
      setRecentActivity(response.data.data.attendance || []);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    }
  };

  const fetchSecurityAlerts = async () => {
    try {
      const response = await axios.get('/api/attendance/security/alerts?limit=3');
      setSecurityAlerts(response.data.data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch security alerts:', error);
    }
  };

  const tabs = [
    { id: 'checkin', name: 'Check In/Out', icon: ClockIcon },
    { id: 'biometric', name: 'Biometric Setup', icon: FingerPrintIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'reports', name: 'Reports', icon: CalendarIcon }
  ];

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Comprehensive attendance tracking with security and analytics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Quality Score</div>
              <div className={`text-2xl font-bold ${getQualityColor(stats.qualityScore)}`}>
                {stats.qualityScore}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Risk Level</div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(stats.riskLevel)}`}>
                {stats.riskLevel.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TimeIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Hours (30d)</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalHours}h</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Overtime Hours</div>
              <div className="text-2xl font-bold text-gray-900">{stats.overtimeHours}h</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Breaks Taken</div>
              <div className="text-2xl font-bold text-gray-900">{stats.breaks}</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Security Alerts</div>
              <div className="text-2xl font-bold text-gray-900">{securityAlerts.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      {securityAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Security Alerts</h3>
          </div>
          <div className="mt-2">
            {securityAlerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="text-sm text-red-700">
                • {alert.securityFlags?.join(', ') || 'Security concern detected'} - {new Date(alert.date).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'checkin' && (
            <AttendanceCheckInOut 
              todayAttendance={todayAttendance}
              onAttendanceUpdate={fetchTodayAttendance}
            />
          )}
          {activeTab === 'biometric' && (
            <BiometricEnrollment />
          )}
          {activeTab === 'analytics' && (
            <AttendanceAnalytics />
          )}
          {activeTab === 'security' && (
            <AttendanceSecurity />
          )}
          {activeTab === 'reports' && (
            <AttendanceReports />
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.status === 'present' ? 'bg-green-500' :
                    activity.status === 'late' ? 'bg-yellow-500' :
                    activity.status === 'absent' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {activity.checkIn?.timestamp && 
                        `Checked in at ${new Date(activity.checkIn.timestamp).toLocaleTimeString()}`}
                      {activity.checkOut?.timestamp && 
                        ` • Checked out at ${new Date(activity.checkOut.timestamp).toLocaleTimeString()}`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getQualityColor(activity.qualityScore)}`}>
                    {activity.qualityScore}%
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${getRiskColor(activity.riskLevel)}`}>
                    {activity.riskLevel}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent activity found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
