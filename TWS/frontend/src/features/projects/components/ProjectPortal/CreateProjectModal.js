import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import projectApiService from '../../services/projectApiService';
import { validateProjectForm, sanitizeProjectData } from '../../utils/validation';
import { handleApiError, handleSuccess } from '../../utils/errorHandler';
import { SUCCESS_MESSAGES, PROJECT_PRIORITY, CURRENCIES } from '../../constants/projectConstants';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated, clients }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    budget: {
      total: '',
      currency: 'USD'
    },
    timeline: {
      startDate: '',
      endDate: '',
      estimatedHours: ''
    },
          priority: PROJECT_PRIORITY.MEDIUM,
    settings: {
      allowClientAccess: true,
      clientCanComment: true,
      clientCanApprove: true,
      requireApproval: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const validation = validateProjectForm(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Sanitize and prepare data
      const sanitizedData = sanitizeProjectData({
        ...formData,
        budget: {
          ...formData.budget,
          total: formData.budget.total ? parseFloat(formData.budget.total) : 0
        },
        timeline: {
          ...formData.timeline,
          estimatedHours: formData.timeline.estimatedHours ? parseInt(formData.timeline.estimatedHours, 10) : null
        }
      });
      
      const response = await projectApiService.createProject(sanitizedData);
      
      if (response.success) {
        handleSuccess(SUCCESS_MESSAGES.PROJECT_CREATED);
        onProjectCreated();
        onClose();
        setFormData({
          name: '',
          description: '',
          clientId: '',
          budget: { total: '', currency: CURRENCIES.USD },
          timeline: { startDate: '', endDate: '', estimatedHours: '' },
          priority: PROJECT_PRIORITY.MEDIUM,
          settings: {
            allowClientAccess: true,
            clientCanComment: true,
            clientCanApprove: true,
            requireApproval: false
          }
        });
        setErrors({});
      } else {
        handleApiError(new Error(response.message || 'Failed to create project'));
      }
    } catch (error) {
      handleApiError(error, 'Failed to create project');
      if (error.data?.errors) {
        setErrors(error.data.errors);
      } else if (error.message) {
        setErrors({ submit: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter project name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the project..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.clientId ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={PROJECT_PRIORITY.LOW}>Low</option>
                    <option value={PROJECT_PRIORITY.MEDIUM}>Medium</option>
                    <option value={PROJECT_PRIORITY.HIGH}>High</option>
                    <option value={PROJECT_PRIORITY.URGENT}>Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Budget & Timeline */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Budget & Timeline</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget
                  </label>
                  <div className="flex">
                    <select
                      name="budget.currency"
                      value={formData.budget.currency}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={CURRENCIES.USD}>USD</option>
                      <option value={CURRENCIES.EUR}>EUR</option>
                      <option value={CURRENCIES.GBP}>GBP</option>
                    </select>
                    <input
                      type="number"
                      name="budget.total"
                      value={formData.budget.total}
                      onChange={handleInputChange}
                      className={`flex-1 border border-gray-300 rounded-r-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.budget ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    name="timeline.estimatedHours"
                    value={formData.timeline.estimatedHours}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.estimatedHours ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.estimatedHours && <p className="text-red-500 text-sm mt-1">{errors.estimatedHours}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="timeline.startDate"
                    value={formData.timeline.startDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="timeline.endDate"
                    value={formData.timeline.endDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Client Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Client Access Settings</h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="settings.allowClientAccess"
                    checked={formData.settings.allowClientAccess}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow client access to project</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="settings.clientCanComment"
                    checked={formData.settings.clientCanComment}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Client can comment on cards</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="settings.clientCanApprove"
                    checked={formData.settings.clientCanApprove}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Client can approve deliverables</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="settings.requireApproval"
                    checked={formData.settings.requireApproval}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Require client approval before completion</span>
                </label>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
