import React from 'react';
import AdminPageTemplate from '../../../features/admin/components/admin/AdminPageTemplate';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const InventoryWarehouses = () => {
  const stats = [
    { label: 'Warehouses', value: '5', icon: BuildingStorefrontIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' }
  ];

  return (
    <AdminPageTemplate title="Warehouses" description="Manage warehouse locations" stats={stats}>
      <div className="glass-card-premium p-6 hover-glow">
        <div className="text-center py-12">
          <BuildingStorefrontIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Warehouse management interface ready for implementation</p>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default InventoryWarehouses;
