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

// Workspace API service
export const workspaceService = {
  // Get all workspaces for the authenticated user
  getWorkspaces: async (params = {}) => {
    try {
      const response = await api.get('/workspaces', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  },

  // Get single workspace by ID
  getWorkspace: async (workspaceId) => {
    try {
      const response = await api.get(`/workspaces/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace:', error);
      throw error;
    }
  },

  // Create new workspace
  createWorkspace: async (workspaceData) => {
    try {
      console.log('Creating workspace with data:', workspaceData);
      console.log('API base URL:', API_BASE_URL);
      // SECURITY FIX: Removed localStorage token logging - tokens are in HttpOnly cookies
      
      const response = await api.post('/workspaces', workspaceData);
      console.log('Workspace creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating workspace:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update workspace
  updateWorkspace: async (workspaceId, updates) => {
    try {
      const response = await api.patch(`/workspaces/${workspaceId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  },

  // Delete workspace
  deleteWorkspace: async (workspaceId) => {
    try {
      const response = await api.delete(`/workspaces/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw error;
    }
  },

  // Invite member to workspace
  inviteMember: async (workspaceId, memberData) => {
    try {
      const response = await api.post(`/workspaces/${workspaceId}/invite`, memberData);
      return response.data;
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  },

  // Remove member from workspace
  removeMember: async (workspaceId, userId) => {
    try {
      const response = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  },

  // Update member role
  updateMemberRole: async (workspaceId, userId, role) => {
    try {
      const response = await api.patch(`/workspaces/${workspaceId}/members/${userId}`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  },

  // Get workspace channels
  getWorkspaceChannels: async (workspaceId) => {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/channels`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace channels:', error);
      throw error;
    }
  },

  // Get workspace analytics
  getWorkspaceAnalytics: async (workspaceId, period = '30d') => {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/analytics`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace analytics:', error);
      throw error;
    }
  }
};

export default workspaceService;
