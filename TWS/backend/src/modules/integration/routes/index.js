/**
 * Integration Module Routes Index
 * Centralized exports for all integration-related routes
 */

const integrations = require('./integrations');
const platform = require('./platform');
const timezone = require('./timezone');
const defaultContacts = require('./defaultContacts');
const webrtc = require('./webrtc');

module.exports = {
  integrations,
  platform,
  timezone,
  defaultContacts,
  webrtc
};

// Named exports for direct access
module.exports.integrations = integrations;
module.exports.platform = platform;
module.exports.timezone = timezone;
module.exports.defaultContacts = defaultContacts;
module.exports.webrtc = webrtc;
