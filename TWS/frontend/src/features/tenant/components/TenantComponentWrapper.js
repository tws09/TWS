import React from 'react';
import { useTenantAuth } from '../../../app/providers/TenantAuthContext';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const TenantComponentWrapper = ({ children, fallback = null }) => {
  const { isAuthenticated, user, tenant } = useTenantAuth();

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Authenticated</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-component-wrapper" data-tenant-id={tenant?.id} data-tenant-slug={tenant?.slug}>
      {children}
    </div>
  );
};

export default TenantComponentWrapper;
