const asyncErrorHandler = require('../utils/asyncErrorHandler');
const authService = require('../services/auth.service');
const logger = require('../utils/logger');

class AuthController {
	// POST /api/auth/register
	register = asyncErrorHandler(async (req, res) => {
		const { email } = req.body; // req.body dan olindi
		await authService.registerData(req.body, res);
		logger.info({ email }, 'User registered successfully');
	});

	// POST /api/auth/login
	login = asyncErrorHandler(async (req, res) => {
		const { email } = req.body;
		await authService.loginData(req.body, res);
		logger.info({ email }, 'User logged in successfully');
	});

	// GET /api/auth/logout
	logout = asyncErrorHandler(async (req, res) => {
		await authService.logout(res);
		logger.info('User logged out successfully');
	});
}

module.exports = new AuthController();
