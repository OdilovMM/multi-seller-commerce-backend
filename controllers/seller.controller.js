const sellerService = require('../services/seller.service');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const formidable = require('formidable');
const logger = require('../utils/logger');

exports.uploadProfileImage = asyncErrorHandler(async (req, res) => {
	const { _id } = req.user;
	const form = formidable({ multiples: true });

	form.parse(req, async (err, _, files) => {
		if (err) {
			logger.error(`[SellerController] Formidable parse error: ${err.message}`);
			throw new Error('Image parsing failed');
		}
		const { image } = files;
		const userInfo = await sellerService.uploadProfileImage(_id, image.filepath);
		res.status(200).json({ status: 'success', data: { userInfo } });
	});
});

exports.addAddress = asyncErrorHandler(async (req, res) => {
	const { _id } = req.user;
	const { shopName, division, district, subDistrict } = req.body;
	const userInfo = await sellerService.addAddress(_id, {
		shopName,
		division,
		district,
		subDistrict,
	});
	res.status(201).json({ status: 'success', data: { userInfo } });
});

exports.getSellerById = asyncErrorHandler(async (req, res) => {
	const seller = await sellerService.getSellerById(req.params.sellerId);
	res.status(200).json({ status: 'success', data: { seller } });
});

exports.getSellersByStatus = asyncErrorHandler(async (req, res) => {
	const { page = 1, parPage = 10, search } = req.query;
	const data = await sellerService.getSellersByStatus(
		req.query.status,
		parseInt(page),
		parseInt(parPage),
		search,
	);
	res.status(200).json({ status: 'success', data });
});

exports.updateSellerStatus = asyncErrorHandler(async (req, res) => {
	const { sellerId, status } = req.body;
	const seller = await sellerService.updateSellerStatus(sellerId, status);
	res.status(200).json({ status: `Status updated to ${status}`, data: { seller } });
});

exports.getDashboardInfo = asyncErrorHandler(async (req, res) => {
	const data = await sellerService.getSellerDashboardInfo(req.user._id);
	res.status(200).json({ status: 'success', data });
});

exports.getMe = asyncErrorHandler(async (req, res) => {
	const seller = await sellerService.getMe(req.user._id);
	res.status(200).json({ status: 'success', data: { seller } });
});
