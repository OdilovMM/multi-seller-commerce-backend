const express = require('express');
const bannerController = require('../controllers/banner.controller');
const router = express.Router();
const { protect } = require('../middleware/auth-check.middleware');
const authorize = require('../middleware/role-check.middleware');
const logger = require('../utils/logger');
const validateRequest = require('../middleware/validate.middleware');
const { createBannerSchema, updateBannerSchema } = require('../validations/banner.validation');

logger.info('[banner.routes.js] Banner route is working');

// GET all banners
router.get('/', bannerController.getAllBanners);

// POST create banner
router.post(
	'/',
	protect,
	authorize('ADMIN'),
	validateRequest(createBannerSchema),
	bannerController.createBanner,
);

// GET banner by productId
router.get('/product/:productId', bannerController.getBannerByProductId);

// PATCH update banner by bannerId
router.patch(
	'/:bannerId',
	protect,
	authorize('ADMIN'),
	validateRequest(updateBannerSchema),
	bannerController.updateBanner,
);

module.exports = router;
