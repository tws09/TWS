import React from 'react';
import AdminPageTemplate from '../../../features/admin/components/admin/AdminPageTemplate';
import { BellAlertIcon } from '@heroicons/react/24/outline';

const InventoryAlerts = () => {
  const stats = [
    { label: 'Active Alerts', value: '12', icon: BellAlertIcon, iconBg: 'bg-gradient-to-br from-red-500 to-pink-600' }
  ];

  return (
    <AdminPageTemplate title="Stock Alerts" description="Monitor stock level alerts" stats={stats}>
      <div className="glass-card-premium p-6 hover-glow">
        <div className="text-center py-12">
          <BellAlertIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Stock alert monitoring interface ready for implementation</p>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default InventoryAlerts;
