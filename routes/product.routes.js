const logger = require('../utils/logger');
const express = require('express');
const productController = require('./../controllers/product.controller');
const { protect } = require('../middleware/auth-check.middleware');
const authorize = require('../middleware/role-check.middleware');
const validateRequest = require('../middleware/validate.middleware');
const { createProductSchema, updateProductSchema } = require('../validations/product.validation');

logger.info('[product.routes.js] Product route is working');

const router = express.Router();

// Seller only routes
router.post(
	'/',
	protect,
	authorize('VENDOR'),
	validateRequest(createProductSchema),
	productController.create,
);
router.patch(
	'/:productId',
	protect,
	authorize('VENDOR'),
	validateRequest(updateProductSchema),
	productController.update,
);
router.patch('/:productId/image', protect, authorize('VENDOR'), productController.updateImage);
router.delete('/:productId', protect, authorize('VENDOR'), productController.delete);
router.get('/my-products', protect, authorize('VENDOR'), productController.listSellerProducts);

// Public routes
router.get('/', productController.search); // filter, sort, pagination
router.get('/price-range', productController.listByPriceRange);
router.get('/home', productController.listHomeProducts);
router.get('/:slug', productController.getBySlug);
router.get('/:type', productController.listByType);

module.exports = router;
