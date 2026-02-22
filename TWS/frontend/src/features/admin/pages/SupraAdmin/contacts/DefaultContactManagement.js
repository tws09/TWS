import React, { useState, useEffect } from 'react';
import {
  UserPlusIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const DefaultContactManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [setupForm, setSetupForm] = useState({
    contactName: 'Supra-Admin Support',
    contactEmail: 'support@supraadmin.com',
    contactRole: 'System Administrator',
    autoCreateChat: true,
    welcomeMessage: 'Welcome! I\'m your Supra-Admin contact. How can I help you today?',
    availability: '24/7',
    departments: []
  });

  // Mock data for demonstration
  const [mockTenants] = useState([
    {
      id: 1,
      name: 'TechCorp Solutions',
      status: 'active',
      users: 45,
      departments: ['IT', 'HR', 'Finance', 'Operations'],
      defaultContact: {
        exists: true,
        name: 'Supra-Admin Support',
        email: 'support@supraadmin.com',
        lastActivity: '2 hours ago',
        totalMessages: 156,
        responseTime: '1.2m',
        status: 'online'
      },
      createdAt: '2024-01-15',
      lastLogin: '2024-01-21T10:30:00Z'
    },
    {
      id: 2,
      name: 'Global Industries',
      status: 'active',
      users: 32,
      departments: ['Sales', 'Marketing', 'Support'],
      defaultContact: {
        exists: true,
        name: 'Supra-Admin Support',
        email: 'support@supraadmin.com',
        lastActivity: '5 minutes ago',
        totalMessages: 89,
        responseTime: '2.1m',
        status: 'online'
      },
      createdAt: '2024-01-10',
      lastLogin: '2024-01-21T09:15:00Z'
    },
    {
      id: 3,
      name: 'StartupXYZ',
      status: 'inactive',
      users: 8,
      departments: ['Development'],
      defaultContact: {
        exists: false,
        name: null,
        email: null,
        lastActivity: null,
        totalMessages: 0,
        responseTime: null,
        status: 'offline'
      },
      createdAt: '2024-01-20',
      lastLogin: '2024-01-19T16:45:00Z'
    },
    {
      id: 4,
      name: 'Enterprise Corp',
      status: 'active',
      users: 78,
      departments: ['IT', 'HR', 'Finance', 'Operations', 'Legal', 'Marketing'],
      defaultContact: {
        exists: true,
        name: 'Supra-Admin Support',
        email: 'support@supraadmin.com',
        lastActivity: '1 day ago',
        totalMessages: 234,
        responseTime: '3.5m',
        status: 'away'
      },
      createdAt: '2024-01-05',
      lastLogin: '2024-01-21T08:20:00Z'
    }
  ]);

  useEffect(() => {
    setTenants(mockTenants);
  }, []);

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'with-contact' && tenant.defaultContact.exists) ||
      (filterStatus === 'without-contact' && !tenant.defaultContact.exists) ||
      (filterStatus === 'active' && tenant.status === 'active') ||
      (filterStatus === 'inactive' && tenant.status === 'inactive');
    
    return matchesSearch && matchesFilter;
  });

  const handleSetupContact = (tenant) => {
    setSelectedTenant(tenant);
    setSetupForm({
      contactName: 'Supra-Admin Support',
      contactEmail: 'support@supraadmin.com',
      contactRole: 'System Administrator',
      autoCreateChat: true,
      welcomeMessage: `Welcome to ${tenant.name}! I'm your Supra-Admin contact. How can I help you today?`,
      availability: '24/7',
      departments: tenant.departments
    });
    setShowSetupModal(true);
  };

  const handleSaveContact = () => {
    if (!selectedTenant) return;

    // Update tenant with new default contact
    setTenants(prev => prev.map(tenant => 
      tenant.id === selectedTenant.id 
        ? {
            ...tenant,
            defaultContact: {
              exists: true,
              name: setupForm.contactName,
              email: setupForm.contactEmail,
              lastActivity: 'Just now',
              totalMessages: 0,
              responseTime: '0m',
              status: 'online'
            }
          }
        : tenant
    ));

    setShowSetupModal(false);
    setSelectedTenant(null);
    alert('Default contact setup successfully!');
  };

  const handleRemoveContact = (tenantId) => {
    if (window.confirm('Are you sure you want to remove the default contact for this tenant?')) {
      setTenants(prev => prev.map(tenant => 
        tenant.id === tenantId 
          ? {
              ...tenant,
              defaultContact: {
                exists: false,
                name: null,
                email: null,
                lastActivity: null,
                totalMessages: 0,
                responseTime: null,
                status: 'offline'
              }
            }
          : tenant
      ));
      alert('Default contact removed successfully!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'away': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTenantStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const stats = {
    totalTenants: tenants.length,
    withContact: tenants.filter(t => t.defaultContact.exists).length,
    withoutContact: tenants.filter(t => !t.defaultContact.exists).length,
    activeTenants: tenants.filter(t => t.status === 'active').length,
    totalMessages: tenants.reduce((sum, t) => sum + t.defaultContact.totalMessages, 0),
    avgResponseTime: tenants
      .filter(t => t.defaultContact.exists && t.defaultContact.responseTime)
      .reduce((sum, t) => sum + parseFloat(t.defaultContact.responseTime), 0) / 
      tenants.filter(t => t.defaultContact.exists && t.defaultContact.responseTime).length || 0
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card-premium p-6 hover-glow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
              <UserPlusIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Default Contact Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage Supra-Admin default contacts for each tenant</p>
            </div>
          </div>
          <button
            onClick={() => setShowSetupModal(true)}
            className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Setup Contact</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card p-6 hover-glow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tenants</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTenants}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 hover-glow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">With Contact</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.withContact}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 hover-glow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <XCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Without Contact</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.withoutContact}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 hover-glow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMessages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-6 hover-glow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Tenants</option>
              <option value="with-contact">With Contact</option>
              <option value="without-contact">Without Contact</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="glass-card p-6 hover-glow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tenant Contacts</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredTenants.length} of {tenants.length} tenants
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Tenant</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Default Contact</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Activity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Messages</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Response Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {tenant.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{tenant.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {tenant.users} users • {tenant.departments.length} departments
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTenantStatusColor(tenant.status)}`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {tenant.defaultContact.exists ? (
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {tenant.defaultContact.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {tenant.defaultContact.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">No contact</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {tenant.defaultContact.exists ? (
                      <div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tenant.defaultContact.status)}`}>
                          {tenant.defaultContact.status}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {tenant.defaultContact.lastActivity}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-900 dark:text-white">
                    {tenant.defaultContact.totalMessages.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-gray-900 dark:text-white">
                    {tenant.defaultContact.responseTime || '-'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      {tenant.defaultContact.exists ? (
                        <>
                          <button
                            onClick={() => handleSetupContact(tenant)}
                            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Edit Contact"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveContact(tenant.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Remove Contact"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleSetupContact(tenant)}
                          className="px-3 py-1 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
                        >
                          Setup Contact
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Setup Default Contact
                {selectedTenant && ` for ${selectedTenant.name}`}
              </h3>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={setupForm.contactName}
                  onChange={(e) => setSetupForm(prev => ({ ...prev, contactName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={setupForm.contactEmail}
                  onChange={(e) => setSetupForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Role
                </label>
                <input
                  type="text"
                  value={setupForm.contactRole}
                  onChange={(e) => setSetupForm(prev => ({ ...prev, contactRole: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Welcome Message
                </label>
                <textarea
                  value={setupForm.welcomeMessage}
                  onChange={(e) => setSetupForm(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Availability
                </label>
                <select
                  value={setupForm.availability}
                  onChange={(e) => setSetupForm(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="24/7">24/7</option>
                  <option value="business-hours">Business Hours</option>
                  <option value="weekdays">Weekdays Only</option>
                  <option value="custom">Custom Schedule</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoCreateChat"
                  checked={setupForm.autoCreateChat}
                  onChange={(e) => setSetupForm(prev => ({ ...prev, autoCreateChat: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="autoCreateChat" className="text-sm text-gray-700 dark:text-gray-300">
                  Automatically create welcome chat
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveContact}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-all duration-200 flex items-center space-x-2"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Save Contact</span>
              </button>
              <button
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DefaultContactManagement;
