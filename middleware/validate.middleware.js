const validate = (schema) => {
	return (req, res, next) => {
		const { error } = schema.validate(req.body, { abortEarly: false });

		if (error) {
			return res.status(400).json({
				message: 'Fail: Joi Validation Error',
				details: error.details.map((err) => err.message),
			});
		}

		next();
	};
};

module.exports = validate;