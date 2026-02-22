import React, { useState } from 'react';
import AdminPageTemplate from '../../../../features/admin/components/admin/AdminPageTemplate';
import { 
  UserGroupIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const HREmployees = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    { label: 'Total Employees', value: '148', icon: UserGroupIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Active', value: '142', icon: UserIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'On Leave', value: '6', icon: UserIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { label: 'Departments', value: '8', icon: UserGroupIcon, iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' }
  ];

  const actions = (
    <>
      <button className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2">
        <FunnelIcon className="w-5 h-5" />
        <span className="font-medium">Filter</span>
      </button>
      <button className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <PlusIcon className="w-5 h-5" />
        <span className="font-medium">Add Employee</span>
      </button>
    </>
  );

  const employees = [
    { id: 1, name: 'John Smith', role: 'Senior Developer', department: 'Engineering', status: 'Active', email: 'john.smith@company.com' },
    { id: 2, name: 'Sarah Johnson', role: 'Project Manager', department: 'Management', status: 'Active', email: 'sarah.j@company.com' },
    { id: 3, name: 'Michael Chen', role: 'UX Designer', department: 'Design', status: 'Active', email: 'michael.c@company.com' },
    { id: 4, name: 'Emily Davis', role: 'HR Manager', department: 'Human Resources', status: 'On Leave', email: 'emily.d@company.com' },
    { id: 5, name: 'Robert Wilson', role: 'DevOps Engineer', department: 'Engineering', status: 'Active', email: 'robert.w@company.com' }
  ];

  return (
    <AdminPageTemplate
      title="Employee Management"
      description="Manage your workforce and employee information"
      stats={stats}
      actions={actions}
    >
      {/* Search and Filters */}
      <div className="glass-card-premium p-6 hover-glow">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees by name, role, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-10 pr-4 py-3 text-sm font-medium"
          />
        </div>
      </div>

      {/* Employee List */}
      <div className="glass-card-premium p-6 hover-glow">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
          All Employees
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Name</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Role</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Department</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Email</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{employee.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{employee.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{employee.role}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{employee.department}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{employee.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      employee.status === 'Active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default HREmployees;
