/**
 * Admin Module Routes Index
 * Centralized exports for all admin-related routes
 */

const admin = require('./admin');
const supraAdmin = require('./supra-admin');
// twsAdmin removed - routes consolidated into supraAdmin.js
// gtsAdmin removed - functionality consolidated into supraAdmin.js
// Messaging routes moved to business module - use modules.business.messaging
// Admin messaging endpoints are at /api/messaging/admin/* or /api/admin/messaging/admin/*
const moderation = require('./moderation');
// Attendance routes moved to business module - use modules.business.attendance
const attendancePanel = require('./attendancePanel');
// Messaging feature removed - supraMessaging route disabled
// const supraMessaging = require('./supraMessaging');
const supraSessions = require('./supraSessions');
const supraTenantERP = require('./supraTenantERP');

module.exports = {
  admin,
  supraAdmin,
  // twsAdmin removed - routes consolidated into supraAdmin.js
  // gtsAdmin removed - functionality consolidated into supraAdmin.js
  moderation,
  attendancePanel,
  // supraMessaging, // Messaging feature removed
  supraSessions,
  supraTenantERP
};
