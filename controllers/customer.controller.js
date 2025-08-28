const Customer = require('../models/customer.model');
const Seller = require('../models/seller.model');
const Wishlist = require('../models/wishlist.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { ObjectId } = require('mongoose').Types;

exports.getMe = asyncErrorHandler(async (req, res) => {
	const userInfo = await Customer.findById(req.user.id).populate({
		path: 'wishlists',
	});

	res.status(200).json({
		status: 'success',
		data: {
			userInfo,
		},
	});
});

exports.getMyWishlist = asyncErrorHandler(async (req, res) => {
	const wishlistArray = await Wishlist.find({
		userId: new ObjectId(req.user.id),
	}).populate({
		path: 'wishlists',
		options: {
			strictPopulate: false,
		},
	});

	const wishlistArrayCount = await Wishlist.find({
		userId: new ObjectId(req.user.id),
	})
		.populate({
			path: 'wishlists',
			options: {
				strictPopulate: false,
			},
		})
		.countDocuments();

	res.status(200).json({
		status: 'success',
		data: {
			wishlistArray,
			wishlistArrayCount,
		},
	});
});

exports.getCustomerCart = asyncErrorHandler(async (req, res) => {
	const co = 5;
	try {
		const cardProducts = await Cart.aggregate([
			{
				$match: {
					userId: {
						$eq: new ObjectId(req.user.id),
					},
				},
			},
			{
				$lookup: {
					from: 'products',
					localField: 'productId',
					foreignField: '_id',
					as: 'products',
				},
			},
		]);
		let buyProductItem = 0;
		let calculatePrice = 0;
		let cardProductCount = 0;
		const outOfStockProduct = cardProducts.filter((p) => p.products[0].stock < p.quantity);
		for (let i = 0; i < outOfStockProduct.length; i++) {
			cardProductCount = cardProductCount + outOfStockProduct[i].quantity;
		}
		const stockProduct = cardProducts.filter((p) => p.products[0].stock >= p.quantity);
		for (let i = 0; i < stockProduct.length; i++) {
			const { quantity } = stockProduct[i];
			cardProductCount = buyProductItem + quantity;

			buyProductItem = buyProductItem + quantity;
			const { price, discount } = stockProduct[i].products[0];
			if (discount !== 0) {
				calculatePrice = calculatePrice + quantity * (price - Math.floor((price * discount) / 100));
			} else {
				calculatePrice = calculatePrice + quantity * price;
			}
		}
		let p = [];
		let unique = [...new Set(stockProduct.map((p) => p.products[0].sellerId.toString()))];
		for (let i = 0; i < unique.length; i++) {
			let price = 0;
			for (let j = 0; j < stockProduct.length; j++) {
				const tempProduct = stockProduct[j].products[0];
				if (unique[i] === tempProduct.sellerId.toString()) {
					let pri = 0;
					if (tempProduct.discount !== 0) {
						pri = tempProduct.price - Math.floor((tempProduct.price * tempProduct.discount) / 100);
					} else {
						pri = tempProduct.price;
					}
					pri = pri - Math.floor((pri * co) / 100);
					price = price + pri * stockProduct[j].quantity;
					p[i] = {
						sellerId: unique[i],
						shopName: tempProduct.shopName,
						price,
						products: p[i]
							? [
									...p[i].products,
									{
										_id: stockProduct[j]._id,
										quantity: stockProduct[j].quantity,
										productInfo: tempProduct,
									},
								]
							: [
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

		res.status(200).json({
			status: 'success',
			data: {
				cardProducts: p,
				price: calculatePrice,
				cardProductCount,
				shippingFee: 20 * p.length,
				outOfStockProduct,
				buyProductItem,
			},
		});
	} catch (error) {
		return next(new AppError(error.message, 500));
	}
});

exports.addRemoveWishList = asyncErrorHandler(async (req, res, next) => {
	const { productId } = req.body;
	const { id } = req.user;

	const product = await Product.findById(productId);

	if (!product) {
		return next(new AppError('product not found', 404));
	}

	try {
		const savedWishlist = await Wishlist.findOne({
			$and: [
				{
					productId: {
						$eq: productId,
					},
				},
				{
					userId: {
						$eq: id,
					},
				},
			],
		});

		if (savedWishlist) {
			await Wishlist.findByIdAndDelete(savedWishlist._id);

			res.status(200).json({
				status: 'Removed',
				data: {
					savedWishlist,
					isSaved: !savedWishlist ? true : false,
				},
			});
		} else {
			const savedWishlist = await Wishlist.create({
				userId: id,
				productId: productId,
			});
			res.status(201).json({
				status: 'Added',
				data: {
					savedWishlist,
					isSaved: savedWishlist ? true : false,
				},
			});
		}
	} catch (error) {
		return next(new AppError(error.message, 500));
	}
});

exports.addRemoveCart = asyncErrorHandler(async (req, res, next) => {
	const { productId, quantity } = req.body;
	const { id } = req.user;

	const product = await Product.findById(productId);

	if (!product) {
		return next(new AppError('product not found', 404));
	}

	try {
		const savedCart = await Cart.findOne({
			$and: [
				{
					productId: {
						$eq: productId,
					},
				},
				{
					userId: {
						$eq: id,
					},
				},
			],
		});

		if (savedCart) {
			await Cart.findByIdAndDelete(savedCart._id);

			res.status(200).json({
				status: 'Removed',
				data: {
					savedCart,
					isSaved: !savedCart ? true : false,
				},
			});
		} else {
			const savedCart = await Cart.create({
				userId: id,
				productId: productId,
				quantity,
			});
			res.status(201).json({
				status: 'Added',
				data: {
					savedCart,
					isSaved: savedCart ? true : false,
				},
			});
		}
	} catch (error) {
		return next(new AppError(error.message, 500));
	}
});

exports.incrementProductInCart = asyncErrorHandler(async (req, res, next) => {
	const { productId } = req.params;
	const userId = req.user._id;

	const cartItem = await Cart.findOne({
		userId,
		productId,
	});

	if (!cartItem) {
		return next(new AppError(error.message, 404));
	}
	cartItem.quantity += 1;
	await cartItem.save();

	res.status(200).json({
		status: 'success',
		data: {
			cartItem,
		},
	});
});

exports.decrementProductInCart = asyncErrorHandler(async (req, res, next) => {
	const { productId } = req.params;
	const userId = req.user._id;

	const cartItem = await Cart.findOne({
		userId,
		productId,
	});
	if (!cartItem) {
		return next(new AppError(error.message, 404));
	}

	if (cartItem.quantity <= 1) {
		return next(new AppError('Quantity can not be less than 1', 400));
	}

	cartItem.quantity -= 1;
	await cartItem.save();

	res.status(200).json({
		status: 'success',
		data: {
			cartItem,
		},
	});
});

exports.getAllCustomers = asyncErrorHandler(async (req, res, next) => {
	const customers = await Customer.find({});
	const countCustomer = await Customer.find({}).countDocuments();
	const countSeller = await Seller.find({}).countDocuments();
	const countCategory = await Category.find({}).countDocuments();

	res.status(200).json({
		status: 'success',
		data: {
			customers,
			countCustomer,
			countSeller,
			countCategory,
		},
	});
});
