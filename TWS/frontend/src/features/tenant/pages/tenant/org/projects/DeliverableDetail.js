/**
 * DeliverableDetail Component
 * Detailed view of a single deliverable
 * Nucleus Project OS - Deliverable Management
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  FlagIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import tenantProjectApiService from './services/tenantProjectApiService';
import { handleApiError } from './utils/errorHandler';
import { DeliverableForm } from './components/deliverables';
import { ApprovalProgress } from './components/approvals';
import { DateValidationForm } from './components/deliverables';
import { ChangeRequestAuditTrail } from './components/changeRequests';
import DeliverableCardSkeleton from './components/deliverables/DeliverableCardSkeleton';

const DeliverableDetail = () => {
  const { tenantSlug, deliverableId } = useParams();
  const navigate = useNavigate();
  const [deliverable, setDeliverable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showValidationForm, setShowValidationForm] = useState(false);

  useEffect(() => {
    if (deliverableId && tenantSlug) {
      fetchDeliverable();
    }
  }, [deliverableId, tenantSlug]);

  const fetchDeliverable = async () => {
    try {
      setLoading(true);
      const response = await tenantProjectApiService.getDeliverable(tenantSlug, deliverableId);
      const deliverableData = response?.data || response;
      if (deliverableData) {
        setDeliverable(deliverableData);
      }
    } catch (err) {
      console.error('Error fetching deliverable:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidationSuccess = () => {
    setShowValidationForm(false);
    fetchDeliverable();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      created: { label: 'Created', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
      in_dev: { label: 'In Development', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      ready_approval: { label: 'Ready for Approval', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
      in_rework: { label: 'In Rework', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
    };
    const statusInfo = statusMap[status] || statusMap.created;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getDaysUntilTarget = (targetDate) => {
    if (!targetDate) return null;
    const now = new Date();
    const target = new Date(targetDate);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
        </div>
        <DeliverableCardSkeleton count={1} />
      </div>
    );
  }

  if (!deliverable) {
    return (
      <div className="glass-card-premium p-12 text-center">
        <FlagIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">Deliverable not found</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const daysUntil = getDaysUntilTarget(deliverable.target_date);
  const isAtRisk = daysUntil !== null && daysUntil > 0 && daysUntil < 7 && (deliverable.progress_percentage || 0) < 80;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl xl:text-3xl font-bold font-heading text-gray-900 dark:text-white">
              {deliverable.name || 'Unnamed Deliverable'}
            </h1>
            <p className="text-sm xl:text-base text-gray-600 dark:text-gray-300 mt-1">
              Deliverable details and progress tracking
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2"
        >
          <PencilIcon className="w-5 h-5" />
          <span className="font-medium">Edit</span>
        </button>
      </div>

      {/* Status and Risk Alert */}
      <div className="glass-card-premium p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusBadge(deliverable.status)}
          {isAtRisk && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm font-semibold">
              <ExclamationTriangleIcon className="w-5 h-5" />
              At Risk
            </div>
          )}
        </div>
        {deliverable.date_confidence !== null && (
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Date Confidence:</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {deliverable.date_confidence}%
            </span>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass-card-premium p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Description</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {deliverable.description || 'No description provided'}
            </p>
          </div>

          {/* Progress */}
          <div className="glass-card-premium p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Progress</h2>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {deliverable.progress_percentage || 0}%
              </span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full ${
                  deliverable.status === 'approved' ? 'bg-green-500' :
                  deliverable.status === 'in_dev' ? 'bg-blue-500' :
                  'bg-gray-400'
                }`}
                style={{ width: `${deliverable.progress_percentage || 0}%` }}
              ></div>
            </div>
            {deliverable.blocking_criteria_met && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircleIcon className="w-5 h-5" />
                <span>All blocking criteria are met</span>
              </div>
            )}
          </div>

          {/* Acceptance Criteria */}
          {deliverable.acceptance_criteria && deliverable.acceptance_criteria.length > 0 && (
            <div className="glass-card-premium p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Acceptance Criteria</h2>
              <div className="space-y-2">
                {deliverable.acceptance_criteria.map((criterion, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={criterion.met || false}
                      disabled
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`flex-1 text-sm ${criterion.met ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      {criterion.description || criterion}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approval Progress */}
          <div className="glass-card-premium p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Approval Progress</h2>
            <ApprovalProgress
              deliverableId={deliverable._id || deliverable.id}
              onApprovalChange={fetchDeliverable}
            />
          </div>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Key Dates */}
          <div className="glass-card-premium p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Key Dates</h2>
            <div className="space-y-4">
              {deliverable.start_date && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Start Date</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(deliverable.start_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {deliverable.target_date && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Target Date</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(deliverable.target_date).toLocaleDateString()}
                  </p>
                  {daysUntil !== null && (
                    <p className={`text-xs mt-1 ${daysUntil < 0 ? 'text-red-600' : daysUntil < 7 ? 'text-yellow-600' : 'text-gray-500'}`}>
                      {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days remaining`}
                    </p>
                  )}
                </div>
              )}
              {deliverable.last_date_validation && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Last Validated</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    {new Date(deliverable.last_date_validation).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            {(!deliverable.last_date_validation || getDaysUntilTarget(deliverable.last_date_validation) > 14) && (
              <button
                onClick={() => setShowValidationForm(true)}
                className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Validate Date
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card-premium p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/${tenantSlug}/org/projects/${deliverable.project_id}/change-requests`)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-left"
              >
                Submit Change Request
              </button>
              <button
                onClick={() => navigate(`/${tenantSlug}/org/projects/${deliverable.project_id}/gantt`)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-left"
              >
                View in Gantt Chart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {isEditing && (
        <DeliverableForm
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          deliverable={deliverable}
          projectId={deliverable.project_id}
          onSuccess={() => {
            setIsEditing(false);
            fetchDeliverable();
          }}
        />
      )}

      {/* Date Validation Form Modal */}
      {showValidationForm && (
        <DateValidationForm
          deliverableId={deliverable._id || deliverable.id}
          onSuccess={handleValidationSuccess}
          onCancel={() => setShowValidationForm(false)}
        />
      )}
    </div>
  );
};

export default DeliverableDetail;
