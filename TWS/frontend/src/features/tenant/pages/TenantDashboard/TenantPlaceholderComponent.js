import React from 'react';
import { useTenantAuth } from '../../../../app/providers/TenantAuthContext';
import { 
  ExclamationTriangleIcon, 
  WrenchScrewdriverIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const TenantPlaceholderComponent = ({ moduleName = 'Module', description = 'This module is being prepared for tenant-specific functionality.' }) => {
  const { user, tenant, isAuthenticated } = useTenantAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Authenticated</h2>
          <p className="text-gray-600">Please log in to access this module.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {moduleName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {description} for {tenant?.name}.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <WrenchScrewdriverIcon className="h-8 w-8 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-600">In Development</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tenant-Specific {moduleName}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            This {moduleName.toLowerCase()} module is being prepared with tenant-specific functionality. 
            It will be fully integrated with the {tenant?.name} organization's data and workflows.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              What's Coming:
            </h3>
            <ul className="text-left text-blue-800 dark:text-blue-200 space-y-2">
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                Tenant-specific data and configurations
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                Role-based access control for {tenant?.name}
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                Integration with tenant workflows
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                Custom branding and settings
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantPlaceholderComponent;
