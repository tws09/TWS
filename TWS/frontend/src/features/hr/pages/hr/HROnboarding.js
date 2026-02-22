import React from 'react';
import AdminPageTemplate from '../../../../features/admin/components/admin/AdminPageTemplate';
import { 
  UserPlusIcon, 
  ClipboardDocumentCheckIcon,
  AcademicCapIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const HROnboarding = () => {
  const stats = [
    { label: 'New Hires This Month', value: '3', icon: UserPlusIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'In Progress', value: '5', icon: ClipboardDocumentCheckIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { label: 'Completed', value: '28', icon: CheckCircleIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'Training Sessions', value: '12', icon: AcademicCapIcon, iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' }
  ];

  const onboardingList = [
    { name: 'Alice Cooper', position: 'Software Engineer', startDate: '2024-01-15', progress: 75, status: 'In Progress' },
    { name: 'Bob Martinez', position: 'Product Designer', startDate: '2024-01-10', progress: 45, status: 'In Progress' },
    { name: 'Carol White', position: 'Marketing Manager', startDate: '2024-01-08', progress: 90, status: 'Almost Complete' }
  ];

  return (
    <AdminPageTemplate
      title="Onboarding"
      description="Manage new employee onboarding processes"
      stats={stats}
    >
      {/* Active Onboarding */}
      <div className="glass-card-premium p-6 hover-glow">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
          Active Onboarding Processes
        </h3>
        <div className="space-y-4">
          {onboardingList.map((employee, index) => (
            <div key={index} className="glass-card p-4 hover-lift">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{employee.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{employee.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{employee.position} • Started {employee.startDate}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                        style={{ width: `${employee.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{employee.progress}%</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  employee.progress >= 90 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {employee.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onboarding Checklist Template */}
      <div className="glass-card-premium p-6 hover-glow">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
          Standard Onboarding Checklist
        </h3>
        <div className="space-y-3">
          {[
            'Complete HR documentation',
            'IT equipment setup',
            'System access and accounts',
            'Company orientation',
            'Department introduction',
            'Assign mentor/buddy',
            'First project assignment',
            '30-day check-in'
          ].map((item, index) => (
            <div key={index} className="glass-card p-3 flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default HROnboarding;
