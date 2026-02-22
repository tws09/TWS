import React from 'react';
import AdminPageTemplate from '../../../features/admin/components/admin/AdminPageTemplate';
import { Cog6ToothIcon, CubeIcon, BuildingOfficeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const OperationsDashboard = () => {
  const stats = [
    { label: 'Active Workflows', value: '12', icon: Cog6ToothIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Assets', value: '342', icon: CubeIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'Vendors', value: '28', icon: BuildingOfficeIcon, iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' },
    { label: 'Compliance Items', value: '156', icon: ShieldCheckIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' }
  ];

  return (
    <AdminPageTemplate title="Operations" description="Operations management dashboard" stats={stats}>
      <div className="glass-card-premium p-6 hover-glow">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">Operations Overview</h3>
        <div className="text-center py-12">
          <Cog6ToothIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Operations dashboard ready for implementation</p>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default OperationsDashboard;
