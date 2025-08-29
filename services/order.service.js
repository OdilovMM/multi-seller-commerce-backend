const CustomerOrder = require('../models/customer-order.model');
const AuthOrder = require('../models/auth-order.model');
const Cart = require('../models/cart.model');
const MyWallet = require('../models/my-wallet.model');
const SellerWallet = require('../models/seller-wallet.model');
const stripe = require('stripe')(process.env.SECRET_KEY_STRIPE);
const moment = require('moment');
const { ObjectId } = require('mongoose').Types;
const logger = require('../utils/logger');
const { NotFoundError, BadRequestError, CustomAPIError } = require('../errors');

class OrderService {
	// Cancel unpaid order after timeout
	async paymentCheck(orderId) {
		try {
			const order = await CustomerOrder.findById(orderId);
			if (!order) throw new NotFoundError('Order not found');

			if (order.paymentStatus === 'unpaid') {
				await CustomerOrder.findByIdAndUpdate(orderId, {
					deliveryStatus: 'canceled',
				});

				await AuthOrder.updateMany({ orderId }, { deliveryStatus: 'canceled' });

				logger.info(`Order ${orderId} canceled due to unpaid status.`);
			}

			return true;
		} catch (err) {
			logger.error(`paymentCheck Error: ${err.message}`);
			throw new CustomAPIError(err.message);
		}
	}

	// Place new order
	async placeOrder(data) {
		const { products, shippingFee, price, shippingToAddress, userId } = data;

		try {
			let customerOrderProduct = [];
			let cartIds = [];
			let authorOrderData = [];
			const formatDate = moment().format('LLL');

			products.forEach((prodGroup) => {
				prodGroup.products.forEach((item) => {
					const tempProd = item.productInfo;
					tempProd.quantity = item.quantity;
					customerOrderProduct.push(tempProd);

					if (item._id) cartIds.push(item._id);
				});
			});

			const customerOrder = await CustomerOrder.create({
				customerId: userId,
				shippingInfo: shippingToAddress,
				products: customerOrderProduct,
				price: price + shippingFee,
				paymentStatus: 'unpaid',
				deliveryStatus: 'pending',
				date: formatDate,
			});

			products.forEach((prodGroup) => {
				const storeProducts = prodGroup.products.map((item) => {
					const tempProd = item.productInfo;
					tempProd.quantity = item.quantity;
					return tempProd;
				});

				authorOrderData.push({
					orderId: customerOrder._id,
					sellerId: prodGroup.sellerId,
					products: storeProducts,
					price: prodGroup.price,
					paymentStatus: 'unpaid',
					shippingInfo: 'Market Warehouse',
					deliveryStatus: 'pending',
					date: formatDate,
				});
			});

			await AuthOrder.insertMany(authorOrderData);
			await Cart.deleteMany({ _id: { $in: cartIds } });

			setTimeout(
				() => {
					this.paymentCheck(customerOrder._id);
				},
				10 * 60 * 1000,
			); // 10 minutes

			logger.info(`Order ${customerOrder._id} placed by user ${userId}`);
			return customerOrder;
		} catch (err) {
			logger.error(`placeOrder Error: ${err.message}`);
			throw new CustomAPIError(err.message);
		}
	}

	// Get customer orders by status
	async getOrdersByStatus(userId, status) {
		try {
			let orders;
			if (status && status !== 'all') {
				orders = await CustomerOrder.find({
					customerId: new ObjectId(userId),
					deliveryStatus: status,
				});
			} else {
				orders = await CustomerOrder.find({
					customerId: new ObjectId(userId),
				});
			}
			return orders;
		} catch (err) {
			logger.error(`getOrdersByStatus Error: ${err.message}`);
			throw new CustomAPIError(err.message);
		}
	}

	// Get single order detail
	async getOrderDetail(orderId) {
		try {
			const order = await CustomerOrder.findById(orderId);
			if (!order) throw new NotFoundError('Order not found');
			return order;
		} catch (err) {
			logger.error(`getOrderDetail Error: ${err.message}`);
			throw new CustomAPIError(err.message);
		}
	}

	// Create Stripe payment
	async createPayment(price) {
		try {
			const payment = await stripe.paymentIntents.create({
				amount: price * 100,
				currency: 'usd',
				automatic_payment_methods: { enabled: true },
			});

			return payment.client_secret;
		} catch (err) {
			logger.error(`createPayment Error: ${err.message}`);
			throw new CustomAPIError(err.message);
		}
	}

