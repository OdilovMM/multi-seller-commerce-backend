const Product = require('../models/product.model');
const cloudinary = require('cloudinary').v2;
const queryProducts = require('../utils/queryProducts');

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
		const slug = name.trim().split(' ').join('-');

		const uploadedImages = [];
		for (let i = 0; i < images.length; i++) {
			const result = await cloudinary.uploader.upload(images[i].filepath, { folder: 'products' });
			uploadedImages.push(result.url);
		}

		return await Product.create({
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
	}

	async getBySlug(slug) {
		const product = await Product.findOne({ slug });
		const categoryRelated = await Product.find({
			_id: { $ne: product._id },
			category: product.category,
		}).limit(20);
		const sellerRelated = await Product.find({
			_id: { $ne: product._id },
			sellerId: product.sellerId,
		}).limit(5);

		return { product, categoryRelated, sellerRelated };
	}

	async getById(productId) {
		return await Product.findById(productId);
	}

	async update({ productId, name, description, discount, price, brand, stock }) {
		const trimmedName = name?.trim();
		const slug = trimmedName.split(' ').join('-');

		await Product.findByIdAndUpdate(
			productId,
			{ name: trimmedName, description, discount, price, brand, stock, slug },
			{ new: true, runValidators: true },
		);
		return await Product.findById(productId);
	}

	async updateImage(productId, oldImage, newImage) {
		const result = await cloudinary.uploader.upload(newImage.filepath, { folder: 'products' });
		let { images } = await Product.findById(productId);
		const index = images.findIndex((img) => img === oldImage);
		images[index] = result.url;
		await Product.findByIdAndUpdate(productId, { images });
		return await Product.findById(productId);
	}

	async delete(sellerId, productId) {
		return await Product.findByIdAndDelete({ sellerId, _id: productId });
	}

	async listByType(type) {
		let products;
		if (type === 'top-rated') {
			products = await Product.find().sort({ rating: -1 });
		} else if (type === 'new-arrivals') {
			products = await Product.find().sort({ createdAt: -1 });
		}
		return products;
	}

	async listByPriceRange() {
		const products = await Product.find({}).limit(20).sort({ createdAt: -1 });
		const getPriceProduct = await Product.find({}).sort({ price: 1 });

		let priceRange = { low: 0, high: 0 };
		if (getPriceProduct.length > 0) {
			priceRange.high = getPriceProduct[getPriceProduct.length - 1].price;
			priceRange.low = getPriceProduct[0].price;
		}

		// Format latest products in chunks of 3
		const formatted = [];
		for (let i = 0; i < products.length; i += 3) {
			formatted.push(products.slice(i, i + 3));
		}

		return { latestProduct: formatted, priceRange };
	}

	async listHomeProducts() {
		const topRated = await Product.find().sort({ rating: -1 }).limit(16);
		const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(16);
		return { topRatedProducts: topRated, newArrivals };
	}

	async search(reqQuery) {
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

		return { products: result, totalProducts, parPage };
	}

	async listSellerProducts(sellerId, page = 1, parPage = 10, search = '') {
		const skipPage = parseInt(parPage) * (parseInt(page) - 1);
		const query = sellerId ? { sellerId } : {};
		if (search) query.$text = { $search: search };

		const products = await Product.find(query)
			.skip(skipPage)
			.limit(parseInt(parPage))
			.sort({ createdAt: -1 });
		const totalProducts = await Product.find(query).countDocuments();

		return { products, totalProducts };
	}
}

module.exports = new ProductService();
