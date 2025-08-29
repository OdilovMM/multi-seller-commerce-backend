const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth-check.middleware');
const authorize = require('../middleware/role-check.middleware');
const logger = require('../utils/logger');

logger.info('[admin.routes.js] Admin route is working');

const router = express.Router();

router.get('/admins/me', protect, authorize('ADMIN'), adminController.getAdminProfile);
router.get('/admins/dashboard', protect, authorize('ADMIN'), adminController.getAdminDashboard);

module.exports = router;
