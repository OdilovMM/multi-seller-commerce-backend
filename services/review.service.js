const Review = require('../models/review.model');
const Product = require('../models/product.model');
const moment = require('moment');
const {
	mongo: { ObjectId },
} = require('mongoose');

class ReviewService {
	async create({ productId, name, rating, review }) {
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
	}

	async listAllReviews(productId, pageNumber = 1, limit = 5) {
		const skipPage = limit * (pageNumber - 1);

		const getRating = await Review.aggregate([
			{ $match: { productId: { $eq: new ObjectId(productId) }, rating: { $not: { $size: 0 } } } },
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

		return { reviews, totalReviews, ratingReview };
	}
}

module.exports = new ReviewService();
