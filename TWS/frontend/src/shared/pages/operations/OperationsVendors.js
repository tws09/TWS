import React from 'react';
import AdminPageTemplate from '../../../features/admin/components/admin/AdminPageTemplate';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

const OperationsVendors = () => {
  const stats = [
    { label: 'Total Vendors', value: '28', icon: BuildingOfficeIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' }
  ];

  return (
    <AdminPageTemplate title="Vendors" description="Manage vendor relationships" stats={stats}>
      <div className="glass-card-premium p-6 hover-glow">
        <div className="text-center py-12">
          <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Vendor management interface ready for implementation</p>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default OperationsVendors;
