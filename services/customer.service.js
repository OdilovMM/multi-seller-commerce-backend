const Customer = require('../models/user.model');
const Seller = require('../models/user.model');
const Wishlist = require('../models/wishlist.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const { ObjectId } = require('mongoose').Types;
const logger = require('../utils/logger');
const { NotFoundError } = require('../errors');

class CustomerService {
	async getProfile(userId) {
		logger.info(`[CustomerService] Fetching profile for user: ${userId}`);
		const user = await Customer.findById(userId).populate('wishlists');
		if (!user) throw new NotFoundError('Customer not found');
		return user;
	}

	async getWishlist(userId) {
		logger.info(`[CustomerService] Fetching wishlist for user: ${userId}`);
		const wishlistArray = await Wishlist.find({ userId: new ObjectId(userId) }).populate({
			path: 'wishlists',
			options: { strictPopulate: false },
		});
		const wishlistArrayCount = await Wishlist.countDocuments({ userId: new ObjectId(userId) });
		return { wishlistArray, wishlistArrayCount };
	}

	async getCart(userId) {
		logger.info(`[CustomerService] Fetching cart for user: ${userId}`);
		const cartProducts = await Cart.aggregate([
			{ $match: { userId: new ObjectId(userId) } },
			{
				$lookup: {
					from: 'products',
					localField: 'productId',
					foreignField: '_id',
					as: 'products',
				},
			},
		]);

		if (!cartProducts) return { cartProducts: [], total: 0 };

		let buyProductItem = 0;
		let calculatePrice = 0;
		let cartProductCount = 0;
		const outOfStockProduct = cartProducts.filter((p) => p.products[0].stock < p.quantity);

		const stockProduct = cartProducts.filter((p) => p.products[0].stock >= p.quantity);
		for (let i = 0; i < stockProduct.length; i++) {
			const { quantity } = stockProduct[i];
			buyProductItem += quantity;
			cartProductCount = buyProductItem;
			const { price, discount } = stockProduct[i].products[0];
			calculatePrice +=
				quantity * (discount ? price - Math.floor((price * discount) / 100) : price);
		}

		let p = [];
		const uniqueSellers = [...new Set(stockProduct.map((p) => p.products[0].sellerId.toString()))];
		for (let i = 0; i < uniqueSellers.length; i++) {
			let price = 0;
			for (let j = 0; j < stockProduct.length; j++) {
				const tempProduct = stockProduct[j].products[0];
				if (uniqueSellers[i] === tempProduct.sellerId.toString()) {
					let pri = tempProduct.discount
						? tempProduct.price - Math.floor((tempProduct.price * tempProduct.discount) / 100)
						: tempProduct.price;
					price += pri * stockProduct[j].quantity;
					p[i] = p[i]
						? {
								...p[i],
								products: [
									...p[i].products,
									{
										_id: stockProduct[j]._id,
										quantity: stockProduct[j].quantity,
										productInfo: tempProduct,
									},
								],
							}
						: {
								sellerId: uniqueSellers[i],
								shopName: tempProduct.shopName,
								price,
								products: [
									{
										_id: stockProduct[j]._id,
										quantity: stockProduct[j].quantity,
										productInfo: tempProduct,
									},
								],
							};
				}
			}
		}

		return {
			cartProducts: p,
			price: calculatePrice,
			cartProductCount,
			outOfStockProduct,
			buyProductItem,
			shippingFee: 20 * p.length,
		};
	}

	async addRemoveWishlist(userId, productId) {
		logger.info(`[CustomerService] Add/Remove wishlist for user: ${userId}, product: ${productId}`);
		const product = await Product.findById(productId);
		if (!product) throw new NotFoundError('Product not found');

		const savedWishlist = await Wishlist.findOne({ productId, userId });
		if (savedWishlist) {
			await Wishlist.findByIdAndDelete(savedWishlist._id);
			return { savedWishlist, isSaved: false };
		} else {
			const newWishlist = await Wishlist.create({ userId, productId });
			return { savedWishlist: newWishlist, isSaved: true };
		}
	}

	async addRemoveCart(userId, productId, quantity) {
		logger.info(`[CustomerService] Add/Remove cart for user: ${userId}, product: ${productId}`);
		const product = await Product.findById(productId);
		if (!product) throw new NotFoundError('Product not found');

		const savedCart = await Cart.findOne({ productId, userId });
		if (savedCart) {
			await Cart.findByIdAndDelete(savedCart._id);
			return { savedCart, isSaved: false };
		} else {
			const newCart = await Cart.create({ userId, productId, quantity });
			return { savedCart: newCart, isSaved: true };
		}
	}

	async incrementCartItem(userId, productId) {
		const cartItem = await Cart.findOne({ userId, productId });
		if (!cartItem) throw new NotFoundError('Cart item not found');
		cartItem.quantity += 1;
		await cartItem.save();
		return cartItem;
	}

	async decrementCartItem(userId, productId) {
		const cartItem = await Cart.findOne({ userId, productId });
		if (!cartItem) throw new NotFoundError('Cart item not found');
		if (cartItem.quantity <= 1) throw new Error('Quantity cannot be less than 1');
		cartItem.quantity -= 1;
		await cartItem.save();
		return cartItem;
	}

	async getAllCustomersStats() {
		const customers = await Customer.find({});
		const countCustomer = await Customer.countDocuments();
		const countSeller = await Seller.countDocuments();
		const countCategory = await Category.countDocuments();
		return { customers, countCustomer, countSeller, countCategory };
	}
}

module.exports = new CustomerService();
