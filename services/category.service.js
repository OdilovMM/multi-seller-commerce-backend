const Category = require('../models/category.model');
const cloudinary = require('cloudinary').v2;
const { BadRequestError, NotFoundError } = require('../errors');
const logger = require('../utils/logger');

class CategoryService {
	constructor() {
		this.categoryModel = Category;

		cloudinary.config({
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.CLOUD_API_KEY,
			api_secret: process.env.CLOUD_API_SECRET,
			secure: true,
		});
	}

	async createCategory(fields, files) {
		let { name } = fields;
		const { image } = files;

		if (!name) throw new BadRequestError('Category name is required');
		if (!image) throw new BadRequestError('Category image is required');

		name = name.trim();
		const slug = name.split(' ').join('-');

		try {
			const result = await cloudinary.uploader.upload(image.filepath, {
				folder: 'categories',
			});

			const category = await this.categoryModel.create({
				name,
				slug,
				image: result.url,
			});

			logger.info({ categoryId: category._id }, 'Category created successfully');
			return category;
		} catch (err) {
			logger.error({ err }, 'Error creating category');
			throw new BadRequestError(err.message || 'Category creation failed');
		}
	}

	async getCategories({ page, parPage, search }) {
		try {
			let skipPage = 0;
			if (parPage && page) skipPage = parseInt(parPage) * (parseInt(page) - 1);

			const filter = search ? { $text: { $search: search } } : {};

			const categories = await this.categoryModel
				.find(filter)
				.skip(skipPage)
				.limit(parPage ? parseInt(parPage) : 0)
				.sort({ createdAt: -1 });

			const totalCategories = await this.categoryModel.countDocuments(filter);

			return { categories, totalCategories };
		} catch (error) {
			console.log(error);
		}
	}

	async getCategoryById(id) {
		try {
			const category = await this.categoryModel.findById(id);
			if (!category) {
				logger.warn({ id: id }, 'Category not found');
				throw new NotFoundError('No category found with that ID');
			}
			return category;
		} catch (error) {
			console.log(error);
		}
	}

	async deleteCategory(id) {
		try {
			const category = await this.categoryModel.findByIdAndDelete(id);
			if (!category) {
				logger.warn({ id: id }, 'Category not found for deletion');
				throw new NotFoundError('No category found with that ID');
			}
			logger.info({ categoryId: id }, 'Category deleted successfully');
			return category._id;
		} catch (error) {
			console.log(error);
		}
	}

	async updateCategory(id, data) {
		try {
			const category = await this.categoryModel.findByIdAndUpdate(id, data, {
				new: true,
				runValidators: true,
			});
			if (!category) {
				logger.warn({ id: id }, 'Category not found for update');
				throw new NotFoundError('No category found with that ID');
			}
			logger.info({ categoryId: id }, 'Category updated successfully');
			return category;
		} catch (error) {
			console.log(error);
		}
	}
}

module.exports = new CategoryService();
