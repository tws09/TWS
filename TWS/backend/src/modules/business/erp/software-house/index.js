/**
 * Software House ERP Routes
 * Business logic routes specific to software house ERP
 */

const roles = require('./roles');
const attendance = require('./attendance');
const nucleusPM = require('./nucleusPM');
// nucleusClientPortal - REMOVED COMPLETELY

module.exports = {
  roles,
  attendance,
  nucleusPM
  // nucleusClientPortal - REMOVED COMPLETELY
};
