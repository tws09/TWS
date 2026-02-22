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

// Equity API service
export const equityService = {
  // Dashboard & Analytics
  getDashboard: () => api.get('/equity/dashboard'),
  
  // Seed Data
  seedData: () => api.post('/equity/seed'),
  resetData: () => api.delete('/equity/reset'),

  // Company Equity Structure
  getStructure: () => api.get('/equity/structure'),
  updateStructure: (data) => api.put('/equity/structure', data),

  // Share Classes
  getShareClasses: () => api.get('/equity/share-classes'),
  createShareClass: (data) => api.post('/equity/share-classes', data),
  updateShareClass: (id, data) => api.put(`/equity/share-classes/${id}`, data),

  // Equity Holders
  getHolders: () => api.get('/equity/holders'),
  createHolder: (data) => api.post('/equity/holders', data),
  updateHolder: (id, data) => api.put(`/equity/holders/${id}`, data),

  // Share Issuances
  getIssuances: () => api.get('/equity/issuances'),
  createIssuance: (data) => api.post('/equity/issuances', data),

  // Vesting Schedules
  getVestingSchedules: () => api.get('/equity/vesting-schedules'),
  createVestingSchedule: (data) => api.post('/equity/vesting-schedules', data),
  getVestedShares: (id, asOfDate) => 
    api.get(`/equity/vesting-schedules/${id}/vested`, { params: { asOfDate } }),

  // Option Pools
  getOptionPools: () => api.get('/equity/option-pools'),
  createOptionPool: (data) => api.post('/equity/option-pools', data),

  // Option Grants
  getOptionGrants: () => api.get('/equity/option-grants'),
  createOptionGrant: (data) => api.post('/equity/option-grants', data),

  // Cap Table
  getCapTable: (includeOptions = false, includeConvertibles = false) =>
    api.get('/equity/cap-table', {
      params: { includeOptions, includeConvertibles }
    }),

  // Dilution Calculations
  calculateDilution: (data) => api.post('/equity/dilution/calculate', data),
  simulateInvestmentRound: (data) => api.post('/equity/dilution/simulate', data),

  // Export
  exportCapTable: (format = 'csv') =>
    api.get('/equity/cap-table/export', {
      params: { format },
      responseType: 'blob'
    })
};

export default equityService;

