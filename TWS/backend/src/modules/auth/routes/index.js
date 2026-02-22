/**
 * Auth Module Routes Index
 * Centralized exports for all authentication-related routes
 */

const authentication = require('./authentication');
const users = require('./users');
const sessions = require('./sessions');
const tenantAuth = require('./tenantAuth');

module.exports = {
  authentication,
  users,
  sessions,
  tenantAuth
};

// Named exports for direct access
module.exports.authentication = authentication;
module.exports.users = users;
module.exports.sessions = sessions;
module.exports.tenantAuth = tenantAuth;
