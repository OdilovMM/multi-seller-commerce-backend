const Admin = require('../models/admin.model');
// dashboard related
const CustomerOrders = require('../models/customer-order.model');
const MyWallet = require('../models/my-wallet.model');
const catchAsync = require('../utils/asyncErrorHandler');

exports.getMeAdmin = catchAsync(async (req, res, next) => {
	const { _id } = req.user;

	const admin = await Admin.findById(_id);
	res.status(200).json({
		status: 'success',
		data: {
			admin,
		},
	});
});

exports.getAdminDashboardInfo = catchAsync(async (req, res, next) => {
	const totalSales = await MyWallet.aggregate([
		{
			$group: {
				_id: null,
				totalAmount: {
					$sum: '$amount',
				},
			},
		},
	]);
	const totalOrders = await CustomerOrders.find({}).countDocuments();

	res.status(200).json({
		status: 'success',
		data: {
			totalSales: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
			totalOrders,
		},
	});
});
