const { BadRequestError } = require('../errors');

const validateRequest = (schema) => {
	return (req, res, next) => {
		const { error } = schema.validate(req.body, { abortEarly: false });

		if (error) {
			const messages = error.details.map((detail) => detail.message);
			return next(new BadRequestError(messages.join(', ')));
		}

		next();
	};
};

module.exports = validateRequest;
