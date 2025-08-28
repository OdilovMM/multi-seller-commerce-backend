const Joi = require('joi');

const createReviewSchema = Joi.object({
	productId: Joi.string().required(),
	name: Joi.string().trim().min(2).max(50).required(),
	rating: Joi.number().integer().min(1).max(5).required(),
	review: Joi.string().trim().min(5).max(1000).required(),
});

module.exports = {
	createReviewSchema,
};
