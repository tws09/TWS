import React, { useState, useEffect } from 'react';
import { useAuth } from '../../app/providers/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { 
  UserIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  KeyIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { user, hasPermission, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    jobTitle: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        jobTitle: user.jobTitle || ''
      });
    }
  }, [user]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    attendanceAlerts: true,
    payrollNotifications: true
  });
  const [systemSettings, setSystemSettings] = useState({
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    language: 'en'
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'preferences', name: 'Preferences', icon: Cog6ToothIcon },
    ...(hasPermission('settings:admin') ? [{ id: 'system', name: 'System', icon: GlobeAltIcon }] : [])
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { fullName, phone, department, jobTitle } = profileData;
      const response = await axiosInstance.patch('/api/users/profile', {
        fullName,
        phone,
        department,
        jobTitle
      });
      if (response.data?.data?.user) {
        updateUser(response.data.data.user);
      }
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      await axiosInstance.patch('/api/users/notifications', notifications);
      toast.success('Notification preferences updated!');
    } catch (error) {
      toast.error('Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettingsUpdate = async () => {
    setLoading(true);
    try {
      await axiosInstance.patch('/api/settings/system', systemSettings);
      toast.success('System settings updated!');
    } catch (error) {
      toast.error('Failed to update system settings');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8">
            <div className="wolfstack-card-glass wolfstack-animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <h3 className="wolfstack-heading-3 text-gray-900 dark:text-gray-100 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Profile Information
                </h3>
                <p className="mt-1 wolfstack-text-small text-gray-600 dark:text-gray-400">
                  Update your personal information and contact details.
                </p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="wolfstack-text-small font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        className="wolfstack-input"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="wolfstack-text-small font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="wolfstack-input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                        placeholder="Enter your email"
                      />
                      <p className="wolfstack-text-small text-gray-500 dark:text-gray-400">Email cannot be changed.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="wolfstack-text-small font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="wolfstack-input"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="wolfstack-text-small font-medium text-gray-700 dark:text-gray-300">Department</label>
                      <input
                        type="text"
                        value={profileData.department}
                        onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                        className="wolfstack-input"
                        placeholder="Enter your department"
                      />
                    </div>
                    
                    <div className="sm:col-span-2 space-y-2">
                      <label className="wolfstack-text-small font-medium text-gray-700 dark:text-gray-300">Job Title</label>
                      <input
                        type="text"
                        value={profileData.jobTitle}
                        onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})}
                        className="wolfstack-input"
                        placeholder="Enter your job title"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="wolfstack-button-primary"
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-8">
            <div className="wolfstack-card-glass wolfstack-animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <h3 className="wolfstack-heading-3 text-gray-900 dark:text-gray-100 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Security Settings
                </h3>
                <p className="mt-1 wolfstack-text-small text-gray-600 dark:text-gray-400">
                  Manage your password and security preferences.
                </p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="wolfstack-text-small font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="wolfstack-input"
                        placeholder="Enter your current password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="wolfstack-text-small font-medium text-gray-700 dark:text-gray-300">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="wolfstack-input"
                        placeholder="Enter your new password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="wolfstack-text-small font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="wolfstack-input"
                        placeholder="Confirm your new password"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="wolfstack-button-primary"
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-8">
            <div className="wolfstack-card-glass wolfstack-animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <h3 className="wolfstack-heading-3 text-gray-900 dark:text-gray-100 flex items-center">
                  <BellIcon className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                  Notification Preferences
                </h3>
                <p className="mt-1 wolfstack-text-small text-gray-600 dark:text-gray-400">
                  Choose how you want to be notified about different activities.
                </p>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="wolfstack-card-glass-subtle p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="wolfstack-text-small font-medium text-gray-900 dark:text-gray-100">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </label>
                          <p className="wolfstack-text-small text-gray-600 dark:text-gray-400 mt-1">
                            {key === 'emailNotifications' && 'Receive notifications via email'}
                            {key === 'pushNotifications' && 'Receive push notifications in browser'}
                            {key === 'taskReminders' && 'Get reminded about upcoming tasks'}
                            {key === 'attendanceAlerts' && 'Get alerts for attendance issues'}
                            {key === 'payrollNotifications' && 'Receive payroll-related notifications'}
                          </p>
                        </div>
                        <button
                          onClick={() => setNotifications({...notifications, [key]: !value})}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            value ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              value ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleNotificationUpdate}
                      disabled={loading}
                      className="wolfstack-button-primary"
                    >
                      {loading ? 'Updating...' : 'Update Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-8">
            <div className="wolfstack-card-glass wolfstack-animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <h3 className="wolfstack-heading-3 text-gray-900 dark:text-gray-100 flex items-center">
                  <Cog6ToothIcon className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  User Preferences
                </h3>
                <p className="mt-1 wolfstack-text-small text-gray-600 dark:text-gray-400">
                  Customize your experience with the application.
                </p>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="wolfstack-text-small font-medium text-gray-700 dark:text-gray-300">Timezone</label>
                      <select
                        value={systemSettings.timezone}
                        onChange={(e) => setSystemSettings({...systemSettings, timezone: e.target.value})}
                        className="wolfstack-select"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="wolfstack-text-small font-medium text-gray-700 dark:text-gray-300">Date Format</label>
                      <select
                        value={systemSettings.dateFormat}
                        onChange={(e) => setSystemSettings({...systemSettings, dateFormat: e.target.value})}
                        className="wolfstack-select"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="wolfstack-text-small font-medium text-gray-700 dark:text-gray-300">Currency</label>
                      <select
                        value={systemSettings.currency}
                        onChange={(e) => setSystemSettings({...systemSettings, currency: e.target.value})}
                        className="wolfstack-select"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD (C$)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="wolfstack-text-small font-medium text-gray-700 dark:text-gray-300">Language</label>
                      <select
                        value={systemSettings.language}
                        onChange={(e) => setSystemSettings({...systemSettings, language: e.target.value})}
                        className="wolfstack-select"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSystemSettingsUpdate}
                      disabled={loading}
                      className="wolfstack-button-primary"
                    >
                      {loading ? 'Updating...' : 'Update Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-8">
            <div className="wolfstack-card-glass wolfstack-animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <h3 className="wolfstack-heading-3 text-gray-900 dark:text-gray-100 flex items-center">
                  <GlobeAltIcon className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                  System Administration
                </h3>
                <p className="mt-1 wolfstack-text-small text-gray-600 dark:text-gray-400">
                  Manage system-wide settings and configurations.
                </p>
              </div>
              
              <div className="p-6">
                <div className="wolfstack-card-glass-subtle border-l-4 border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/20 p-4 rounded-xl">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ShieldCheckIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="wolfstack-text-small font-medium text-yellow-800 dark:text-yellow-200">
                        Administrative Access Required
                      </h3>
                      <div className="mt-2 wolfstack-text-small text-yellow-700 dark:text-yellow-300">
                        <p>System settings can only be modified by administrators.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="wolfstack-card-premium wolfstack-animate-fadeIn">
        <div className="px-6 py-8 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="wolfstack-heading-2 text-gray-900 dark:text-gray-100">
                Settings ⚙️
              </h1>
              <p className="mt-2 wolfstack-text-body text-gray-600 dark:text-gray-300">
                Manage system settings, user roles, and configurations.
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Cog6ToothIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wolfstack-card-premium wolfstack-animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <div className="border-b border-gray-200/50 dark:border-gray-700/50">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all duration-200`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6 sm:p-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
