/**
 * Core Module Routes Index
 * Centralized exports for all core system routes
 */

const health = require('./health');
const metrics = require('./metrics');
const logs = require('./logs');
const security = require('./security');
const compliance = require('./compliance');
const files = require('./files');
const notifications = require('./notifications');
const webhooks = require('./webhooks');

module.exports = {
  health,
  metrics,
  logs,
  security,
  compliance,
  files,
  notifications,
  webhooks
};

// Named exports for direct access
module.exports.health = health;
module.exports.metrics = metrics;
module.exports.logs = logs;
module.exports.security = security;
module.exports.compliance = compliance;
module.exports.files = files;
module.exports.notifications = notifications;
module.exports.webhooks = webhooks;
