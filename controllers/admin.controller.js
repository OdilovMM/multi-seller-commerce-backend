const asyncErrorHandler = require('../utils/asyncErrorHandler');
const adminService = require('../services/admin.service');
const logger = require('../utils/logger');

exports.getAdminProfile = asyncErrorHandler(async (req, res) => {
	const { _id } = req.user;

	logger.info(`[AdminController] getAdminProfile called for adminId: ${_id}`);

	const admin = await adminService.getProfile(_id);

	res.status(200).json({
		status: 'success',
		data: { admin },
	});
});

exports.getAdminDashboard = asyncErrorHandler(async (req, res) => {
	logger.info('[AdminController] getAdminDashboard called');

	const dashboardData = await adminService.getDashboardStats();

	res.status(200).json({
		status: 'success',
		data: dashboardData,
	});
});