	// Confirm order payment
	async confirmOrder(orderId) {
		try {
			const cuOrder = await CustomerOrder.findByIdAndUpdate(
				orderId,
				{
					paymentStatus: 'paid',
				},
				{ new: true },
			);

			if (!cuOrder) throw new NotFoundError('Customer Order not found');

			const auOrders = await AuthOrder.updateMany(
				{ orderId },
				{ paymentStatus: 'paid', deliveryStatus: 'pending' },
			);

			const allAuthOrders = await AuthOrder.find({ orderId });

			const timeSplit = moment().format('l').split('/');
			await MyWallet.create({
				amount: cuOrder.price,
				month: timeSplit[0],
				year: timeSplit[2],
			});

			for (const auth of allAuthOrders) {
				await SellerWallet.create({
					sellerId: auth.sellerId.toString(),
					amount: auth.price,
					month: timeSplit[0],
					year: timeSplit[2],
				});
			}

			logger.info(`Order ${orderId} confirmed`);
			return true;
		} catch (err) {
			logger.error(`confirmOrder Error: ${err.message}`);
			throw new CustomAPIError(err.message);
		}
	}

	// Customer dashboard data
	async getCustomerDashboard(userId) {
		try {
			const recentOrders = await CustomerOrder.find({
				customerId: new ObjectId(userId),
			}).limit(5);

			const pendingOrder = await CustomerOrder.countDocuments({
				customerId: new ObjectId(userId),
				deliveryStatus: 'pending',
			});

			const totalOrder = await CustomerOrder.countDocuments({
				customerId: new ObjectId(userId),
			});

			const cancelledOrder = await CustomerOrder.countDocuments({
				customerId: new ObjectId(userId),
				deliveryStatus: 'canceled',
			});

			return { recentOrders, pendingOrder, totalOrder, cancelledOrder };
		} catch (err) {
			logger.error(`getCustomerDashboard Error: ${err.message}`);
			throw new CustomAPIError(err.message);
		}
	}

	// Seller Orders
	async getSellerOrders(sellerId, page = 1, perPage = 10) {
		try {
			const skip = perPage * (page - 1);
			const orders = await AuthOrder.find({ sellerId })
				.skip(skip)
				.limit(perPage)
				.sort({ createdAt: -1 });

			const totalOrder = await AuthOrder.countDocuments({ sellerId });
			return { orders, totalOrder };
		} catch (err) {
			logger.error(`getSellerOrders Error: ${err.message}`);
			throw new CustomAPIError(err.message);
		}
	}

	async getSellerOrderDetail(orderId) {
		try {
			const order = await AuthOrder.findById(orderId);
			if (!order) throw new NotFoundError('Seller order not found');
			return order;
		} catch (err) {
			logger.error(`getSellerOrderDetail Error: ${err.message}`);
			throw new CustomAPIError(err.message);
		}
	}

	async updateSellerOrderStatus(orderId, status) {
		try {
			const order = await AuthOrder.findByIdAndUpdate(
				orderId,
				{
					deliveryStatus: status,
				},
				{ new: true },
			);

			if (!order) throw new NotFoundError('Order not found');
			logger.info(`Seller order ${orderId} updated to ${status}`);
			return order;
		} catch (err) {
			logger.error(`updateSellerOrderStatus Error: ${err.message}`);
			throw new CustomAPIError(err.message);
		}
	}

	// Admin Orders
	async getAdminOrders(page = 1, perPage = 10) {
		try {
			const skip = perPage * (page - 1);
			const orders = await CustomerOrder.aggregate([
				{
					$lookup: {
						from: 'authorders',
						localField: '_id',
						foreignField: 'orderId',
						as: 'suborder',
					},
				},
			])
				.skip(skip)
				.limit(perPage)
				.sort({ createdAt: -1 });

			const totalOrder = await CustomerOrder.aggregate([
				{
					$lookup: {
						from: 'authorders',
						localField: '_id',
						foreignField: 'orderId',
						as: 'suborder',
					},
				},
			]);

			return { orders, totalOrder: totalOrder.length };
		} catch (err) {
			logger.error(`getAdminOrders Error: ${err.message}`);
			throw new CustomAPIError(err.message);
		}
	}

	async getAdminOrderDetail(orderId) {
		try {
			const order = await CustomerOrder.aggregate([
				{ $match: { _id: new ObjectId(orderId) } },
				{
					$lookup: {
						from: 'authorders',
						localField: '_id',
						foreignField: 'orderId',
						as: 'suborder',
					},
				},
			]);

			if (!order[0]) throw new NotFoundError('Order not found');
			return order[0];
		} catch (err) {
			logger.error(`getAdminOrderDetail Error: ${err.message}`);
			throw new CustomAPIError(err.message);
		}
	}

	async updateAdminOrderStatus(orderId, status) {
		try {
			const order = await CustomerOrder.findByIdAndUpdate(
				orderId,
				{
					deliveryStatus: status,
				},
				{ new: true },
			);

			if (!order) throw new NotFoundError('Order not found');
			logger.info(`Admin order ${orderId} updated to ${status}`);
			return order;
		} catch (err) {
			logger.error(`updateAdminOrderStatus Error: ${err.message}`);
			throw new CustomAPIError(err.message);
		}
	}
}

module.exports = new OrderService();
