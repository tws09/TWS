const express = require('express');
const { requirePlatformPermission, PLATFORM_PERMISSIONS } = require('../../../middleware/auth/platformRBAC');
const ErrorHandler = require('../../../middleware/common/errorHandler');

const router = express.Router();

// Placeholder routes for admin module
router.get('/', requirePlatformPermission(PLATFORM_PERMISSIONS.SYSTEM.READ), ErrorHandler.asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Admin module - Coming soon',
    data: []
  });
}));

module.exports = router;
