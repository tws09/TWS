import React from 'react';
import AdminPageTemplate from '../../../features/admin/components/admin/AdminPageTemplate';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';

const InventoryStock = () => {
  const stats = [
    { label: 'Stock Items', value: '892', icon: ArchiveBoxIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' }
  ];

  return (
    <AdminPageTemplate title="Stock Management" description="Manage inventory stock levels" stats={stats}>
      <div className="glass-card-premium p-6 hover-glow">
        <div className="text-center py-12">
          <ArchiveBoxIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Stock management interface ready for implementation</p>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default InventoryStock;
