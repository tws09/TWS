/**
 * List API Service
 * Handles list-related API operations
 */

import axiosInstance from '../../../shared/utils/axiosInstance';

class ListApiService {
  /**
   * Update a list
   * @param {string} listId - List ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise} API response
   */
  async updateList(listId, updates) {
    if (!listId) {
      throw new Error('List ID is required');
    }
    try {
      const response = await axiosInstance.patch(`/api/lists/${listId}`, updates);
      return {
        success: response.data?.success ?? true,
        data: response.data?.data ?? response.data,
        message: response.data?.message
      };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update list';
      const enhancedError = new Error(message);
      enhancedError.status = error.response?.status;
      enhancedError.data = error.response?.data;
      enhancedError.isApiError = true;
      throw enhancedError;
    }
  }
}

export default new ListApiService();

