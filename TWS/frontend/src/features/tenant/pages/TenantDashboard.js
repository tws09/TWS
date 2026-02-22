import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

/**
 * Tenant Dashboard Component
 * Main dashboard for tenant-level overview
 * Redirects to organization dashboard for now
 */
const TenantDashboard = () => {
  const { tenantSlug } = useParams();

  // Redirect to organization dashboard
  // The organization dashboard provides the main tenant overview
  return <Navigate to={`/${tenantSlug}/org/dashboard`} replace />;
};

export default TenantDashboard;

