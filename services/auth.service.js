const { ObjectId } = require('mongoose').Types;
const User = require('../models/user.model');
const { UnauthenticatedError, BadRequestError } = require('../errors');
const logger = require('../utils/logger');
const { createSendToken } = require('../utils/token');

class AuthService {
	constructor() {
		this.userModel = User;
	}

	async registerData(data, res) {
		const { email, password, firstName, lastName, role } = data;

		const existingUser = await this.userModel.findOne({ email });
		if (existingUser) {
			logger.warn({ email }, 'User already exists during registration');
			throw new BadRequestError('Email already registered!');
		}

		const user = await this.userModel.create({
			firstName,
			lastName,
			email,
			password,
			role, // default = "customer"
		});
		logger.info({ userId: user._id }, 'User registered successfully');
		createSendToken(user, 201, res);
	}

	async loginData(data, res) {
		const { email, password } = data;

		if (!email || !password) {
			logger.warn({ email }, 'No credentials:  email or password');
			throw new BadRequestError('Please provide email and password!');
		}

		// Userni topish
		const user = await this.userModel.findOne({ email }).select('+password');
		if (!user || !(await user.correctPassword(password, user.password))) {
			logger.info({ userId: user._id }, 'User logged in successfully');
			throw new UnauthenticatedError('Incorrect email or password');
		}
		logger.info({ userId: user._id }, 'User logged in successfully');
		createSendToken(user, 200, res);
	}

	async logout(res) {
		res.clearCookie('refreshToken');
		logger.info('User logged out successfully');
		res.status(200).json({
			status: 'success',
			message: 'Logged out successfully',
		});
	}
}

module.exports = new AuthService();
