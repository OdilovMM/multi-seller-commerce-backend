const Joi = require('joi');

const createCategorySchema = Joi.object({
	name: Joi.string().trim().required().messages({
		'string.empty': 'Category name is required',
		'any.required': 'Category name is required',
	}),
	image: Joi.any().required().messages({
		'any.required': 'Category image is required',
	}),
});

const updateCategorySchema = Joi.object({
	name: Joi.string().trim().optional(),
	image: Joi.any().optional(),
});

module.exports = {
	createCategorySchema,
	updateCategorySchema,
};
