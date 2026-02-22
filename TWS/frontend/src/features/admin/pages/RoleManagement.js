import React, { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthContext';
import { useRoleBasedUI } from '../../../shared/hooks/useRoleBasedUI';
import { 
  ShieldCheckIcon, 
  UserPlusIcon, 
  KeyIcon, 
  Cog6ToothIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const RoleManagement = () => {
  const { user } = useAuth();
  const { hasPermission, getRoleConfig } = useRoleBasedUI();
  const [activeTab, setActiveTab] = useState('overview');

  // Check if user has permission to access role management
  if (!hasPermission('roles:manage') && user.role !== 'owner') {
    return (
      <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-white/20 shadow-2xl text-center">
        <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-200">
          You don't have permission to access role management.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ShieldCheckIcon },
    { id: 'roles', label: 'User Roles', icon: UsersIcon },
    { id: 'permissions', label: 'Permissions', icon: KeyIcon },
    { id: 'access', label: 'Access Control', icon: Cog6ToothIcon },
    { id: 'assign', label: 'User Assignment', icon: UserPlusIcon }
  ];

  const roleData = [
    {
      name: 'Owner',
      level: 1,
      color: 'purple',
      permissions: ['All permissions'],
      userCount: 1,
      description: 'Full system access and control'
    },
    {
      name: 'Admin',
      level: 2,
      color: 'blue',
      permissions: ['User management', 'Finance management', 'Project management', 'HR management'],
      userCount: 3,
      description: 'Administrative access to most modules'
    },
    {
      name: 'HR Manager',
      level: 3,
      color: 'green',
      permissions: ['User management', 'HR management', 'Attendance management'],
      userCount: 2,
      description: 'Human resources and user management'
    },
    {
      name: 'Finance Manager',
      level: 3,
      color: 'emerald',
      permissions: ['Finance management', 'Payroll management', 'Project viewing'],
      userCount: 1,
      description: 'Financial operations and payroll'
    },
    {
      name: 'Project Manager',
      level: 3,
      color: 'indigo',
      permissions: ['Project management', 'User viewing', 'Finance viewing'],
      userCount: 4,
      description: 'Project and team management'
    },
    {
      name: 'Employee',
      level: 4,
      color: 'gray',
      permissions: ['Profile management', 'Task management', 'Attendance management'],
      userCount: 25,
      description: 'Standard employee access'
    },
    {
      name: 'Client',
      level: 5,
      color: 'orange',
      permissions: ['Project viewing', 'Invoice viewing'],
      userCount: 8,
      description: 'Client access to projects and invoices'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-2xl">
        <h3 className="text-xl font-semibold text-white mb-4">Role Management Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{roleData.length}</div>
            <div className="text-sm text-gray-200">Total Roles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {roleData.reduce((sum, role) => sum + role.userCount, 0)}
            </div>
            <div className="text-sm text-gray-200">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">5</div>
            <div className="text-sm text-gray-200">Permission Groups</div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-2xl">
        <h3 className="text-xl font-semibold text-white mb-4">Role Hierarchy</h3>
        <div className="space-y-3">
          {roleData.map((role, index) => (
            <div key={role.name} className="flex items-center justify-between p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 bg-${role.color}-500 rounded-full`}></div>
                <div>
                  <div className="font-medium text-white">{role.name}</div>
                  <div className="text-sm text-gray-200">{role.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">{role.userCount} users</div>
                <div className="text-xs text-gray-200">Level {role.level}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRoles = () => (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">User Roles</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add New Role
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleData.map((role) => (
            <div key={role.name} className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 bg-${role.color}-600 rounded-lg flex items-center justify-center`}>
                  <ShieldCheckIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-200">Level {role.level}</span>
              </div>
              <h4 className="font-semibold text-white mb-2">{role.name}</h4>
              <p className="text-sm text-gray-200 mb-3">{role.description}</p>
              <div className="text-xs text-gray-300 mb-3">
                {role.permissions.length} permissions
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">{role.userCount} users</span>
                <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Edit Role
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-2xl">
        <h3 className="text-xl font-semibold text-white mb-6">Permission Groups</h3>
        
        <div className="space-y-4">
          {[
            { name: 'User Management', permissions: ['users:read', 'users:write', 'users:delete', 'users:manage'] },
            { name: 'Project Management', permissions: ['projects:read', 'projects:write', 'projects:delete', 'projects:manage'] },
            { name: 'Finance Management', permissions: ['finance:read', 'finance:write', 'finance:delete', 'finance:manage'] },
            { name: 'HR Management', permissions: ['hr:read', 'hr:write', 'hr:delete', 'hr:manage'] },
            { name: 'System Administration', permissions: ['system:read', 'system:write', 'system:delete', 'system:manage'] }
          ].map((group) => (
            <div key={group.name} className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <h4 className="font-semibold text-white mb-3">{group.name}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {group.permissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-200">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAccessControl = () => (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-2xl">
        <h3 className="text-xl font-semibold text-white mb-6">Access Control Settings</h3>
        
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <h4 className="font-semibold text-white mb-3">Session Management</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm text-gray-200">Auto-logout after 30 minutes of inactivity</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm text-gray-200">Require password change every 90 days</span>
              </label>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <h4 className="font-semibold text-white mb-3">IP Restrictions</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-200">Enable IP whitelist</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm text-gray-200">Block suspicious login attempts</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserAssignment = () => (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">User Role Assignment</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Assign Role
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white font-medium">User</th>
                <th className="text-left py-3 px-4 text-white font-medium">Current Role</th>
                <th className="text-left py-3 px-4 text-white font-medium">Level</th>
                <th className="text-left py-3 px-4 text-white font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'John Doe', email: 'john@example.com', role: 'Admin', level: 2 },
                { name: 'Jane Smith', email: 'jane@example.com', role: 'HR Manager', level: 3 },
                { name: 'Mike Johnson', email: 'mike@example.com', role: 'Employee', level: 4 },
                { name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Project Manager', level: 3 }
              ].map((user, index) => (
                <tr key={index} className="border-b border-white/10">
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-sm text-gray-200">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{user.level}</td>
                  <td className="py-3 px-4">
                    <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                      Change Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'roles': return renderRoles();
      case 'permissions': return renderPermissions();
      case 'access': return renderAccessControl();
      case 'assign': return renderUserAssignment();
      default: return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Role Management</h1>
            <p className="text-gray-200">Manage user roles, permissions, and access control</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-2xl p-2 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-200 hover:bg-white/10'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default RoleManagement;
