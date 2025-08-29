const Seller = require('../models/user.model');
const SellerWallet = require('../models/seller-wallet.model');
const Product = require('../models/product.model');
const AuthOrder = require('../models/auth-order.model');
const cloudinary = require('cloudinary').v2;
const { ObjectId } = require('mongoose').Types;
const logger = require('../utils/logger');
const { BadRequestError, NotFoundError, CustomAPIError } = require('../errors');

class SellerService {
	async uploadProfileImage(userId, imagePath) {
		cloudinary.config({
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.CLOUD_API_KEY,
			api_secret: process.env.CLOUD_API_SECRET,
			secure: true,
		});

		try {
			const result = await cloudinary.uploader.upload(imagePath, { folder: 'profile' });
			if (!result) throw new BadRequestError('Image upload failed');

			await Seller.findByIdAndUpdate(userId, { image: result.url });
			const userInfo = await Seller.findById(userId);
			logger.info(`[SellerService] Profile image uploaded for sellerId: ${userId}`);
			return userInfo;
		} catch (error) {
			logger.error(`[SellerService] uploadProfileImage error: ${error.message}`);
			throw new CustomAPIError(error.message);
		}
	}

	async addAddress(userId, shopInfo) {
		try {
			await Seller.findByIdAndUpdate(userId, { shopInfo });
			const userInfo = await Seller.findById(userId);
			logger.info(`[SellerService] Address updated for sellerId: ${userId}`);
			return userInfo;
		} catch (error) {
			logger.error(`[SellerService] addAddress error: ${error.message}`);
			throw new CustomAPIError(error.message);
		}
	}

	async getSellerById(sellerId) {
		const seller = await Seller.findById(sellerId);
		if (!seller) {
			logger.warn(`[SellerService] Seller not found: ${sellerId}`);
			throw new NotFoundError('Seller not found');
		}
		return seller;
	}

	async getSellersByStatus(status, page = 1, perPage = 10, search) {
		const skip = perPage * (page - 1);
		const query = { status };
		if (search) query.$text = { $search: search };

		const sellers = await Seller.find(query).skip(skip).limit(perPage).sort({ createdAt: -1 });
		const total = await Seller.countDocuments(query);
		logger.info(`[SellerService] Retrieved sellers with status: ${status}`);
		return { sellers, total };
	}

	async updateSellerStatus(sellerId, status) {
		await Seller.findByIdAndUpdate(sellerId, { status });
		const seller = await Seller.findById(sellerId);
		if (!seller) throw new NotFoundError('Seller not found');
		logger.info(`[SellerService] Seller status updated: ${sellerId} -> ${status}`);
		return seller;
	}

	async getSellerDashboardInfo(userId) {
		try {
			const totalSalesAgg = await SellerWallet.aggregate([
				{ $match: { sellerId: new ObjectId(userId) } },
				{ $group: { _id: null, totalAmount: { $sum: '$amount' } } },
			]);

			const totalProducts = await Product.countDocuments({ sellerId: new ObjectId(userId) });
			const totalOrders = await AuthOrder.countDocuments({ sellerId: new ObjectId(userId) });
			const totalPendingOrder = await AuthOrder.countDocuments({
				sellerId: new ObjectId(userId),
				deliveryStatus: 'pending',
			});
			const recentOrders = await AuthOrder.find({ sellerId: new ObjectId(userId) }).limit(3);

			logger.info(`[SellerService] Dashboard info retrieved for sellerId: ${userId}`);
			return {
				totalSales: totalSalesAgg.length ? totalSalesAgg[0].totalAmount : 0,
				totalProducts,
				totalOrders,
				totalPendingOrder,
				recentOrders,
			};
		} catch (error) {
			logger.error(`[SellerService] getSellerDashboardInfo error: ${error.message}`);
			throw new CustomAPIError(error.message);
		}
	}

	async getMe(userId) {
		const seller = await Seller.findById(userId);
		if (!seller) throw new NotFoundError('Seller not found');
		return seller;
	}
}

module.exports = new SellerService();
