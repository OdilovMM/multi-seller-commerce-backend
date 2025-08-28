const asyncErrorHandler = require('../utils/asyncErrorHandler');
const formidable = require('formidable');
const productService = require('../services/product.service');

exports.listAll = asyncErrorHandler(async (req, res) => {
	const products = await productService.listAll();
	res.status(200).json({ status: 'ok', data: { products } });
});

exports.create = asyncErrorHandler(async (req, res, next) => {
	const form = formidable({ multiples: true });

	form.parse(req, async (err, fields, files) => {
		if (err) return next(err);
		try {
			const product = await productService.create({
				...fields,
				sellerId: req.user.id,
				images: files.images,
			});
			res.status(201).json({ status: 'Product Added', data: { product } });
		} catch (error) {
			next(error);
		}
	});
});

exports.getBySlug = asyncErrorHandler(async (req, res) => {
	const { slug } = req.params;
	const data = await productService.getBySlug(slug);
	res.status(200).json({ status: 'success', data });
});

exports.update = asyncErrorHandler(async (req, res) => {
	const product = await productService.update(req.body);
	res.status(200).json({ status: 'Product Updated', data: { product } });
});

exports.updateImage = asyncErrorHandler(async (req, res) => {
	const { productId, oldImage } = req.body;
	const { newImage } = req.files; // assuming middleware
	const product = await productService.updateImage(productId, oldImage, newImage);
	res.status(200).json({ status: 'Product Image Updated', data: { product } });
});

exports.delete = asyncErrorHandler(async (req, res) => {
	const { productId } = req.params;
	await productService.delete(req.user.id, productId);
	res.status(200).json({ status: 'Product Deleted', data: null });
});

exports.listByType = asyncErrorHandler(async (req, res) => {
	const products = await productService.listByType(req.params.type);
	res.status(200).json({ status: 'success', data: { products } });
});

exports.listByPriceRange = asyncErrorHandler(async (req, res) => {
	const data = await productService.listByPriceRange();
	res.status(200).json({ status: 'success', data });
});

exports.listHomeProducts = asyncErrorHandler(async (req, res) => {
	const data = await productService.listHomeProducts();
	res.status(200).json({ status: 'success', data });
});

exports.search = asyncErrorHandler(async (req, res) => {
	const data = await productService.search(req.query);
	res.status(200).json({ status: 'success', data });
});

exports.listSellerProducts = asyncErrorHandler(async (req, res) => {
	const data = await productService.listSellerProducts(
		req.user.id,
		req.query.page,
		req.query.parPage,
		req.query.search,
	);
	res.status(200).json({ status: 'success', data });
});
