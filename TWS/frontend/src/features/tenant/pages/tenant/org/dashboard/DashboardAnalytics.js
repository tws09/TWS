import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tenantApiService } from '../../../../../../shared/services/tenant/tenant-api.service';

const DashboardAnalytics = () => {
  const { tenantSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [tenantSlug]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantApiService.getDashboardAnalytics(tenantSlug);
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
        <p className="text-gray-600">
          Detailed analytics and insights for your organization
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Analytics Coming Soon</h2>
        <p className="text-gray-600">
          Advanced analytics and reporting features will be available here.
          This will include charts, graphs, and detailed insights into your organization's performance.
        </p>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
