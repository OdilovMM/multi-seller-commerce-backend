const Joi = require('joi');
const mongoose = require('mongoose');

// Create Banner Validation
const createBannerSchema = Joi.object({
	productId: Joi.string()
		.required()
		.custom((value, helpers) => {
			if (!mongoose.Types.ObjectId.isValid(value)) {
				return helpers.message('Invalid productId');
			}
			return value;
		}),
	banner: Joi.any().required().messages({
		'any.required': 'Banner image is required',
	}),
	link: Joi.string().uri().required().messages({
		'string.uri': 'Link must be a valid URL',
		'any.required': 'Link is required',
	}),
});

// Update Banner Validation
const updateBannerSchema = Joi.object({
	banner: Joi.any().required().messages({
		'any.required': 'Banner image is required',
	}),
});

module.exports = {
	createBannerSchema,
	updateBannerSchema,
};
