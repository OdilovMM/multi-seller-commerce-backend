const Admin = require('../models/user.model');
const CustomerOrders = require('../models/customer-order.model');
const MyWallet = require('../models/my-wallet.model');
const { NotFoundError } = require('../errors');
const logger = require('../utils/logger');

class AdminService {
	async getProfile(adminId) {
		logger.info(`[AdminService] Fetching admin profile for ID: ${adminId}`);

		const admin = await Admin.findById(adminId);
		if (!admin) {
			logger.error(`[AdminService] Admin not found with ID: ${adminId}`);
			throw new NotFoundError('Admin not found');
		}

		return admin;
	}

	async getDashboardStats() {
		logger.info('[AdminService] Fetching dashboard stats...');

		const totalSalesAgg = await MyWallet.aggregate([
			{ $group: { _id: null, totalAmount: { $sum: '$amount' } } },
		]);

		const totalOrders = await CustomerOrders.countDocuments();

		const totalSales = totalSalesAgg.length > 0 ? totalSalesAgg[0].totalAmount : 0;

		logger.info({ totalSales, totalOrders }, '[AdminService] Dashboard stats calculated');

		return { totalSales, totalOrders };
	}
}

module.exports = new AdminService();
