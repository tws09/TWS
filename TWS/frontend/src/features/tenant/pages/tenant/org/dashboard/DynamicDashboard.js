import React from 'react';
import { useTenantAuth } from '../../../../../../app/providers/TenantAuthContext';
import DashboardOverview from './DashboardOverview';
import SoftwareHouseDashboard from '../../../../../dashboard/pages/SoftwareHouseDashboard';

/**
 * Dynamic Dashboard Component
 * Selects the appropriate dashboard based on tenant's ERP category (Software House only).
 */
const DynamicDashboard = () => {
  const { tenant } = useTenantAuth();
  const erpCategory = tenant?.erpCategory || 'software_house';

  if (erpCategory === 'software_house') {
    return <SoftwareHouseDashboard />;
  }
  return <DashboardOverview />;
};

export default DynamicDashboard;

