import React from 'react';
import AdminPageTemplate from '../../../features/admin/components/admin/AdminPageTemplate';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const InventoryOrders = () => {
  const stats = [
    { label: 'Pending Orders', value: '24', icon: ShoppingCartIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' }
  ];

  return (
    <AdminPageTemplate title="Orders" description="Manage purchase and sales orders" stats={stats}>
      <div className="glass-card-premium p-6 hover-glow">
        <div className="text-center py-12">
          <ShoppingCartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Order management interface ready for implementation</p>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default InventoryOrders;
