import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  PlusIcon,
  UserCircleIcon,
  BriefcaseIcon,
  ClockIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { resourceService } from '../../../services/resourceService';
import { useAuth } from '../../../context/AuthContext';

const Resources = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceForm, setResourceForm] = useState({
    userId: '',
    department: '',
    jobTitle: '',
    skills: [],
    availability: {
      status: 'available',
      weeklyHours: 40,
      maxAllocation: 100
    },
    cost: {
      hourlyRate: 0,
      currency: 'USD'
    }
  });

  // Real data from API
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState({
    totalResources: 0,
    activeResources: 0,
    availableResources: 0,
    avgUtilization: 0
  });

  // Load resources on component mount
  useEffect(() => {
    loadResources();
    loadStats();
  }, [searchTerm, filterRole, filterAvailability]);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterRole !== 'all') params.department = filterRole;
      if (filterAvailability !== 'all') params.availability = filterAvailability;
      
      const response = await resourceService.getResources(params);
      if (response.success) {
        setResources(response.data.resources);
      }
    } catch (err) {
      setError('Failed to load resources');
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await resourceService.getResourceStats();
      if (response.success) {
        setStats(response.data.overview);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'busy':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'unavailable':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'on_leave':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getAllocationColor = (allocation) => {
    if (allocation === 0) return 'bg-gray-500';
    if (allocation <= 50) return 'bg-green-500';
    if (allocation <= 80) return 'bg-yellow-500';
    if (allocation <= 100) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Resource management handlers
  const handleDeleteResource = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        const response = await resourceService.deleteResource(resourceId);
        if (response.success) {
          loadResources();
          loadStats();
        }
      } catch (err) {
        console.error('Error deleting resource:', err);
        setError('Failed to delete resource');
      }
    }
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setResourceForm({
      userId: resource.userId?._id || '',
      department: resource.department || '',
      jobTitle: resource.jobTitle || '',
      skills: resource.skills || [],
      availability: {
        status: resource.availability?.status || 'available',
        weeklyHours: resource.availability?.weeklyHours || 40,
        maxAllocation: resource.availability?.maxAllocation || 100
      },
      cost: {
        hourlyRate: resource.cost?.hourlyRate || 0,
        currency: resource.cost?.currency || 'USD'
      }
    });
    setShowResourceForm(true);
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      const response = await resourceService.createResource(resourceForm);
      if (response.success) {
        setShowResourceForm(false);
        setResourceForm({
          userId: '',
          department: '',
          jobTitle: '',
          skills: [],
          availability: {
            status: 'available',
            weeklyHours: 40,
            maxAllocation: 100
          },
          cost: {
            hourlyRate: 0,
            currency: 'USD'
          }
        });
        loadResources();
        loadStats();
      }
    } catch (err) {
      console.error('Error creating resource:', err);
      setError('Failed to create resource');
    }
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    try {
      const response = await resourceService.updateResource(editingResource._id, resourceForm);
      if (response.success) {
        setShowResourceForm(false);
        setEditingResource(null);
        setResourceForm({
          userId: '',
          department: '',
          jobTitle: '',
          skills: [],
          availability: {
            status: 'available',
            weeklyHours: 40,
            maxAllocation: 100
          },
          cost: {
            hourlyRate: 0,
            currency: 'USD'
          }
        });
        loadResources();
        loadStats();
      }
    } catch (err) {
      console.error('Error updating resource:', err);
      setError('Failed to update resource');
    }
  };

  const openResourceForm = () => {
    setResourceForm({
      userId: '',
      department: '',
      jobTitle: '',
      skills: [],
      availability: {
        status: 'available',
        weeklyHours: 40,
        maxAllocation: 100
      },
      cost: {
        hourlyRate: 0,
        currency: 'USD'
      }
    });
    setEditingResource(null);
    setShowResourceForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card-premium p-4 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Total Resources</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalResources}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="glass-card-premium p-4 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Available</p>
              <p className="text-2xl font-bold text-green-600">{stats.availableResources}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <UserCircleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="glass-card-premium p-4 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Active</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeResources}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <BriefcaseIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="glass-card-premium p-4 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Avg Utilization</p>
              <p className="text-2xl font-bold text-purple-600">{Math.round(stats.avgUtilization)}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card-premium p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 glass-input"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="glass-input px-4 py-2"
          >
            <option value="all">All Roles</option>
            <option value="Senior Developer">Senior Developer</option>
            <option value="UI/UX Designer">UI/UX Designer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="QA Engineer">QA Engineer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
          </select>
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="glass-input px-4 py-2"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="fully_allocated">Fully Allocated</option>
            <option value="over_allocated">Over Allocated</option>
          </select>
          <button 
            onClick={openResourceForm}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer shadow-lg"
            type="button"
            style={{ fontSize: '16px', minWidth: '150px' }}
          >
            <PlusIcon className="w-5 h-5 inline mr-2" />
            Add Resource
          </button>
        </div>
      </div>

      {/* Utilization Overview */}
      <div className="glass-card-premium p-6">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-6">
          Team Utilization Overview
        </h3>
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource._id} className="glass-card p-4 hover-glow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                    {resource.userId?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {resource.userId?.fullName || 'Unknown User'}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {resource.jobTitle} • {resource.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(resource.availability?.status)}`}>
                    {resource.availability?.status?.replace('_', ' ') || 'unknown'}
                </span>
                  <button
                    onClick={() => handleEditResource(resource)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <PencilIcon className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteResource(resource._id)}
                    className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded"
                  >
                    <TrashIcon className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Utilization Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Utilization</span>
                  <span className="font-bold text-gray-900 dark:text-white">{resource.availability?.currentAllocation || 0}%</span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${getAllocationColor(resource.availability?.currentAllocation || 0)}`}
                    style={{ width: `${Math.min(resource.availability?.currentAllocation || 0, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {resource.skills?.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs font-medium"
                    >
                      {skill.name}
                    </span>
                  )) || <span className="text-xs text-gray-500">No skills listed</span>}
                </div>
              </div>

              {/* Projects */}
              {resource.workload?.currentProjects && resource.workload.currentProjects.length > 0 ? (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">Current Projects</p>
                  <div className="space-y-2">
                    {resource.workload.currentProjects.map((project, idx) => (
                      <div key={idx} className="glass-card p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FolderIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs text-gray-900 dark:text-white font-medium">
                            {project.projectId?.name || 'Unknown Project'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">• {project.role}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{project.allocation}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-4 text-center py-4 glass-card">
                  <p className="text-xs text-gray-500 dark:text-gray-500">No active projects</p>
                </div>
              )}

              {/* Hours Summary */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Available Hours</p>
                  <p className="text-lg font-bold text-green-600">{resource.workload?.availableHours || 0}h</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">This Week</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{resource.timeTracking?.hoursThisWeek || 0}h</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">This Month</p>
                  <p className="text-lg font-bold text-blue-600">{resource.timeTracking?.hoursThisMonth || 0}h</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {resources.length === 0 && !loading && (
        <div className="glass-card-premium p-12 text-center">
          <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            No resources found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card-premium p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading resources...</p>
          </div>
        </div>
      )}

      {/* Resource Form Modal */}
      {showResourceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md mx-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </h3>
            
            <form onSubmit={editingResource ? handleUpdateResource : handleCreateResource} className="space-y-4">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={resourceForm.department}
                  onChange={(e) => setResourceForm({...resourceForm, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={resourceForm.jobTitle}
                  onChange={(e) => setResourceForm({...resourceForm, jobTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="availabilityStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Availability Status
                </label>
                <select
                  id="availabilityStatus"
                  name="availabilityStatus"
                  value={resourceForm.availability.status}
                  onChange={(e) => setResourceForm({
                    ...resourceForm, 
                    availability: {...resourceForm.availability, status: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              <div>
                <label htmlFor="weeklyHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weekly Hours
                </label>
                <input
                  type="number"
                  id="weeklyHours"
                  name="weeklyHours"
                  value={resourceForm.availability.weeklyHours}
                  onChange={(e) => setResourceForm({
                    ...resourceForm, 
                    availability: {...resourceForm.availability, weeklyHours: parseInt(e.target.value)}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="80"
                />
              </div>

              <div>
                <label htmlFor="maxAllocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Allocation (%)
                </label>
                <input
                  type="number"
                  id="maxAllocation"
                  name="maxAllocation"
                  value={resourceForm.availability.maxAllocation}
                  onChange={(e) => setResourceForm({
                    ...resourceForm, 
                    availability: {...resourceForm.availability, maxAllocation: parseInt(e.target.value)}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hourly Rate
                </label>
                <input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  value={resourceForm.cost.hourlyRate}
                  onChange={(e) => setResourceForm({
                    ...resourceForm, 
                    cost: {...resourceForm.cost, hourlyRate: parseFloat(e.target.value)}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  {editingResource ? 'Update Resource' : 'Add Resource'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResourceForm(false);
                    setEditingResource(null);
                  }}
                  className="flex-1 bg-gray-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
