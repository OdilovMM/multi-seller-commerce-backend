const customerService = require('../services/customer.service');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const logger = require('../utils/logger');

exports.getMe = asyncErrorHandler(async (req, res) => {
	const userInfo = await customerService.getProfile(req.user.id);
	res.status(200).json({ status: 'success', data: { userInfo } });
});

exports.getMyWishlist = asyncErrorHandler(async (req, res) => {
	const data = await customerService.getWishlist(req.user.id);
	res.status(200).json({ status: 'success', data });
});

exports.getCustomerCart = asyncErrorHandler(async (req, res) => {
	const data = await customerService.getCart(req.user.id);
	res.status(200).json({ status: 'success', data });
});

exports.addRemoveWishList = asyncErrorHandler(async (req, res) => {
	const { productId } = req.body;
	const data = await customerService.addRemoveWishlist(req.user.id, productId);
	res.status(data.isSaved ? 201 : 200).json({ status: data.isSaved ? 'Added' : 'Removed', data });
});

exports.addRemoveCart = asyncErrorHandler(async (req, res) => {
	const { productId, quantity } = req.body;
	const data = await customerService.addRemoveCart(req.user.id, productId, quantity);
	res.status(data.isSaved ? 201 : 200).json({ status: data.isSaved ? 'Added' : 'Removed', data });
});

exports.incrementProductInCart = asyncErrorHandler(async (req, res) => {
	const data = await customerService.incrementCartItem(req.user._id, req.params.productId);
	res.status(200).json({ status: 'success', data: { cartItem: data } });
});

exports.decrementProductInCart = asyncErrorHandler(async (req, res) => {
	const data = await customerService.decrementCartItem(req.user._id, req.params.productId);
	res.status(200).json({ status: 'success', data: { cartItem: data } });
});

exports.getAllCustomers = asyncErrorHandler(async (req, res) => {
	const data = await customerService.getAllCustomersStats();
	res.status(200).json({ status: 'success', data });
});
