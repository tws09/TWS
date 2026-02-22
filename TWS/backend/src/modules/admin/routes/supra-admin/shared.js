/**
 * Shared imports and utilities for Supra Admin routes
 * Used by all split route modules to avoid duplication
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const os = require('os');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { authenticateToken } = require('../../../../middleware/auth/auth');
const {
  PlatformRBAC,
  requirePlatformPermission,
  requirePlatformRole,
  PLATFORM_PERMISSIONS
} = require('../../../../middleware/auth/platformRBAC');
const requirePlatformAdminAccessReason = require('../../../../middleware/auth/requirePlatformAdminAccessReason');
const ErrorHandler = require('../../../../middleware/common/errorHandler');
const ValidationMiddleware = require('../../../../middleware/validation/validation');

// Models
const TWSAdmin = require('../../../../models/TWSAdmin');
const Tenant = require('../../../../models/Tenant');
const User = require('../../../../models/User');
const Organization = require('../../../../models/Organization');
const Billing = require('../../../../models/Billing');
const MasterERP = require('../../../../models/MasterERP');
const Department = require('../../../../models/Department');
const PlatformAdminApproval = require('../../../../models/PlatformAdminApproval');
const PortalUser = require('../../../../models/PortalUser');

// Services
const tenantService = require('../../../../services/tenant/tenant.service');
const platformAdminAccessService = require('../../../../services/tenant/platform-admin-access.service');
const analyticsService = require('../../../../services/analytics/analytics.service');
const systemMonitoringService = require('../../../../services/SystemMonitoringService');
const billingService = require('../../../../services/billingService');
const auditService = require('../../../../services/compliance/audit.service');

module.exports = {
  express,
  body,
  validationResult,
  os,
  mongoose,
  bcrypt,
  authenticateToken,
  PlatformRBAC,
  requirePlatformPermission,
  requirePlatformRole,
  PLATFORM_PERMISSIONS,
  requirePlatformAdminAccessReason,
  ErrorHandler,
  ValidationMiddleware,
  TWSAdmin,
  Tenant,
  User,
  Organization,
  Billing,
  MasterERP,
  Department,
  PlatformAdminApproval,
  PortalUser,
  tenantService,
  platformAdminAccessService,
  analyticsService,
  systemMonitoringService,
  billingService,
  auditService
};
