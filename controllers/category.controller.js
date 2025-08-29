const asyncErrorHandler = require('../utils/asyncErrorHandler');
const CategoryService = require('../services/category.service');
const formidable = require('formidable');

// POST /api/categories
exports.createCategory = asyncErrorHandler(async (req, res, next) => {
	const form = formidable();
	form.parse(req, async (error, fields, files) => {
		if (error) return next(error);

		const category = await CategoryService.createCategory(fields, files);
		res.status(201).json({
			status: 'success',
			data: category,
		});
	});
});

// GET /api/categories
exports.getCategories = asyncErrorHandler(async (req, res) => {
	const result = await CategoryService.getCategories(req.query);
	res.status(200).json({
		status: 'success',
		...result,
	});
});

// GET /api/categories/:id
exports.getCategoryById = asyncErrorHandler(async (req, res) => {
	const category = await CategoryService.getCategoryById(req.params.id);
	res.status(200).json({
		status: 'success',
		data: category,
	});
});

// DELETE /api/categories/:id
exports.deleteCategory = asyncErrorHandler(async (req, res) => {
	const deletedId = await CategoryService.deleteCategory(req.params.id);
	res.status(200).json({
		status: 'success',
		message: 'Category deleted successfully',
		data: { id: deletedId },
	});
});

// PATCH /api/categories/:id
exports.updateCategory = asyncErrorHandler(async (req, res) => {
	const category = await CategoryService.updateCategory(req.params.id, req.body);
	res.status(200).json({
		status: 'success',
		data: category,
	});
});
