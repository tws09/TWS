/**
 * Monitoring Module Routes Index
 * Centralized exports for all monitoring-related routes
 */

const system = require('./system');
const standalone = require('./standalone');

module.exports = {
  system,
  standalone
};

// Named exports for direct access
module.exports.system = system;
module.exports.standalone = standalone;
