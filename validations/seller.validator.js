const Joi = require('joi');

exports.addAddressSchema = Joi.object({
	shopName: Joi.string().required(),
	division: Joi.string().required(),
	district: Joi.string().required(),
	subDistrict: Joi.string().required(),
});

exports.updateSellerStatusSchema = Joi.object({
	sellerId: Joi.string().required(),
	status: Joi.string().valid('pending', 'active', 'blocked').required(),
});
