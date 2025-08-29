const CartService = require('../services/cart.service');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

exports.addProductToCart = asyncErrorHandler(async (req, res, next) => {
	const { productId, quantity } = req.body;
	const userId = req.user.id;

	const cartItem = await CartService.addProductToCart({ userId, productId, quantity });

	res.status(201).json({
		status: 'success',
		message: 'Product added to cart',
		data: cartItem,
	});
});

exports.getUserCart = asyncErrorHandler(async (req, res, next) => {
	const userId = req.user.id;
	const cartItems = await CartService.getUserCart(userId);

	res.status(200).json({
		status: 'success',
		data: cartItems,
	});
});

exports.removeProductFromCart = asyncErrorHandler(async (req, res, next) => {
	const { productId } = req.params;
	const userId = req.user.id;

	const deletedItem = await CartService.removeProductFromCart(userId, productId);

	res.status(200).json({
		status: 'success',
		message: 'Product removed from cart',
		data: deletedItem,
	});
});
