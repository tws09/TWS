import React from 'react';
import AdminPageTemplate from '../../../features/admin/components/admin/AdminPageTemplate';
import { TruckIcon } from '@heroicons/react/24/outline';

const InventorySuppliers = () => {
  const stats = [
    { label: 'Total Suppliers', value: '18', icon: TruckIcon, iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' }
  ];

  return (
    <AdminPageTemplate title="Suppliers" description="Manage supplier relationships" stats={stats}>
      <div className="glass-card-premium p-6 hover-glow">
        <div className="text-center py-12">
          <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Supplier management interface ready for implementation</p>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default InventorySuppliers;
