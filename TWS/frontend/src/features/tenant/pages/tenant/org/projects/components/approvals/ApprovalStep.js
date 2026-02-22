/**
 * ApprovalStep Component
 * Individual approval step in the approval chain
 * Nucleus Project OS - Approval Workflow
 */

import React, { useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid
} from '@heroicons/react/24/solid';
import { showError } from '../../utils/toastNotifications';

const ApprovalStep = ({ approval, stepName, onApprove, onReject, isClientView = false }) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusIcon = () => {
    switch (approval.status) {
      case 'approved':
        return <CheckCircleIconSolid className="w-6 h-6 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case 'pending':
        return <ClockIcon className="w-6 h-6 text-gray-400" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (approval.status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`;
      case 'pending':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300`;
    }
  };

  const canUserApprove = () => {
    // Check if current step can proceed and is pending
    return approval.can_proceed && approval.status === 'pending';
  };

  const handleApproveClick = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onApprove(approval._id || approval.id, notes || null);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = async () => {
    if (!rejectionReason.trim()) {
      showError('Please provide a rejection reason');
      return;
    }

    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onReject(approval._id || approval.id, rejectionReason);
      setRejectionReason('');
      setShowRejectForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`approval-step bg-white dark:bg-gray-800 rounded-lg border ${
      approval.status === 'approved' 
        ? 'border-green-200 dark:border-green-800' 
        : approval.status === 'rejected'
        ? 'border-red-200 dark:border-red-800'
        : 'border-gray-200 dark:border-gray-700'
    } p-4 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Status Icon */}
          <div className="flex-shrink-0 mt-1">
            {getStatusIcon()}
          </div>

          {/* Step Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Step {approval.step_number}: {stepName}
              </h4>
              <span className={getStatusBadge()}>
                {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
              </span>
            </div>

            {/* Approver Info */}
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
              <UserIcon className="w-4 h-4" />
              <span>
                {approval.approver_type === 'client' 
                  ? `Client: ${approval.approver_id}`
                  : `Approver ID: ${approval.approver_id}`
                }
              </span>
            </div>

            {/* Timestamp */}
            {approval.signature_timestamp && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {formatDate(approval.signature_timestamp)}
              </p>
            )}

            {/* Rejection Reason */}
            {approval.status === 'rejected' && approval.rejection_reason && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-1">
                  Rejection Reason:
                </p>
                <p className="text-xs text-red-700 dark:text-red-400">
                  {approval.rejection_reason}
                </p>
              </div>
            )}

            {/* Notes */}
            {approval.notes && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Notes:</span> {approval.notes}
                </p>
              </div>
            )}

            {/* Notes Input (for approval) */}
            {canUserApprove() && !showRejectForm && (
              <div className="mt-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                />
              </div>
            )}

            {/* Rejection Form */}
            {showRejectForm && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <label className="block text-xs font-medium text-red-800 dark:text-red-300 mb-1">
                  Rejection Reason (Required):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this step is being rejected..."
                  className="w-full px-3 py-2 text-sm border border-red-300 dark:border-red-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="3"
                  required
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={handleRejectClick}
                    disabled={isSubmitting || !rejectionReason.trim()}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm Rejection'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason('');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {canUserApprove() && !showRejectForm && (
          <div className="flex space-x-2 ml-4">
            <button
              onClick={handleApproveClick}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>{isSubmitting ? 'Approving...' : 'Approve'}</span>
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <XCircleIcon className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </div>
        )}

        {/* Disabled State Message */}
        {!approval.can_proceed && approval.status === 'pending' && (
          <div className="ml-4 text-xs text-gray-500 dark:text-gray-400 italic">
            Waiting for previous step...
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalStep;
