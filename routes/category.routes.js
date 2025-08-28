const logger = require('../utils/logger');
const express = require('express');
const categoryController = require('./../controllers/category.controller');
const { protect } = require('../middleware/auth-check.middleware');
const authorize = require('../middleware/role-check.middleware');
const validateRequest = require('../middleware/validate.middleware');
const {
	createCategorySchema,
	updateCategorySchema,
} = require('../validations/category.validation');

logger.info('[category.routes.js] Category route is working');

const router = express.Router();

// Create category (admin only)
router.post(
	'/',
	protect,
	authorize('ADMIN'),
	validateRequest(createCategorySchema),
	categoryController.createCategory,
);

// Get all categories
router.get('/', categoryController.getCategories);

// Get single category
router.get('/:id', categoryController.getCategoryById);

// Update category (admin only)
router.patch(
	'/:id',
	protect,
	authorize('ADMIN'),
	validateRequest(updateCategorySchema),
	categoryController.updateCategory,
);

// Delete category (admin only)
router.delete('/:id', protect, authorize('ADMIN'), categoryController.deleteCategory);

module.exports = router;
