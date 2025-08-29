const asyncErrorHandler = require('../utils/asyncErrorHandler');
const reviewService = require('../services/review.service');
const logger = require('../utils/logger');

exports.create = asyncErrorHandler(async (req, res) => {
	const { productId, name, rating, review } = req.body;
	logger.info(`[ReviewController] create called for productId: ${productId}`);

	await reviewService.create({ productId, name, rating, review });

	logger.info(`[ReviewController] Review added successfully for productId: ${productId}`);
	res.status(201).json({ status: 'Review Added' });
});

exports.listAllReviews = asyncErrorHandler(async (req, res) => {
	const { productId } = req.params;
	let { pageNumber } = req.query;
	pageNumber = parseInt(pageNumber) || 1;

	logger.info(
		`[ReviewController] listAllReviews called for productId: ${productId}, page: ${pageNumber}`,
	);

	const data = await reviewService.listAllReviews(productId, pageNumber);
	logger.info(`[ReviewController] listAllReviews success for productId: ${productId}`);
	res.status(200).json({
		status: 'success',
		data,
	});
});
