import React, { useState } from 'react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const RoleBasedAccessInfo = ({ userRole, isFinanceAdmin, isFinanceManager, isExecutive }) => {
  const [isOpen, setIsOpen] = useState(false);

  const roleInfo = {
    owner: {
      name: 'Owner',
      access: 'Full Access',
      description: 'Complete access to all financial data, operations, and administrative functions.',
      features: [
        'All KPIs and metrics',
        'Detailed transaction data',
        'Export all data formats',
        'Configure settings',
        'Manage users and permissions',
        'View audit logs'
      ]
    },
    admin: {
      name: 'Administrator',
      access: 'Full Access',
      description: 'Complete access to all financial data and operations.',
      features: [
        'All KPIs and metrics',
        'Detailed transaction data',
        'Export all data formats',
        'Configure settings',
        'Manage users',
        'View audit logs'
      ]
    },
    finance_manager: {
      name: 'Finance Manager',
      access: 'Management Access',
      description: 'Access to management-level financial data and extended metrics.',
      features: [
        'Extended KPIs and metrics',
        'Detailed financial reports',
        'Export capabilities',
        'Budget and forecasting',
        'Project profitability',
        'Accounts aging analysis'
      ]
    },
    finance: {
      name: 'Finance',
      access: 'Finance Access',
      description: 'Access to finance-related data and operations.',
      features: [
        'Financial KPIs',
        'Transaction data',
        'Invoice and bill management',
        'Basic reporting',
        'Export capabilities'
      ]
    },
    manager: {
      name: 'Manager',
      access: 'Manager Access',
      description: 'Access to high-level financial metrics and summaries.',
      features: [
        'High-level KPIs',
        'Summary reports',
        'Team performance metrics',
        'Limited export'
      ]
    },
    employee: {
      name: 'Employee',
      access: 'Basic Access',
      description: 'Limited access to basic financial KPIs and summaries.',
      features: [
        'Basic KPIs',
        'Revenue and profit summaries',
        'Project overview',
        'No sensitive data access'
      ]
    },
    auditor: {
      name: 'Auditor',
      access: 'Read-Only Access',
      description: 'Read-only access to financial data for auditing purposes.',
      features: [
        'View all financial data',
        'Export reports',
        'Audit logs',
        'No modification permissions'
      ]
    }
  };

  const currentRole = roleInfo[userRole] || roleInfo.employee;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title="View role-based access information"
      >
        <InformationCircleIcon className="h-5 w-5" />
        <span>Access Info</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Role-Based Access Information</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Current Role */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Current Role: {currentRole.name}
              </h3>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {currentRole.access}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentRole.description}
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Available Features:
            </h4>
            <ul className="space-y-2">
              {currentRole.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Role Comparison */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Role Access Levels:
            </h4>
            <div className="space-y-3">
              {Object.entries(roleInfo).map(([role, info]) => (
                <div
                  key={role}
                  className={`p-3 rounded-lg border ${
                    role === userRole
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {info.name}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {info.access}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {info.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Note:</strong> Your access level determines what financial data you can view and export. 
              Contact your administrator if you need additional permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedAccessInfo;

