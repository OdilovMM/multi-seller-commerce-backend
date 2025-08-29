const Product = require('../models/product.model');
const cloudinary = require('cloudinary').v2;
const queryProducts = require('../utils/queryProducts');
const logger = require('../utils/logger');
const { NotFoundError, BadRequestError, CustomAPIError } = require('../errors');

class ProductService {
	constructor() {
		cloudinary.config({
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.CLOUD_API_KEY,
			api_secret: process.env.CLOUD_API_SECRET,
			secure: true,
		});
	}

	async listAll() {
		logger.info('[ProductService] listAll called');
		return await Product.find();
	}

	async create({
		sellerId,
		name,
		category,
		description,
		stock,
		price,
		discount,
		brand,
		shopName,
		images,
	}) {
		logger.info(`[ProductService] create called by sellerId: ${sellerId}`);

		if (!name || !category || !price) {
			logger.error('[ProductService] Missing required fields for product creation');
			throw new BadRequestError('Name, category, and price are required');
		}

		const slug = name.trim().split(' ').join('-');

		try {
			const uploadedImages = [];
			for (let i = 0; i < images.length; i++) {
				const result = await cloudinary.uploader.upload(images[i].filepath, {
					folder: 'products',
				});
				uploadedImages.push(result.url);
				logger.info(`[ProductService] Image uploaded to Cloudinary: ${result.url}`);
			}

			const product = await Product.create({
				sellerId,
				name: name.trim(),
				slug,
				shopName,
				category: category.trim(),
				description: description.trim(),
				stock: parseInt(stock),
				price: parseInt(price),
				discount: parseInt(discount),
				images: uploadedImages,
				brand: brand.trim(),
			});

			logger.info(
				{ productId: product._id, sellerId },
				'[ProductService] Product created successfully',
			);

			return product;
		} catch (error) {
			logger.error({ error }, '[ProductService] create failed');
			throw new NotFoundError('Failed to create product');
		}
	}

	async getBySlug(slug) {
		logger.info(`[ProductService] getBySlug called for slug: ${slug}`);
		const product = await Product.findOne({ slug });
		if (!product) {
			logger.error(`[ProductService] Product not found with slug: ${slug}`);
			throw new NotFoundError('Product not found');
		}

		const categoryRelated = await Product.find({
			_id: { $ne: product._id },
			category: product.category,
		}).limit(20);
		const sellerRelated = await Product.find({
			_id: { $ne: product._id },
			sellerId: product.sellerId,
		}).limit(5);

		logger.info(`[ProductService] getBySlug success for slug: ${slug}`);

		return { product, categoryRelated, sellerRelated };
	}

	async getById(productId) {
		logger.info(`[ProductService] getById called for ID: ${productId}`);

		const product = await Product.findById(productId);
		if (!product) {
			logger.error(`[ProductService] Product not found with ID: ${productId}`);
			throw new NotFoundError('Product not found');
		}

		return product;
	}

	async update({ productId, name, description, discount, price, brand, stock }) {
		logger.info(`[ProductService] update called for productId: ${productId}`);
		const trimmedName = name?.trim();
		const slug = trimmedName.split(' ').join('-');

		await Product.findByIdAndUpdate(
			productId,
			{ name: trimmedName, description, discount, price, brand, stock, slug },
			{ new: true, runValidators: true },
		);
		if (!product) {
			logger.error(`[ProductService] Product not found with ID: ${productId}`);
			throw new NotFoundError('Product not found');
		}

		logger.info(`[ProductService] Product updated successfully: ${productId}`);
		return await Product.findById(productId);
	}

	async updateImage(productId, oldImage, newImage) {
		logger.info(`[ProductService] updateImage called for productId: ${productId}`);
		const result = await cloudinary.uploader.upload(newImage.filepath, { folder: 'products' });
		let { images } = await Product.findById(productId);
		const index = images.findIndex((img) => img === oldImage);
		if (index === -1) {
			logger.error(`[ProductService] Old image not found for productId: ${productId}`);
			throw new NotFoundError('Old image not found in product');
		}
		images[index] = result.url;
		await Product.findByIdAndUpdate(productId, { images });
		logger.info(`[ProductService] Product image updated: ${productId}`);
		return await Product.findById(productId);
	}

	async delete(sellerId, productId) {
		logger.info(
			`[ProductService] delete called for productId: ${productId}, sellerId: ${sellerId}`,
		);

		const product = await Product.findOneAndDelete({ sellerId, _id: productId });
		if (!product) {
			logger.error(`[ProductService] Product not found for delete: ${productId}`);
			throw new NotFoundError('Product not found or not authorized to delete');
		}

		logger.info(`[ProductService] Product deleted successfully: ${productId}`);
		return product;
	}

	async listByType(type) {
		logger.info(`[ProductService] listByType called with type: ${type}`);

		let products = [];
		if (type === 'top-rated') {
			products = await Product.find().sort({ rating: -1 });
		} else if (type === 'new-arrivals') {
			products = await Product.find().sort({ createdAt: -1 });
		} else {
			logger.error(`[ProductService] Invalid type: ${type}`);
			throw new BadRequestError('Invalid product type');
		}

		return products;
	}

	async listByPriceRange() {
		logger.info('[ProductService] listByPriceRange called');

		const products = await Product.find({}).limit(20).sort({ createdAt: -1 });
		const getPriceProduct = await Product.find({}).sort({ price: 1 });

		let priceRange = { low: 0, high: 0 };
		if (getPriceProduct.length > 0) {
			priceRange.high = getPriceProduct[getPriceProduct.length - 1].price;
			priceRange.low = getPriceProduct[0].price;
		}

		const formatted = [];
		for (let i = 0; i < products.length; i += 3) {
			formatted.push(products.slice(i, i + 3));
		}

		logger.info('[ProductService] listByPriceRange success');
		return { latestProduct: formatted, priceRange };
	}

	async listHomeProducts() {
		logger.info('[ProductService] listHomeProducts called');

		const topRated = await Product.find().sort({ rating: -1 }).limit(16);
		const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(16);

		return { topRatedProducts: topRated, newArrivals };
	}

	async search(reqQuery) {
		logger.info(`[ProductService] search called with query: ${JSON.stringify(reqQuery)}`);
		const parPage = 16;
		reqQuery.parPage = parPage;

		const products = await Product.find({}).sort({ createdAt: -1 });

		const totalProducts = new queryProducts(products, reqQuery)
			.queryCategory()
			.queryRating()
			.queryPrice()
			.querySearch()
			.querySortPrice()
			.getProductsCount();

		const result = new queryProducts(products, reqQuery)
			.queryCategory()
			.queryRating()
			.queryPrice()
			.querySearch()
			.querySortPrice()
			.paginate()
			.limitField()
			.getProducts();

		logger.info('[ProductService] search completed');
		return { products: result, totalProducts, parPage };
	}

	async listSellerProducts(sellerId, page = 1, parPage = 10, search = '') {
		logger.info(`[ProductService] listSellerProducts called for sellerId: ${sellerId}`);
		const skipPage = parseInt(parPage) * (parseInt(page) - 1);
		const query = sellerId ? { sellerId } : {};
		if (search) query.$text = { $search: search };

		const products = await Product.find(query)
			.skip(skipPage)
			.limit(parseInt(parPage))
			.sort({ createdAt: -1 });
		const totalProducts = await Product.find(query).countDocuments();

		logger.info(`[ProductService] listSellerProducts success for sellerId: ${sellerId}`);

		return { products, totalProducts };
	}
}

module.exports = new ProductService();
