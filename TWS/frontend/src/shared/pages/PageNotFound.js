import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthContext';
import {
  HomeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const PageNotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getHomePath = () => {
    if (!user) return '/landing';
    
    try {
      const tenantData = JSON.parse(localStorage.getItem('tenantData'));
      if (tenantData?.slug) {
        return `/${tenantData.slug}/org/dashboard`;
      }
    } catch (e) {
      // Ignore
    }

    if (user.orgId) {
      const orgSlug = typeof user.orgId === 'object' ? user.orgId.slug : user.orgId;
      if (orgSlug && !orgSlug.match(/^[0-9a-f]{24}$/i)) {
        return `/${orgSlug}/org/dashboard`;
      }
    }

    if (user.tenantId && !user.tenantId.match(/^[0-9a-f]{24}$/i)) {
      return `/${user.tenantId}/org/dashboard`;
    }

    return '/landing';
  };

  const handleGoHome = () => {
    navigate(getHomePath());
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      handleGoHome();
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        {/* 404 Number */}
        <h1 className="text-8xl sm:text-9xl font-bold text-gray-900 mb-4">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-base text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            <HomeIcon className="h-5 w-5" />
            <span>Go Home</span>
          </button>

          <button
            onClick={handleGoBack}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
