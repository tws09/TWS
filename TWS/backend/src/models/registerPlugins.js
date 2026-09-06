/**
 * registerPlugins — installs global Mongoose plugins.
 *
 * WP1 (tenant isolation). MUST be required BEFORE any model is compiled:
 *   • at the very top of `backend/server.js`
 *   • at the top of `backend/src/tests/setup.js`
 *
 * `mongoose.plugin()` only applies to schemas compiled AFTER the call, hence
 * the ordering requirement. Idempotent — safe to require more than once.
 */

const mongoose = require('mongoose');
const tenantScope = require('./plugins/tenantScope');

let registered = false;

function registerModelPlugins() {
  if (registered) return;
  mongoose.plugin(tenantScope);
  registered = true;
}

registerModelPlugins();

module.exports = registerModelPlugins;
module.exports.tenantScope = tenantScope;
