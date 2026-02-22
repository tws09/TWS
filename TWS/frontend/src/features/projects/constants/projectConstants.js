/**
 * Project Constants
 * Centralized constants for the Projects module
 * Eliminates magic strings and numbers
 */

// Project Status
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  PLANNING: 'planning',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Project Priority
export const PROJECT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Card/Task Status
export const CARD_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  UNDER_REVIEW: 'under_review',
  COMPLETED: 'completed'
};

// Card Types
export const CARD_TYPE = {
  USER_STORY: 'user_story',
  EPIC: 'epic',
  BUG: 'bug',
  FEATURE: 'feature',
  TECHNICAL_TASK: 'technical_task',
  CODE_REVIEW: 'code_review',
  STORY: 'story',
  TASK: 'task',
  IMPROVEMENT: 'improvement',
  CUSTOM: 'custom'
};

// Project Types
export const PROJECT_TYPE = {
  WEB_APPLICATION: 'web_application',
  MOBILE_APP: 'mobile_app',
  API_DEVELOPMENT: 'api_development',
  SYSTEM_INTEGRATION: 'system_integration',
  MAINTENANCE_SUPPORT: 'maintenance_support',
  CONSULTING: 'consulting',
  GENERAL: 'general'
};

// User Roles (for authorization)
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORG_MANAGER: 'org_manager',
  PMO: 'pmo',
  PROJECT_MANAGER: 'project_manager',
  TEAM_MEMBER: 'team_member',
  CLIENT: 'client'
};

// Roles that can create projects
export const PROJECT_CREATOR_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ORG_MANAGER,
  USER_ROLES.PMO,
  USER_ROLES.PROJECT_MANAGER
];

// API Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
  BOARD: 60000,     // 1 minute
  METRICS: 120000    // 2 minutes
};

// Time Ranges
export const TIME_RANGES = {
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
  LAST_90_DAYS: '90d',
  LAST_YEAR: '1y'
};

// Workspace Types
export const WORKSPACE_TYPES = {
  INTERNAL: 'internal',
  CLIENT: 'client',
  PARTNER: 'partner',
  AGENCY: 'agency',
  DEPARTMENT: 'department',
  TEAM: 'team'
};

// Currency Codes
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP'
};

// Status Color Mappings
export const STATUS_COLORS = {
  [PROJECT_STATUS.ACTIVE]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    darkBg: 'dark:bg-green-900/30',
    darkText: 'dark:text-green-300'
  },
  [PROJECT_STATUS.PLANNING]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    darkBg: 'dark:bg-blue-900/30',
    darkText: 'dark:text-blue-300'
  },
  [PROJECT_STATUS.ON_HOLD]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    darkBg: 'dark:bg-yellow-900/30',
    darkText: 'dark:text-yellow-300'
  },
  [PROJECT_STATUS.COMPLETED]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    darkBg: 'dark:bg-gray-800',
    darkText: 'dark:text-gray-300'
  },
  [PROJECT_STATUS.CANCELLED]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    darkBg: 'dark:bg-red-900/30',
    darkText: 'dark:text-red-300'
  }
};

// Priority Color Mappings
export const PRIORITY_COLORS = {
  [PROJECT_PRIORITY.LOW]: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
    darkBg: 'dark:bg-green-900/30',
    darkText: 'dark:text-green-300'
  },
  [PROJECT_PRIORITY.MEDIUM]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
    darkBg: 'dark:bg-yellow-900/30',
    darkText: 'dark:text-yellow-300'
  },
  [PROJECT_PRIORITY.HIGH]: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
    darkBg: 'dark:bg-orange-900/30',
    darkText: 'dark:text-orange-300'
  },
  [PROJECT_PRIORITY.URGENT]: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
    darkBg: 'dark:bg-red-900/30',
    darkText: 'dark:text-red-300'
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  PROJECTS: '/api/projects',
  PROJECT: (id) => `/api/projects/${id}`,
  PROJECT_METRICS: '/api/projects/metrics',
  CLIENTS: '/api/clients',
  CLIENT: (id) => `/api/clients/${id}`,
  BOARDS: '/api/boards',
  BOARD: (id) => `/api/boards/${id}`,
  PROJECT_BOARDS: (projectId) => `/api/boards/project/${projectId}`,
  CARDS: '/api/cards',
  CARD: (id) => `/api/cards/${id}`
};

// Validation Rules
export const VALIDATION = {
  PROJECT_NAME_MIN_LENGTH: 3,
  PROJECT_NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  BUDGET_MIN: 0,
  BUDGET_MAX: 1000000000, // 1 billion
  ESTIMATED_HOURS_MIN: 0,
  ESTIMATED_HOURS_MAX: 100000
};

// Error Messages
export const ERROR_MESSAGES = {
  PROJECT_NAME_REQUIRED: 'Project name is required',
  PROJECT_NAME_TOO_SHORT: `Project name must be at least ${VALIDATION.PROJECT_NAME_MIN_LENGTH} characters`,
  PROJECT_NAME_TOO_LONG: `Project name must be less than ${VALIDATION.PROJECT_NAME_MAX_LENGTH} characters`,
  CLIENT_REQUIRED: 'Please select a client',
  BUDGET_INVALID: 'Budget must be a valid number',
  BUDGET_NEGATIVE: 'Budget cannot be negative',
  ESTIMATED_HOURS_INVALID: 'Estimated hours must be a valid number',
  ESTIMATED_HOURS_NEGATIVE: 'Estimated hours cannot be negative',
  UNAUTHORIZED: 'You do not have permission to perform this action',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Please check your input and try again'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: 'Project created successfully',
  PROJECT_UPDATED: 'Project updated successfully',
  PROJECT_DELETED: 'Project deleted successfully',
  CLIENT_ADDED: 'Client added successfully',
  CLIENT_UPDATED: 'Client updated successfully',
  CLIENT_DELETED: 'Client deleted successfully',
  BOARD_CREATED: 'Board created successfully',
  CARD_CREATED: 'Card created successfully',
  CARD_UPDATED: 'Card updated successfully',
  CARD_MOVED: 'Card moved successfully'
};

