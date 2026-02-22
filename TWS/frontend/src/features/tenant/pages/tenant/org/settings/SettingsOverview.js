import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTenantAuth } from '../../../../../../app/providers/TenantAuthContext';
import toast from 'react-hot-toast';
import {
  CogIcon,
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  KeyIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SettingsOverview = () => {
  const { tenantSlug } = useParams();
  const { user, tenant } = useTenantAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [generalSettings, setGeneralSettings] = useState({
    organizationName: '',
    timezone: 'Asia/Karachi',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    language: 'en',
    currency: 'PKR'
  });
  
  // Initialize notification settings based on ERP category
  const getInitialNotificationSettings = (erpCategory = 'business') => {
    const baseSettings = {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      taskReminders: true,
      attendanceAlerts: true
    };
    
    return baseSettings;
  };
  
  const [notificationSettings, setNotificationSettings] = useState(() => 
    getInitialNotificationSettings(tenant?.erpCategory)
  );
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: 'medium',
    requireStrongPassword: true,
    loginAlerts: true
  });

  useEffect(() => {
    fetchSettings();
    // Update notification settings when tenant changes
    if (tenant) {
      setNotificationSettings(getInitialNotificationSettings(tenant.erpCategory));
    }
  }, [tenantSlug, tenant]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // SECURITY FIX: Use credentials: 'include' instead of Authorization header
      // Tokens are in HttpOnly cookies, not accessible via JavaScript
      const response = await fetch(`/api/tenant/${tenantSlug}/organization/settings`, {
        method: 'GET',
        credentials: 'include', // SECURITY FIX: Include cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          if (data.data.general) setGeneralSettings(data.data.general);
          if (data.data.notifications) {
            const savedNotifications = data.data.notifications;
            const { feeReminders, examNotifications, announcementNotifications, ...filteredNotifications } = savedNotifications || {};
            setNotificationSettings(filteredNotifications);
          }
          if (data.data.security) setSecuritySettings(data.data.security);
        }
      } else {
        // If settings don't exist, use defaults
        if (tenant) {
          setGeneralSettings(prev => ({
            ...prev,
            organizationName: tenant.name || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      if (tenant) {
        setGeneralSettings(prev => ({
          ...prev,
          organizationName: tenant.name || ''
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSettingsSave = async () => {
    setSaving(true);
    try {
      // SECURITY FIX: Use credentials: 'include' instead of Authorization header
      const response = await fetch(`/api/tenant/${tenantSlug}/organization/settings/general`, {
        method: 'PUT',
        credentials: 'include', // SECURITY FIX: Include cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(generalSettings)
      });

      if (!response.ok) {
        throw new Error('Failed to save general settings');
      }

      toast.success('General settings saved successfully!');
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast.error(error.message || 'Failed to save general settings');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSettingsSave = async () => {
    setSaving(true);
    try {
      // SECURITY FIX: Use credentials: 'include' instead of Authorization header
      const response = await fetch(`/api/tenant/${tenantSlug}/organization/settings/notifications`, {
        method: 'PUT',
        credentials: 'include', // SECURITY FIX: Include cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationSettings)
      });

      if (!response.ok) {
        throw new Error('Failed to save notification settings');
      }

      toast.success('Notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error(error.message || 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSecuritySettingsSave = async () => {
    setSaving(true);
    try {
      // SECURITY FIX: Use credentials: 'include' instead of Authorization header
      const response = await fetch(`/api/tenant/${tenantSlug}/organization/settings/security`, {
        method: 'PUT',
        credentials: 'include', // SECURITY FIX: Include cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(securitySettings)
      });

      if (!response.ok) {
        throw new Error('Failed to save security settings');
      }

      toast.success('Security settings saved successfully!');
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error(error.message || 'Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Organization Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.organizationName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, organizationName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter organization name"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <GlobeAltIcon className="h-4 w-4 mr-1 text-gray-500" />
                      Timezone
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                      Date Format
                    </label>
                    <select
                      value={generalSettings.dateFormat}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                      Time Format
                    </label>
                    <select
                      value={generalSettings.timeFormat}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timeFormat: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="24h">24 Hour</option>
                      <option value="12h">12 Hour (AM/PM)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-500" />
                      Currency
                    </label>
                    <select
                      value={generalSettings.currency}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="PKR">PKR (Pakistani Rupee)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="GBP">GBP (British Pound)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="ur">Urdu</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={handleGeneralSettingsSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <BellIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Notification Preferences
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(notificationSettings)
                    .filter(([key]) => !['feeReminders', 'examNotifications', 'announcementNotifications'].includes(key))
                    .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <label className="text-sm font-medium text-gray-900">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          {key.includes('email') && 'Receive notifications via email'}
                          {key.includes('push') && 'Receive push notifications'}
                          {key.includes('sms') && 'Receive SMS notifications'}
                          {key.includes('task') && 'Get reminders for tasks'}
                          {key.includes('attendance') && 'Get alerts for attendance'}
                          {key.includes('fee') && 'Get reminders for fee payments'}
                          {key.includes('exam') && 'Get notifications about exams'}
                          {key.includes('announcement') && 'Get notifications for announcements'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={handleNotificationSettingsSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Security Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Two-Factor Authentication</label>
                    <p className="text-xs text-gray-500 mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min="5"
                    max="120"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Policy
                  </label>
                  <select
                    value={securitySettings.passwordPolicy}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordPolicy: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="low">Low (6+ characters)</option>
                    <option value="medium">Medium (8+ characters, mixed case)</option>
                    <option value="high">High (10+ characters, mixed case, numbers, symbols)</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Require Strong Password</label>
                    <p className="text-xs text-gray-500 mt-1">Enforce password complexity requirements</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.requireStrongPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, requireStrongPassword: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Login Alerts</label>
                    <p className="text-xs text-gray-500 mt-1">Get notified when someone logs into your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.loginAlerts}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, loginAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSecuritySettingsSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-600 mt-1">Manage your organization settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-200">
        <div className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SettingsOverview;
