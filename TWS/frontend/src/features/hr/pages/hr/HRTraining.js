import React from 'react';
import AdminPageTemplate from '../../../../features/admin/components/admin/AdminPageTemplate';
import { 
  AcademicCapIcon, 
  BookOpenIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const HRTraining = () => {
  const stats = [
    { label: 'Active Programs', value: '12', icon: AcademicCapIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Total Courses', value: '45', icon: BookOpenIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'Enrolled Employees', value: '89', icon: VideoCameraIcon, iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' },
    { label: 'Completed This Month', value: '156', icon: CheckCircleIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' }
  ];

  const actions = (
    <button className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
      <PlusIcon className="w-5 h-5" />
      <span className="font-medium">Create Program</span>
    </button>
  );

  const trainingPrograms = [
    { title: 'Leadership Development', participants: 24, duration: '8 weeks', status: 'Active', completion: 65 },
    { title: 'Technical Skills Bootcamp', participants: 35, duration: '6 weeks', status: 'Active', completion: 45 },
    { title: 'Communication Excellence', participants: 18, duration: '4 weeks', status: 'Active', completion: 80 }
  ];

  return (
    <AdminPageTemplate
      title="Training & Development"
      description="Manage employee training programs and courses"
      stats={stats}
      actions={actions}
    >
      {/* Training Programs */}
      <div className="glass-card-premium p-6 hover-glow">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
          Active Training Programs
        </h3>
        <div className="space-y-4">
          {trainingPrograms.map((program, index) => (
            <div key={index} className="glass-card p-4 hover-lift">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{program.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <span>{program.participants} participants</span>
                    <span>•</span>
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                        style={{ width: `${program.completion}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{program.completion}%</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {program.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-premium p-6 hover-glow">
          <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
            Popular Courses
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Advanced JavaScript', enrolled: 32 },
              { name: 'Project Management Fundamentals', enrolled: 28 },
              { name: 'Effective Communication', enrolled: 25 },
              { name: 'Data Analytics', enrolled: 22 }
            ].map((course, index) => (
              <div key={index} className="glass-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpenIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{course.name}</span>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{course.enrolled} enrolled</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card-premium p-6 hover-glow">
          <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
            Completion Rate by Department
          </h3>
          <div className="space-y-4">
            {[
              { department: 'Engineering', rate: 85 },
              { department: 'Design', rate: 78 },
              { department: 'Management', rate: 92 },
              { department: 'Sales', rate: 67 }
            ].map((dept, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{dept.department}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{dept.rate}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                    style={{ width: `${dept.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default HRTraining;
