const asyncErrorHandler = require('../utils/asyncErrorHandler');
const formidable = require('formidable');
const productService = require('../services/product.service');
const logger = require('../utils/logger');

exports.listAll = asyncErrorHandler(async (req, res) => {
	logger.info('[ProductController] listAll called');
	const products = await productService.listAll();
	res.status(200).json({ status: 'ok', data: { products } });
});

exports.create = asyncErrorHandler(async (req, res, next) => {
	logger.info(`[ProductController] create called by sellerId: ${req.user.id}`);
	const form = formidable({ multiples: true });

	form.parse(req, async (err, fields, files) => {
		if (err) {
			logger.error({ err }, '[ProductController] formidable parse error');
			return next(err);
		}
		try {
			const product = await productService.create({
				...fields,
				sellerId: req.user.id,
				images: files.images,
			});
			logger.info(
				{ productId: product._id, sellerId: req.user.id },
				'[ProductController] Product created successfully',
			);
			res.status(201).json({ status: 'Product Added', data: { product } });
		} catch (error) {
			logger.error({ error }, '[ProductController] create failed');
			next(error);
		}
	});
});

exports.getBySlug = asyncErrorHandler(async (req, res) => {
	const { slug } = req.params;
	logger.info(`[ProductController] getBySlug called for slug: ${slug}`);
	const data = await productService.getBySlug(slug);
	res.status(200).json({ status: 'success', data });
});

exports.update = asyncErrorHandler(async (req, res) => {
	logger.info(`[ProductController] update called for productId: ${req.body._id}`);
	const product = await productService.update(req.body);
	res.status(200).json({ status: 'Product Updated', data: { product } });
});

exports.updateImage = asyncErrorHandler(async (req, res) => {
	const { productId, oldImage } = req.body;
	logger.info(
		`[ProductController] updateImage called for productId: ${productId}, oldImage: ${oldImage}`,
	);
	const { newImage } = req.files; // assuming middleware
	const product = await productService.updateImage(productId, oldImage, newImage);
	logger.info(`[ProductController] Image updated for productId: ${productId}`);

	res.status(200).json({ status: 'Product Image Updated', data: { product } });
});

exports.delete = asyncErrorHandler(async (req, res) => {
	const { productId } = req.params;
	logger.info(
		`[ProductController] delete called for productId: ${productId}, sellerId: ${req.user.id}`,
	);

	await productService.delete(req.user.id, productId);
	logger.info(`[ProductController] Product deleted successfully: ${productId}`);

	res.status(200).json({ status: 'Product Deleted', data: null });
});

exports.listByType = asyncErrorHandler(async (req, res) => {
	logger.info(`[ProductController] listByType called with type: ${req.params.type}`);

	const products = await productService.listByType(req.params.type);
	res.status(200).json({ status: 'success', data: { products } });
});

exports.listByPriceRange = asyncErrorHandler(async (req, res) => {
	logger.info('[ProductController] listByPriceRange called');

	const data = await productService.listByPriceRange();
	res.status(200).json({ status: 'success', data });
});

exports.listHomeProducts = asyncErrorHandler(async (req, res) => {
	logger.info('[ProductController] listHomeProducts called');

	const data = await productService.listHomeProducts();
	res.status(200).json({ status: 'success', data });
});

exports.search = asyncErrorHandler(async (req, res) => {
	logger.info(`[ProductController] search called with query: ${JSON.stringify(req.query)}`);
	const data = await productService.search(req.query);
	res.status(200).json({ status: 'success', data });
});

exports.listSellerProducts = asyncErrorHandler(async (req, res) => {
	logger.info(
		`[ProductController] listSellerProducts called by sellerId: ${req.user.id}, page: ${req.query.page}, perPage: ${req.query.parPage}, search: ${req.query.search}`,
	);
	const data = await productService.listSellerProducts(
		req.user.id,
		req.query.page,
		req.query.parPage,
		req.query.search,
	);
	res.status(200).json({ status: 'success', data });
});
