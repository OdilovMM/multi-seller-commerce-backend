const Cart = require('../models/cart.model');
const AppError = require('../errors/custom-api');
const logger = require('../utils/logger');

class CartService {
	static async addProductToCart({ userId, productId, quantity }) {
		try {
			const existingProduct = await Cart.findOne({ userId, productId });

			if (existingProduct) {
				logger.warn(`User ${userId} tried to add duplicate product ${productId} to cart`);
				throw new AppError('Product already in cart', 400);
			}

			const cartItem = await Cart.create({ userId, productId, quantity });
			logger.info(`Product ${productId} added to cart for user ${userId}`);
			return cartItem;
		} catch (error) {
			logger.error(error.message);
			throw new AppError(error.message, error.statusCode || 500);
		}
	}

	static async getUserCart(userId) {
		try {
			const cartItems = await Cart.find({ userId });
			return cartItems;
		} catch (error) {
			logger.error(error.message);
			throw new AppError(error.message, 500);
		}
	}

	static async removeProductFromCart(userId, productId) {
		try {
			const cartItem = await Cart.findOneAndDelete({ userId, productId });
			if (!cartItem) {
				throw new AppError('Product not found in cart', 404);
			}
			logger.info(`Product ${productId} removed from cart for user ${userId}`);
			return cartItem;
		} catch (error) {
			logger.error(error.message);
			throw new AppError(error.message, error.statusCode || 500);
		}
	}
}

module.exports = CartService;
