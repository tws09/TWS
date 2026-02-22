/**
 * Projects API Service
 * Centralized API service for all project-related operations
 * Uses axiosInstance with automatic authentication
 */

import axiosInstance from '../../../shared/utils/axiosInstance';
import { API_ENDPOINTS, ERROR_MESSAGES } from '../constants/projectConstants';

/**
 * Projects API Service
 */
class ProjectApiService {
  /**
   * Get all projects
   * @param {Object} params - Query parameters (filters, pagination)
   * @returns {Promise} API response
   */
  async getProjects(params = {}) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PROJECTS, { params });
      return {
        success: response.data?.success ?? true,
        data: response.data?.data ?? response.data,
        message: response.data?.message
      };
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  /**
   * Get a single project by ID
   * @param {string} projectId - Project ID
   * @returns {Promise} API response
   */
  async getProject(projectId) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PROJECT(projectId));
      return {
        success: response.data?.success ?? true,
        data: response.data?.data ?? response.data,
        message: response.data?.message
      };
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.NOT_FOUND);
    }
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @returns {Promise} API response
   */
  async createProject(projectData) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.PROJECTS, projectData);
      return {
        success: response.data?.success ?? true,
        data: response.data?.data ?? response.data,
        message: response.data?.message
      };
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.VALIDATION_ERROR);
    }
  }

  /**
   * Update a project
   * @param {string} projectId - Project ID
   * @param {Object} projectData - Updated project data
   * @returns {Promise} API response
   */
  async updateProject(projectId, projectData) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.PROJECT(projectId), projectData);
      return {
        success: response.data?.success ?? true,
        data: response.data?.data ?? response.data,
        message: response.data?.message
      };
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.VALIDATION_ERROR);
    }
  }

  /**
   * Delete a project
   * @param {string} projectId - Project ID
   * @returns {Promise} API response
   */
  async deleteProject(projectId) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.PROJECT(projectId));
      return {
        success: response.data?.success ?? true,
        data: response.data?.data ?? response.data,
        message: response.data?.message
      };
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Get project metrics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getProjectMetrics(params = {}) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PROJECT_METRICS, { params });
      return {
        success: response.data?.success ?? true,
        data: response.data?.data ?? response.data,
        message: response.data?.message
      };
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  /**
   * Get all clients
   * @returns {Promise} API response
   */
  async getClients() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.CLIENTS);
      return {
        success: response.data?.success ?? true,
        data: response.data?.data ?? response.data,
        message: response.data?.message
      };
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  /**
   * Create a new client
   * @param {Object} clientData - Client data
   * @returns {Promise} API response
   */
  async createClient(clientData) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CLIENTS, clientData);
      return {
        success: response.data?.success ?? true,
        data: response.data?.data ?? response.data,
        message: response.data?.message
      };
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.VALIDATION_ERROR);
    }
  }

  /**
   * Update a client
   * @param {string} clientId - Client ID
   * @param {Object} clientData - Updated client data
   * @returns {Promise} API response
   */
  async updateClient(clientId, clientData) {
    if (!clientId) {
      throw new Error('Client ID is required');
    }
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.CLIENT(clientId), clientData);
      return {
        success: response.data?.success ?? true,
        data: response.data?.data ?? response.data,
        message: response.data?.message
      };
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.VALIDATION_ERROR);
    }
  }

  /**
   * Delete a client
   * @param {string} clientId - Client ID
   * @returns {Promise} API response
   */
  async deleteClient(clientId) {
    if (!clientId) {
      throw new Error('Client ID is required');
    }
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.CLIENT(clientId));
      return {
        success: response.data?.success ?? true,
        data: response.data?.data ?? response.data,
        message: response.data?.message
      };
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Get boards for a project
   * @param {string} projectId - Project ID
   * @returns {Promise} API response
   */
  async getProjectBoards(projectId) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PROJECT_BOARDS(projectId));
      return {
        success: response.data?.success ?? true,
        data: response.data?.data ?? response.data,
        message: response.data?.message
      };
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  /**
   * Update a card
   * @param {string} cardId - Card ID
   * @param {Object} cardData - Updated card data
   * @returns {Promise} API response
   */
  async updateCard(cardId, cardData) {
    if (!cardId) {
      throw new Error('Card ID is required');
    }
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.CARD(cardId), cardData);
      return {
        success: response.data?.success ?? true,
        data: response.data?.data ?? response.data,
        message: response.data?.message
      };
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.VALIDATION_ERROR);
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - Error object
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Enhanced error object
   */
  handleError(error, defaultMessage) {
    if (error.isApiError) {
      return error;
    }

    if (error.isNetworkError) {
      return new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    const message = error.response?.data?.message || error.message || defaultMessage;
    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    enhancedError.isApiError = true;

    return enhancedError;
  }
}

// Export singleton instance
export default new ProjectApiService();

