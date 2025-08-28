const asyncErrorHandler = require('../utils/asyncErrorHandler');
const reviewService = require('../services/review.service');

exports.create = asyncErrorHandler(async (req, res) => {
	const { productId, name, rating, review } = req.body;
	await reviewService.create({ productId, name, rating, review });
	res.status(201).json({ status: 'Review Added' });
});

exports.listAllReviews = asyncErrorHandler(async (req, res) => {
	const { productId } = req.params;
	let { pageNumber } = req.query;
	pageNumber = parseInt(pageNumber) || 1;

	const data = await reviewService.listAllReviews(productId, pageNumber);
	res.status(200).json({
		status: 'success',
		data,
	});
});
