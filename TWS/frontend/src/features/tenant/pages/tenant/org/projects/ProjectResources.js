import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  PlusIcon,
  UserCircleIcon,
  BriefcaseIcon,
  ClockIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import tenantProjectApiService from './services/tenantProjectApiService';
import tenantApiService from '../../../../../../shared/services/tenant/tenant-api.service';
import { RESOURCE_STATUS } from './constants/projectConstants';

const ProjectResources = () => {
  const { tenantSlug } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (tenantSlug) {
      fetchResources();
    }
  }, [tenantSlug]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await tenantProjectApiService.getProjectResources(tenantSlug);
      
      if (Array.isArray(data)) {
        setResources(data);
      } else if (data?.resources) {
        setResources(data.resources);
      } else {
        setResources([]);
      }

      // Extract unique roles for filter
      const uniqueRoles = [...new Set(resources.map(r => r.role || r.position).filter(Boolean))];
      setRoles(uniqueRoles);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case RESOURCE_STATUS.AVAILABLE:
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case RESOURCE_STATUS.FULLY_ALLOCATED:
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case RESOURCE_STATUS.OVER_ALLOCATED:
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case RESOURCE_STATUS.ON_LEAVE:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
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

  const handleAllocateResource = async (resourceId, allocationData) => {
    try {
      await tenantApiService.allocateResource(tenantSlug, resourceId, allocationData);
      alert('Resource allocated successfully!');
      fetchResources();
    } catch (error) {
      console.error('Error allocating resource:', error);
      alert(error.message || 'Failed to allocate resource. Please try again.');
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = (resource.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (resource.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (resource.role || resource.position || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || (resource.role || resource.position) === filterRole;
    const matchesAvailability = filterAvailability === 'all' || resource.status === filterAvailability;
    return matchesSearch && matchesRole && matchesAvailability;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading resources...</p>
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
            Project Resources
          </h1>
          <p className="text-sm xl:text-base text-gray-600 dark:text-gray-300 mt-1">
            Manage team resources and allocation
          </p>
        </div>
        <button className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
          <PlusIcon className="w-5 h-5" />
          <span className="font-medium">Add Resource</span>
        </button>
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
              className="w-full pl-10 pr-4 py-2 glass-input rounded-xl"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="glass-input px-4 py-2 rounded-xl"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="glass-input px-4 py-2 rounded-xl"
          >
            <option value="all">All Availability</option>
            <option value={RESOURCE_STATUS.AVAILABLE}>Available</option>
            <option value={RESOURCE_STATUS.FULLY_ALLOCATED}>Fully Allocated</option>
            <option value={RESOURCE_STATUS.OVER_ALLOCATED}>Over Allocated</option>
            <option value={RESOURCE_STATUS.ON_LEAVE}>On Leave</option>
          </select>
        </div>
      </div>

      {/* Utilization Overview */}
      <div className="glass-card-premium p-6">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-6">
          Team Utilization Overview
        </h3>
        <div className="space-y-4">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <div key={resource._id || resource.id} className="glass-card p-4 hover-glow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                      {(resource.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{resource.name || 'Unnamed'}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {resource.role || resource.position || 'No role'} • {resource.department || 'No department'}
                      </p>
                      {resource.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">{resource.email}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(resource.status || RESOURCE_STATUS.AVAILABLE)}`}>
                    {(resource.status || RESOURCE_STATUS.AVAILABLE).replace('_', ' ')}
                  </span>
                </div>

                {/* Utilization Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Utilization</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {resource.totalAllocation || resource.utilization || 0}%
                    </span>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${getAllocationColor(resource.totalAllocation || resource.utilization || 0)}`}
                      style={{ width: `${Math.min(resource.totalAllocation || resource.utilization || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Skills */}
                {resource.skills && resource.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {resource.skills.map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs font-medium"
                        >
                          {typeof skill === 'string' ? skill : skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resource.projects && resource.projects.length > 0 ? (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">Current Projects</p>
                    <div className="space-y-2">
                      {resource.projects.map((project, idx) => (
                        <div key={idx} className="glass-card p-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FolderIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-900 dark:text-white font-medium">
                              {typeof project === 'object' ? (project.name || project.projectId?.name) : project}
                            </span>
                            {typeof project === 'object' && project.role && (
                              <span className="text-xs text-gray-500 dark:text-gray-500">• {project.role}</span>
                            )}
                          </div>
                          {typeof project === 'object' && project.allocation && (
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{project.allocation}%</span>
                          )}
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
                {(resource.availableHours !== undefined || resource.hoursThisWeek !== undefined || resource.hoursThisMonth !== undefined) && (
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Available Hours</p>
                      <p className="text-lg font-bold text-green-600">{resource.availableHours || 0}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">This Week</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{resource.hoursThisWeek || 0}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">This Month</p>
                      <p className="text-lg font-bold text-blue-600">{resource.hoursThisMonth || 0}h</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                No resources found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterRole !== 'all' || filterAvailability !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Add resources to start tracking team utilization'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectResources;

