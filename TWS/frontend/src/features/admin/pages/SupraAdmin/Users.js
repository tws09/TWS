import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../../../app/providers/ThemeContext';
import { get, patch, post } from '../../../../shared/utils/apiClient';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedResponsibility, setSelectedResponsibility] = useState('');
  const [newUserData, setNewUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    portalResponsibility: '',
    phone: ''
  });
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Only fetch if component is mounted and we're on the users page
    let isMounted = true;
    
    const loadUsers = async () => {
      if (isMounted) {
        await fetchUsers();
      }
    };
    
    loadUsers();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', '100');
      
      console.log('Fetching users from:', `/api/supra-admin/admins?${params.toString()}`);
      
      // Fetch Supra Admin portal users (TWSAdmin users) - using admins route
      const response = await get(`/api/supra-admin/admins?${params.toString()}`);
      
      console.log('Users response:', response);
      
      // Handle different response formats
      const usersData = response?.data || response?.users || (Array.isArray(response) ? response : []) || [];
      
      // Map to extract portal responsibility from department field
      const mappedUsers = usersData.map(user => {
        let portalResponsibility = null;
        if (user.department) {
          const deptMatch = user.department.match(/Supra Admin (\w+)/);
          if (deptMatch) {
            portalResponsibility = deptMatch[1].toLowerCase();
          }
        }
        return {
          ...user,
          supraAdminPortalResponsibility: portalResponsibility,
          tenant: 'Supra Admin Portal',
          role: user.role || 'admin',
          status: user.status || 'active',
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date()
        };
      });
      
      setUsers(mappedUsers);
      console.log('Users set successfully:', mappedUsers.length);
    } catch (err) {
      // Handle errors gracefully - NEVER redirect from here
      const errorStatus = err.status || err.response?.status;
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch users';
      
      console.error('Fetch users error details:', {
        status: errorStatus,
        message: errorMessage,
        error: err
      });
      
      if (errorStatus === 401) {
        setError('Authentication required. Please refresh the page and login again if needed.');
      } else if (errorStatus === 403) {
        setError('You do not have permission to view users.');
      } else if (errorStatus === 404) {
        setError('Users endpoint not found. Please contact support.');
      } else {
        setError(errorMessage || 'Failed to fetch users. Please try again.');
      }
      
      setUsers([]); // Set empty array on error to prevent UI issues
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.tenant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'hr': return 'bg-green-100 text-green-800';
      case 'finance': return 'bg-yellow-100 text-yellow-800';
      case 'employee': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastLogin = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-card-premium p-8 hover-glow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold font-heading text-gray-900 dark:text-white tracking-tight">
                  Supra Admin Portal User Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">
                  Create and manage users for Supra Admin portal operations (Finance, HR, ERP Management, etc.)
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchUsers}
              className="glass-card px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/10 transition-all duration-200"
            >
              <BoltIcon className="w-4 h-4 inline mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-accent-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Add Portal User
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="glass-card p-4 hover-glow border-l-4 border-blue-500">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              <strong>Note:</strong> This section is for managing <span className="text-primary-600 dark:text-primary-400 font-semibold">Supra Admin Portal users</span> who handle platform operations (Finance, HR, ERP Management, Support, etc.).{' '}
              Software House ERP employees should be created through the <span className="text-primary-600 dark:text-primary-400 font-semibold">TWS Software House Portal</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 hover-glow">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <FunnelIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters & Search</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-3 glass-card rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white bg-white/10 backdrop-blur-sm"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 glass-card rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white bg-white/10 backdrop-blur-sm"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="hr">HR</option>
            <option value="finance">Finance</option>
            <option value="employee">Employee</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 glass-card rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white bg-white/10 backdrop-blur-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <div className="flex items-center justify-center glass-card px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-400 font-medium">
            <FunnelIcon className="h-4 w-4 mr-2" />
            {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="glass-card">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Portal Responsibility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-white/5 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                          <UserGroupIcon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.supraAdminPortalResponsibility ? (
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {user.supraAdminPortalResponsibility.charAt(0).toUpperCase() + user.supraAdminPortalResponsibility.slice(1)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatLastLogin(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all duration-200" title="View">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setShowAssignModal(true);
                        }}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-secondary-600 dark:hover:text-secondary-400 hover:bg-secondary-500/10 rounded-lg transition-all duration-200" 
                        title="Assign to Supra Admin Portal"
                      >
                        <AdjustmentsHorizontalIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || roleFilter || statusFilter 
              ? 'Try adjusting your search or filter criteria.'
              : 'Users must be created through the TWS Software House Portal first.'
            }
          </p>
        </div>
      )}

      {/* Assign to Supra Admin Portal Modal */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md glass-card-premium rounded-2xl shadow-2xl">
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AdjustmentsHorizontalIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Assign Portal Responsibility</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Assign user to handle Supra Admin portal responsibilities</p>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{selectedUser.fullName}</strong> ({selectedUser.email})
                </p>
              </div>
              
              <form className="space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                if (!selectedResponsibility || !selectedUser) return;
                
                try {
                  setAssigning(true);
                  
                  await patch(`/api/supra-admin/users/${selectedUser._id}/assign-portal-responsibility`, {
                    portalResponsibility: selectedResponsibility
                  });
                  
                  // Refresh users list
                  await fetchUsers();
                  
                  setShowAssignModal(false);
                  setSelectedUser(null);
                  setSelectedResponsibility('');
                  
                  // You might want to show a success notification here
                  alert(`User successfully assigned to handle Supra Admin ${selectedResponsibility} system`);
                } catch (err) {
                  console.error('Assign responsibility error:', err);
                  alert(err.response?.data?.message || 'Failed to assign responsibility');
                } finally {
                  setAssigning(false);
                }
              }}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Supra Admin Portal Responsibility
                  </label>
                  <select 
                    className="w-full px-4 py-3 glass-card rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white bg-white/10 backdrop-blur-sm font-medium"
                    value={selectedResponsibility}
                    onChange={(e) => setSelectedResponsibility(e.target.value)}
                    required
                  >
                    <option value="">Select responsibility</option>
                    <option value="finance">Finance System</option>
                    <option value="hr">HR System</option>
                    <option value="admin">Administrative System</option>
                    <option value="support">Support System</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    This assigns the user to handle this Supra Admin portal area. Users are created through the Software House Portal.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedUser(null);
                      setSelectedResponsibility('');
                    }}
                    disabled={assigning}
                    className="px-6 py-3 glass-card rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/10 transition-all duration-200 font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigning || !selectedResponsibility}
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl hover:from-primary-600 hover:to-accent-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {assigning ? 'Assigning...' : 'Assign Responsibility'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Supra Admin Portal User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md glass-card-premium rounded-2xl shadow-2xl">
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                  <UserPlusIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Portal User</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add a new user for Supra Admin portal management</p>
                </div>
              </div>
              
              <form className="space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                
                try {
                  setCreating(true);
                  
                  await post('/api/supra-admin/admins', {
                    fullName: newUserData.fullName,
                    email: newUserData.email,
                    password: newUserData.password,
                    portalResponsibility: newUserData.portalResponsibility,
                    phone: newUserData.phone || ''
                  });
                  
                  // Refresh users list
                  await fetchUsers();
                  
                  setShowCreateModal(false);
                  setNewUserData({
                    fullName: '',
                    email: '',
                    password: '',
                    portalResponsibility: '',
                    phone: ''
                  });
                  
                  alert('Portal user created successfully!');
                } catch (err) {
                  console.error('Create user error:', err);
                  alert(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create user');
                } finally {
                  setCreating(false);
                }
              }}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserData.fullName}
                    onChange={(e) => setNewUserData({...newUserData, fullName: e.target.value})}
                    className="w-full px-4 py-3 glass-card rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white bg-white/10 backdrop-blur-sm font-medium"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                    className="w-full px-4 py-3 glass-card rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white bg-white/10 backdrop-blur-sm font-medium"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                    className="w-full px-4 py-3 glass-card rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white bg-white/10 backdrop-blur-sm font-medium"
                    placeholder="Minimum 8 characters"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Password must be at least 8 characters long</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Portal Responsibility <span className="text-red-500">*</span>
                  </label>
                  <select 
                    required
                    value={newUserData.portalResponsibility}
                    onChange={(e) => setNewUserData({...newUserData, portalResponsibility: e.target.value})}
                    className="w-full px-4 py-3 glass-card rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white bg-white/10 backdrop-blur-sm font-medium"
                  >
                    <option value="">Select responsibility</option>
                    <option value="finance">Finance System</option>
                    <option value="hr">HR System</option>
                    <option value="admin">Administrative System</option>
                    <option value="support">Support System</option>
                    <option value="erp_management">ERP Management</option>
                    <option value="billing">Billing System</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Select the Supra Admin portal area this user will manage.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                    className="w-full px-4 py-3 glass-card rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white bg-white/10 backdrop-blur-sm font-medium"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewUserData({
                        fullName: '',
                        email: '',
                        password: '',
                        portalResponsibility: '',
                        phone: ''
                      });
                    }}
                    disabled={creating}
                    className="px-6 py-3 glass-card rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/10 transition-all duration-200 font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newUserData.fullName || !newUserData.email || !newUserData.password || !newUserData.portalResponsibility}
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl hover:from-primary-600 hover:to-accent-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {creating ? 'Creating...' : 'Create Portal User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
