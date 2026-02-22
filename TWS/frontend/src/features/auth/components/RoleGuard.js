import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthContext';

const RoleGuard = ({ 
  allowedRoles, 
  allowedOrganizations = ['wolfstack'], // Default to TWS organization
  children, 
  redirectTo = '/login' 
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  const userRole = user.role;
  const userOrg = user.orgId?.slug;
  
  // Check role permission
  const isRoleAllowed = Array.isArray(allowedRoles) 
    ? allowedRoles.includes(userRole)
    : userRole === allowedRoles;

  // Check organization permission
  const isOrgAllowed = Array.isArray(allowedOrganizations)
    ? allowedOrganizations.includes(userOrg)
    : userOrg === allowedOrganizations;

  if (!isRoleAllowed || !isOrgAllowed) {
    // Redirect based on user role and organization
    if (userRole === 'employee') {
      // Employee portal removed - redirect to landing
      return <Navigate to="/landing" replace />;
    } else {
      return <Navigate to="/projects" replace />;
    }
  }

  return children;
};

export default RoleGuard;
