const Seller = require('../models/seller.model');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { ObjectId } = require('mongoose').Types;

// dashboard related
const SellerWallet = require('../models/seller-wallet.model');
const Product = require('../models/product.model');
const AuthOrder = require('../models/auth-order.model');

const cloudinary = require('cloudinary').v2;
const formidable = require('formidable');

exports.uploadSellerProfileImage = asyncErrorHandler(async (req, res, next) => {
	const { id } = req;
	const form = formidable({ multiples: true });

	form.parse(req, async (err, _, files) => {
		cloudinary.config({
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.CLOUD_API_KEY,
			api_secret: process.env.CLOUD_API_SECRET,
			secure: true,
		});

		const { image } = files;

		try {
			const result = await cloudinary.uploader.upload(image.filepath, {
				folder: 'profile',
			});

			if (result) {
				await Seller.findByIdAndUpdate(id, { image: result.url });
				const userInfo = await Seller.findById(id);
				res.status(200).json({
					status: 'Image Uploaded',
					data: {
						userInfo,
					},
				});
			} else {
				return next(new AppError('Invalid Image', 400));
			}
		} catch (error) {
			return next(new AppError(error.message, 500));
		}
	});
});

exports.getSellerDetail = asyncErrorHandler(async (req, res, next) => {
	const { sellerId } = req.params;

	const seller = await Seller.findById(sellerId);
	res.status(200).json({
		status: 'success',
		data: {
			seller,
		},
	});
});

exports.addSellerAddress = asyncErrorHandler(async (req, res, next) => {
	const { division, district, shopName, subDistrict } = req.body;
	const { id } = req.user;
	try {
		await Seller.findByIdAndUpdate(id, {
			shopInfo: {
				shopName,
				division,
				district,
				subDistrict,
			},
		});
		const sellerInfo = await Seller.findById(id);
		res.status(201).json({
			status: 'User information updated',
			data: {
				sellerInfo,
			},
		});
	} catch (error) {
		return next(new AppError(error.message, 500));
	}
});

exports.getSellerRequestToActive = asyncErrorHandler(async (req, res, next) => {
	const { page, search, parPage } = req.query;
	const skipPage = parseInt(parPage) * (parseInt(page) - 1);

	try {
		if (search) {
		} else {
			const sellers = await Seller.find({ status: 'pending' })
				.skip(skipPage)
				.limit(parPage)
				.sort({ createdAt: -1 });

			const totalSellers = await Seller.find({
				status: 'pending',
			}).countDocuments();
			res.status(200).json({
				status: 'success',
				data: {
					sellers,
					totalSellers,
				},
			});
		}
	} catch (error) {
		return next(new AppError(error.message, 500));
	}
});

exports.getMeSeller = asyncErrorHandler(async (req, res, next) => {
	const { _id } = req.user;

	const seller = await Seller.findById(_id);
	res.status(200).json({
		status: 'success',
		data: {
			seller,
		},
	});
});

exports.updateSellerStatus = asyncErrorHandler(async (req, res, next) => {
	const { sellerId, status } = req.body;

	await Seller.findByIdAndUpdate(sellerId, { status });
	const seller = await Seller.findById(sellerId);
	res.status(200).json({
		status: `Status updated into ${req.body.status}`,
		data: {
			seller,
		},
	});
});

exports.getActiveSellers = asyncErrorHandler(async (req, res, next) => {
	let { page, search, parPage } = req.query;
	page = parseInt(page);
	parPage = parseInt(parPage);
	const skipPage = parPage * (page - 1);
	try {
		if (search) {
			const sellers = await Seller.find({
				$text: { $search: search },
				status: 'active',
			})
				.skip(skipPage)
				.limit(parPage)
				.sort({ createdAt: -1 });
			const totalSellers = await Seller.find({
				$text: { $search: search },
				status: 'active',
			}).countDocuments();

			res.status(200).json({
				status: 'success',
				data: {
					totalSellers,
					sellers,
				},
			});
		} else {
			const sellers = await Seller.find({
				status: 'active',
			})
				.skip(skipPage)
				.limit(parPage)
				.sort({ createdAt: -1 });

			const totalSellers = await Seller.find({
				status: 'active',
			}).countDocuments();

			res.status(200).json({
				status: 'success',
				data: {
					totalSellers,
					sellers,
				},
			});
		}
	} catch (error) {
		return next(new AppError(error.message, 500));
	}
});

exports.getDeActiveSellers = asyncErrorHandler(async (req, res, next) => {
	let { page, search, parPage } = req.query;
	page = parseInt(page);
	parPage = parseInt(parPage);
	const skipPage = parPage * (page - 1);
	try {
		if (search) {
			const deactiveSellers = await Seller.find({
				$text: { $search: search },
				status: 'deactive',
			})
				.skip(skipPage)
				.limit(parPage)
				.sort({ createdAt: -1 });

			const totalDeactives = await Seller.find({
				$text: { $search: search },
				status: 'deactive',
			}).countDocuments();
			res.status(200).json({
				status: 'success',
				data: {
					totalDeactives,
					deactiveSellers,
				},
			});
		} else {
			const deactiveSellers = await Seller.find({
				status: 'deactive',
			})
				.skip(skipPage)
				.limit(parPage)
				.sort({ createdAt: -1 });

			const totalDeactives = await Seller.find({
				status: 'deactive',
			}).countDocuments();

			res.status(200).json({
				status: 'success',
				data: {
					totalDeactives,
					deactiveSellers,
				},
			});
		}
	} catch (error) {
		return next(new AppError(error.message, 500));
	}
});

exports.uploadSellerProfilePhoto = asyncErrorHandler(async (req, res, next) => {
	const { id } = req.user;
	const form = formidable({ multiples: true });

	form.parse(req, async (err, _, files) => {
		cloudinary.config({
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.CLOUD_API_KEY,
			api_secret: process.env.CLOUD_API_SECRET,
			secure: true,
		});

		const { image } = files;

		try {
			const result = await cloudinary.uploader.upload(image.filepath, {
				folder: 'profile',
			});

			if (result) {
				await Seller.findByIdAndUpdate(id, { image: result.url });
				const userInfo = await Seller.findById(id);

				res.status(200).json({
					status: 'success',
					data: {
						userInfo,
					},
				});
			} else {
				return next(new AppError('Image upload failed', 400));
			}
		} catch (error) {
			return next(new AppError(error.message, 400));
		}
	});
});

exports.getSellerDashboardInfo = asyncErrorHandler(async (req, res, next) => {
	try {
		const totalSales = await SellerWallet.aggregate([
			{
				$match: {
					sellerId: {
						$eq: req.user.id,
					},
				},
			},
			{
				$group: {
					_id: null,
					totalAmount: {
						$sum: '$amount',
					},
				},
			},
		]);
		const totalProducts = await Product.find({
			sellerId: new Object(req.user.id),
		}).countDocuments();

		const totalOrders = await AuthOrder.find({
			sellerId: new Object(req.user.id),
		}).countDocuments();

		const totalPendingOrder = await AuthOrder.find({
			$and: [
				{
					sellerId: {
						$eq: new ObjectId(req.user.id),
					},
				},
				{
					deliveryStatus: {
						$eq: 'pending',
					},
				},
			],
		}).countDocuments();

		const recentOrders = await AuthOrder.find({
			sellerId: new ObjectId(req.user.id),
		}).limit(3);

		res.status(200).json({
			status: 'success',
			data: {
				totalSales: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
				totalProducts,
				totalOrders,
				recentOrders,
				totalPendingOrder,
			},
		});
	} catch (error) {
		return next(new AppError(error.message, 400));
	}
});
