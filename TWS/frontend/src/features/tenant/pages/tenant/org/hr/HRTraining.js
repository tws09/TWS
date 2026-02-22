import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  BookOpenIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { tenantApiService } from '../../../../../../shared/services/tenant/tenant-api.service';

const HRTraining = () => {
  const { tenantSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [stats, setStats] = useState({
    activePrograms: 0,
    totalCourses: 0,
    enrolledEmployees: 0,
    completedThisMonth: 0
  });

  useEffect(() => {
    fetchTrainingData();
  }, [tenantSlug]);

  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      // TODO: Add training API to tenantApiService
      // const data = await tenantApiService.getTrainingData(tenantSlug);
      // Mock data for now
      const mockData = {
        programs: [
          { title: 'Leadership Development', participants: 24, duration: '8 weeks', status: 'Active', completion: 65 },
          { title: 'Technical Skills Bootcamp', participants: 35, duration: '6 weeks', status: 'Active', completion: 45 },
          { title: 'Communication Excellence', participants: 18, duration: '4 weeks', status: 'Active', completion: 80 }
        ],
        stats: { activePrograms: 12, totalCourses: 45, enrolledEmployees: 89, completedThisMonth: 156 }
      };
      setTrainingPrograms(mockData.programs);
      setStats(mockData.stats);
    } catch (err) {
      console.error('Error fetching training data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { label: 'Active Programs', value: stats.activePrograms.toString(), icon: AcademicCapIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Total Courses', value: stats.totalCourses.toString(), icon: BookOpenIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'Enrolled Employees', value: stats.enrolledEmployees.toString(), icon: VideoCameraIcon, iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' },
    { label: 'Completed This Month', value: stats.completedThisMonth.toString(), icon: CheckCircleIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading training data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Training & Development
          </h1>
          <p className="text-sm xl:text-base text-gray-600 dark:text-gray-300 mt-1">
            Manage employee training programs and courses
          </p>
        </div>
        <button className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
          <PlusIcon className="w-5 h-5" />
          <span className="font-medium">Create Program</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="glass-card-premium p-5 xl:p-6 hover-lift">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 xl:w-14 xl:h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-glow-lg`}>
                <stat.icon className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
              </div>
              <div>
                <p className="text-xs xl:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl xl:text-3xl font-bold font-heading text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Training Programs */}
      <div className="glass-card-premium p-6 xl:p-8 hover-glow">
        <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
          Active Training Programs
        </h3>
        <div className="space-y-4">
          {trainingPrograms.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No active training programs</p>
            </div>
          ) : (
            trainingPrograms.map((program, index) => (
              <div key={index} className="glass-card p-4 hover-lift">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-glow">
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
            ))
          )}
        </div>
      </div>

      {/* Popular Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-premium p-6 xl:p-8 hover-glow">
          <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
            Popular Courses
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Advanced JavaScript', enrolled: 32, completed: 28, rating: 4.8 },
              { name: 'Project Management Fundamentals', enrolled: 28, completed: 24, rating: 4.7 },
              { name: 'Effective Communication', enrolled: 25, completed: 22, rating: 4.9 },
              { name: 'Data Analytics', enrolled: 22, completed: 18, rating: 4.6 }
            ].map((course, index) => {
              const completionRate = (course.completed / course.enrolled) * 100;
              return (
                <div key={index} className="glass-card p-3 flex items-center justify-between hover-lift">
                  <div className="flex items-center gap-3 flex-1">
                    <BookOpenIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900 dark:text-white block truncate">{course.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">{course.enrolled} enrolled</span>
                        <span className="text-xs text-green-600 dark:text-green-400">• {completionRate.toFixed(0)}% completed</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-500">★ {course.rating}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card-premium p-6 xl:p-8 hover-glow">
          <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
            Completion Rate by Department
          </h3>
          <div className="space-y-4">
            {[
              { department: 'Engineering', rate: 85, employees: 45, completed: 38 },
              { department: 'Design', rate: 78, employees: 28, completed: 22 },
              { department: 'Management', rate: 92, employees: 18, completed: 17 },
              { department: 'Sales', rate: 67, employees: 32, completed: 21 }
            ].map((dept, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{dept.department}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">{dept.completed}/{dept.employees}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{dept.rate}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                    style={{ width: `${dept.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Training Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Completions */}
        <div className="glass-card-premium p-6 xl:p-8 hover-glow">
          <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
            Recent Completions
          </h3>
          <div className="space-y-3">
            {[
              { name: 'John Smith', course: 'Advanced JavaScript', date: '2024-01-20', score: 95 },
              { name: 'Sarah Johnson', course: 'Project Management', date: '2024-01-19', score: 92 },
              { name: 'Michael Chen', course: 'Data Analytics', date: '2024-01-18', score: 88 },
              { name: 'Alice Cooper', course: 'Effective Communication', date: '2024-01-17', score: 96 }
            ].map((completion, index) => (
              <div key={index} className="glass-card p-3 flex items-center justify-between hover-lift">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{completion.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{completion.course}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">{completion.score}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{completion.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Training Sessions */}
        <div className="glass-card-premium p-6 xl:p-8 hover-glow">
          <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
            Upcoming Training Sessions
          </h3>
          <div className="space-y-3">
            {[
              { title: 'Technical Skills Bootcamp', date: '2024-01-25', time: '10:00 AM', enrolled: 25 },
              { title: 'Leadership Workshop', date: '2024-01-27', time: '2:00 PM', enrolled: 18 },
              { title: 'Communication Training', date: '2024-01-30', time: '11:00 AM', enrolled: 22 }
            ].map((session, index) => (
              <div key={index} className="glass-card p-3 hover-lift">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{session.title}</p>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{session.enrolled} enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                  <span>{session.date}</span>
                  <span>•</span>
                  <span>{session.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRTraining;

