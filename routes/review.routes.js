const logger = require('../utils/logger');
const express = require('express');
const reviewController = require('./../controllers/review.controller');
const { protect } = require('../middleware/auth-check.middleware');
const authorize = require('../middleware/role-check.middleware');
const validateRequest = require('../middleware/validate.middleware');
const { createReviewSchema } = require('../validations/review.validator');

logger.info('[review.routes.js] Review route is working');

const router = express.Router();

router.post(
	'/add-customer-product-review',
	protect,
	authorize('CUSTOMER'),
	validateRequest(createReviewSchema),
	reviewController.listAllReviews,
);

router.get('/get-all-reviews/:productId', reviewController.create);

module.exports = router;
