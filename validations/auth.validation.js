const Joi = require('joi');

const registerSchema = Joi.object({
	firstName: Joi.string().min(2).max(30).required(),
	lastName: Joi.string().min(2).max(30).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(8).required(),
	role: Joi.string().valid('CUSTOMER', 'ADMIN', 'VENDOR', 'MARKETING').default('CUSTOMER'),
});

const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(8).required(),
});

module.exports = { registerSchema, loginSchema };
