const Review = require('../models/review.model');
const Product = require('../models/product.model');
const moment = require('moment');
const {
	mongo: { ObjectId },
} = require('mongoose');
const logger = require('../utils/logger');
const { CustomAPIError, NotFoundError, BadRequestError } = require('../errors');

class ReviewService {
	async create({ productId, name, rating, review }) {
		logger.info(`[ReviewService] create called for productId: ${productId}`);

		if (!productId || !name || !rating) {
			logger.error('[ReviewService] Missing required fields');
			throw new BadRequestError('ProductId, name and rating are required');
		}

		try {
			await Review.create({
				productId,
				name,
				rating,
				review,
				date: moment(Date.now()).format('LL'),
			});

			const reviews = await Review.find({ productId });
			const productRating = reviews.length
				? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
				: 0;

			await Product.findByIdAndUpdate(productId, { rating: productRating });

			logger.info(
				`[ReviewService] Review created & product rating updated for productId: ${productId}`,
			);
		} catch (error) {
			logger.error({ error }, '[ReviewService] create failed');
			throw new CustomAPIError('Failed to create review');
		}
	}

	async listAllReviews(productId, pageNumber = 1, limit = 5) {
		logger.info(
			`[ReviewService] listAllReviews called for productId: ${productId}, page: ${pageNumber}`,
		);

		if (!ObjectId.isValid(productId)) {
			logger.error(`[ReviewService] Invalid productId: ${productId}`);
			throw new BadRequestError('Invalid productId');
		}

		try {
			const skipPage = limit * (pageNumber - 1);

			const getRating = await Review.aggregate([
				{
					$match: {
						productId: { $eq: new ObjectId(productId) },
						rating: { $not: { $size: 0 } },
					},
				},
				{ $unwind: '$rating' },
				{ $group: { _id: '$rating', count: { $sum: 1 } } },
			]);

			const ratingReview = [5, 4, 3, 2, 1].map((r) => {
				const found = getRating.find((g) => g._id === r);
				return { rating: r, sum: found ? found.count : 0 };
			});

			const totalReviews = await Review.find({ productId }).countDocuments();
			const reviews = await Review.find({ productId })
				.skip(skipPage)
				.limit(limit)
				.sort({ createdAt: -1 });

			logger.info(
				`[ReviewService] listAllReviews success for productId: ${productId}, totalReviews: ${totalReviews}`,
			);

			return { reviews, totalReviews, ratingReview };
		} catch (error) {
			logger.error({ error }, `[ReviewService] listAllReviews failed for productId: ${productId}`);
			throw new CustomAPIError('Failed to fetch reviews');
		}
	}
}

module.exports = new ReviewService();
