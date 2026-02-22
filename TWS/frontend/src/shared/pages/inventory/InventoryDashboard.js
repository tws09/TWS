import React from 'react';
import AdminPageTemplate from '../../../features/admin/components/admin/AdminPageTemplate';
import { CubeIcon, ArchiveBoxIcon, ShoppingCartIcon, TruckIcon } from '@heroicons/react/24/outline';

const InventoryDashboard = () => {
  const stats = [
    { label: 'Total Items', value: '1,240', icon: CubeIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'In Stock', value: '892', icon: ArchiveBoxIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'Pending Orders', value: '24', icon: ShoppingCartIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { label: 'Suppliers', value: '18', icon: TruckIcon, iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' }
  ];

  return (
    <AdminPageTemplate title="Inventory" description="Inventory management dashboard" stats={stats}>
      <div className="glass-card-premium p-6 hover-glow">
        <div className="text-center py-12">
          <CubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Inventory dashboard ready for implementation</p>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default InventoryDashboard;
