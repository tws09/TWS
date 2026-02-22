import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // SECURITY FIX: Include cookies for authentication
});

// SECURITY FIX: Removed localStorage token access - tokens are in HttpOnly cookies
// Cookies are sent automatically with withCredentials: true
api.interceptors.request.use((config) => {
  // SECURITY FIX: No Authorization header needed - cookies are sent automatically
  return config;
});

// Partner API service
export const partnerService = {
  // Get all partners (admin only)
  getPartners: async (status = 'all', limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc') => {
    try {
      const response = await api.get('/partners', {
        params: { status, limit, offset, sortBy, sortOrder }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw error;
    }
  },

  // Get specific partner details
  getPartner: async (partnerId) => {
    try {
      const response = await api.get(`/partners/${partnerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching partner:', error);
      throw error;
    }
  },

  // Create new partner (admin only)
  createPartner: async (partnerData) => {
    try {
      const response = await api.post('/partners', partnerData);
      return response.data;
    } catch (error) {
      console.error('Error creating partner:', error);
      throw error;
    }
  },

  // Update partner
  updatePartner: async (partnerId, updates) => {
    try {
      const response = await api.put(`/partners/${partnerId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating partner:', error);
      throw error;
    }
  },

  // Delete partner (admin only)
  deletePartner: async (partnerId) => {
    try {
      const response = await api.delete(`/partners/${partnerId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw error;
    }
  },

  // Get tenants referred by partner
  getPartnerTenants: async (partnerId, status = 'all', limit = 20, offset = 0) => {
    try {
      const response = await api.get(`/partners/${partnerId}/tenants`, {
        params: { status, limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching partner tenants:', error);
      throw error;
    }
  },

  // Get partner commission history
  getPartnerCommission: async (partnerId, startDate = null, endDate = null, limit = 50, offset = 0) => {
    try {
      const params = { limit, offset };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get(`/partners/${partnerId}/commission`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching partner commission:', error);
      throw error;
    }
  },

  // Add commission record for partner (admin only)
  addCommission: async (partnerId, commissionData) => {
    try {
      const response = await api.post(`/partners/${partnerId}/commission`, commissionData);
      return response.data;
    } catch (error) {
      console.error('Error adding commission record:', error);
      throw error;
    }
  },

  // Get partner performance analytics
  getPartnerPerformance: async (partnerId, period = 'monthly') => {
    try {
      const response = await api.get(`/partners/${partnerId}/performance`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching partner performance:', error);
      throw error;
    }
  },

  // Assign tenant to partner (admin only)
  assignTenant: async (partnerId, tenantId) => {
    try {
      const response = await api.post(`/partners/${partnerId}/assign-tenant`, {
        tenantId
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning tenant to partner:', error);
      throw error;
    }
  },

  // Remove tenant from partner (admin only)
  removeTenant: async (partnerId, tenantId) => {
    try {
      const response = await api.delete(`/partners/${partnerId}/tenants/${tenantId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing tenant from partner:', error);
      throw error;
    }
  },

  // Get partner dashboard data
  getPartnerDashboard: async (partnerId) => {
    try {
      const [partner, performance, commission, tenants] = await Promise.all([
        partnerService.getPartner(partnerId),
        partnerService.getPartnerPerformance(partnerId),
        partnerService.getPartnerCommission(partnerId, null, null, 10, 0),
        partnerService.getPartnerTenants(partnerId, 'all', 10, 0)
      ]);

      return {
        success: true,
        data: {
          partner: partner.data.partner,
          performance: performance.data.performance,
          commission: commission.data,
          tenants: tenants.data,
          summary: {
            totalTenants: partner.data.partner.referredTenants.length,
            activeTenants: partner.data.partner.referredTenants.filter(t => t.subscription.status === 'active').length,
            totalCommission: partner.data.partner.commissionHistory.reduce((sum, comm) => sum + comm.amount, 0),
            monthlyRecurringRevenue: partner.data.partner.referredTenants
              .filter(t => t.subscription.status === 'active')
              .reduce((sum, t) => sum + (t.subscription.price || 0), 0)
          }
        }
      };
    } catch (error) {
      console.error('Error fetching partner dashboard:', error);
      throw error;
    }
  },

  // Export partner data
  exportPartnerData: async (partnerId, format = 'json') => {
    try {
      const response = await api.get(`/partners/${partnerId}/export`, {
        params: { format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        // Handle CSV download
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `partner-${partnerId}-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return { success: true, message: 'Partner data exported successfully' };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error exporting partner data:', error);
      throw error;
    }
  }
};

export default partnerService;
