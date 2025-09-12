const asyncErrorHandler = require('../utils/asyncErrorHandler');
const authService = require('../services/auth.service');
const logger = require('../utils/logger');

// POST /api/auth/register
exports.register = asyncErrorHandler(async (req, res) => {
	const { email } = req.body; // req.body dan olindi
	const userData = await authService.registerData(req.body, res);
	logger.info({ email }, 'User registered successfully');

	res.status(201).json({
		status: 'success',
		data: { userData },
	});
});

// POST /api/auth/login
exports.login = asyncErrorHandler(async (req, res) => {
	const { email } = req.body;
	const userData = await authService.loginData(req.body, res);
	logger.info({ email }, 'User logged in successfully');

	res.status(201).json({
		status: 'success',
		data: { userData },
	});
});

// GET /api/auth/logout
exports.logout = asyncErrorHandler(async (req, res) => {
	logger.info('User logged out successfully');
	await authService.logout(res);

	res.status(201).json({
		status: 'success',
		message: 'Logged out successfully',
	});
});
