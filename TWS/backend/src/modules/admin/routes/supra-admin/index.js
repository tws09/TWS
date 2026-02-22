/**
 * Supra Admin Routes - Composed from split modules
 * Replaces the monolithic supraAdmin.js (3700+ lines) with modular route files
 */

const express = require('express');
const { authenticateToken } = require('./shared');

const dashboard = require('./dashboard');
const tenants = require('./tenants');
const users = require('./users');
const billing = require('./billing');
const departments = require('./departments');
const access = require('./access');
const masterErp = require('./masterErp');
const system = require('./system');

const router = express.Router();

// Apply authentication middleware (all routes require auth)
router.use(authenticateToken);

// Mount split route modules
router.use('/', dashboard);
router.use('/', tenants);
router.use('/', users);
router.use('/', billing);
router.use('/', departments);
router.use('/', access);
router.use('/', masterErp);
router.use('/', system);

module.exports = router;
