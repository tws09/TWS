/**
 * Industry API Services - Main Export (Software House only)
 * @module industry
 */

export { softwareHouseApi } from './softwareHouseApi';

export { getAuthHeaders, getBestToken, isValidJWT, clearAllTokens } from './utils/tokenUtils';
export { createCrudClient, createCustomClient } from './utils/apiClientFactory';
export { API_PATHS, buildTenantUrl, getApiPath } from './config/apiConfig';

export const getIndustryApi = (industry) => {
  return require('./softwareHouseApi').softwareHouseApi;
};

