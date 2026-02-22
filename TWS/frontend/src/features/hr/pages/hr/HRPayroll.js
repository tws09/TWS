import React from 'react';
import AdminPageTemplate from '../../../../features/admin/components/admin/AdminPageTemplate';
import { 
  CurrencyDollarIcon, 
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const HRPayroll = () => {
  const stats = [
    { label: 'Total Payroll', value: '$428K', icon: CurrencyDollarIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'Employees Paid', value: '142', icon: CheckCircleIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Pending Approval', value: '8', icon: ClockIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { label: 'Payroll Cycles', value: '24', icon: BanknotesIcon, iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' }
  ];

  return (
    <AdminPageTemplate
      title="Payroll Management"
      description="Manage employee compensation and payroll processing"
      stats={stats}
    >
      <div className="glass-card-premium p-6 hover-glow">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
          Current Payroll Cycle
        </h3>
        <div className="text-center py-12">
          <BanknotesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Payroll processing interface coming soon</p>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default HRPayroll;
