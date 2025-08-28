const asyncErrorHandler = require('../utils/asyncErrorHandler');
const CategoryService = require('../services/category.service');
const formidable = require('formidable');

class CategoryController {
	// POST /api/categories
	createCategory = asyncErrorHandler(async (req, res, next) => {
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
	getCategories = asyncErrorHandler(async (req, res) => {
		const result = await CategoryService.getCategories(req.query);
		res.status(200).json({
			status: 'success',
			...result,
		});
	});

	// GET /api/categories/:id
	getCategoryById = asyncErrorHandler(async (req, res) => {
		const category = await CategoryService.getCategoryById(req.params.id);
		res.status(200).json({
			status: 'success',
			data: category,
		});
	});

	// DELETE /api/categories/:id
	deleteCategory = asyncErrorHandler(async (req, res) => {
		const deletedId = await CategoryService.deleteCategory(req.params.id);
		res.status(200).json({
			status: 'success',
			message: 'Category deleted successfully',
			data: { id: deletedId },
		});
	});

	// PATCH /api/categories/:id
	updateCategory = asyncErrorHandler(async (req, res) => {
		const category = await CategoryService.updateCategory(req.params.id, req.body);
		res.status(200).json({
			status: 'success',
			data: category,
		});
	});
}

module.exports = new CategoryController();
