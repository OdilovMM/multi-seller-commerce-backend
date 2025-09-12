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
		try {
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
			return createSendToken(user, 201, res);
		} catch (error) {
			console.log(error);
		}
	}

	async loginData(data, res) {
		try {
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
			return createSendToken(user, 200, res);
		} catch (error) {
			console.log(error);
		}
	}

	async logout(res) {
		try {
			return res.clearCookie('refreshToken');
			logger.info('User logged out successfully');
		} catch (error) {
			console.log(error);
		}
	}
}

module.exports = new AuthService();
