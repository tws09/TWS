import React from 'react';
import AdminPageTemplate from '../../../features/admin/components/admin/AdminPageTemplate';
import { CubeIcon } from '@heroicons/react/24/outline';

const OperationsAssets = () => {
  const stats = [
    { label: 'Total Assets', value: '342', icon: CubeIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' }
  ];

  return (
    <AdminPageTemplate title="Assets" description="Track and manage company assets" stats={stats}>
      <div className="glass-card-premium p-6 hover-glow">
        <div className="text-center py-12">
          <CubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Asset management interface ready for implementation</p>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default OperationsAssets;
