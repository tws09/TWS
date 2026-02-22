import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { get } from '../../../../../shared/utils/apiClient';

const DepartmentAccess = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch platform departments data only
      const departmentsData = await get('/api/supra-admin/departments');
      const realDepartments = ((departmentsData.data || departmentsData || [])).map(department => ({
        id: department._id || department.id,
        name: department.name,
        code: department.code,
        description: department.description,
        status: department.status
      }));

      setDepartments(realDepartments);
      
      console.log('Loaded platform departments:', { 
        departmentsCount: realDepartments.length
      });
    } catch (error) {
      console.error('Error fetching platform departments:', error);
      setDepartments([]);
      alert('Failed to load platform departments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-premium p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Department Access</h1>
              <p className="text-gray-600 dark:text-gray-400">View platform administrators by department</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchData}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Platform Departments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{departments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Platform Admins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {departments.length}
              </p>
            </div>
          </div>
        </div>
        
      </div>

      {/* Platform Departments Info */}
      <div className="space-y-6">
        {departments.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Platform Departments</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Platform departments are created automatically when Supra Admin users are created with a department field.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              The default department is "Platform Administration". To view platform admins by department, go to the Users page.
            </p>
          </div>
        ) : (
          departments.map((department) => (
            <div key={department.id} className="glass-card">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{department.name}</h2>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                      Platform Department
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{department.description}</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    To view platform administrators in this department, go to the <strong>Users</strong> page and filter by department.
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default DepartmentAccess;
