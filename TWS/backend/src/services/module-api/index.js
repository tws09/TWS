/**
 * Module API Layer - Cross-Module Communication
 * 
 * Use these APIs instead of direct model access across modules.
 * See README.md for architecture and usage.
 */

const projectApi = require('./project-api.service');
const financeApi = require('./finance-api.service');

module.exports = {
  projectApi,
  financeApi
};
