const Joi = require('joi');

const createProductSchema = Joi.object({
	sellerId: Joi.string().required().messages({
		'any.required': 'Seller ID is required',
	}),
	name: Joi.string().trim().min(2).max(100).required(),
	category: Joi.string().trim().required(),
	brand: Joi.string().trim().required(),
	price: Joi.number().min(0).required(),
	discount: Joi.number().min(0).max(100).default(0),
	stock: Joi.number().integer().min(0).required(),
	description: Joi.string().trim().min(10).max(2000).required(),
	shopName: Joi.string().trim().required(),
	images: Joi.array().items(Joi.string().uri()).min(1).required(),
	featured: Joi.boolean().default(false),
	seasonal: Joi.boolean().default(false),
});

const updateProductSchema = Joi.object({
	productId: Joi.string().required(),
	name: Joi.string().trim().min(2).max(100),
	category: Joi.string().trim(),
	brand: Joi.string().trim(),
	price: Joi.number().min(0),
	discount: Joi.number().min(0).max(100),
	stock: Joi.number().integer().min(0),
	description: Joi.string().trim().min(10).max(2000),
	shopName: Joi.string().trim(),
	images: Joi.array().items(Joi.string().uri()),
	featured: Joi.boolean(),
	seasonal: Joi.boolean(),
});

module.exports = {
	createProductSchema,
	updateProductSchema,
};
