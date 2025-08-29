const asyncErrorHandler = require('../utils/asyncErrorHandler');
const bannerService = require('../services/banner.service');
const logger = require('../utils/logger');

exports.getAllBanners = asyncErrorHandler(async (req, res) => {
	const banners = await bannerService.getAll();
	logger.info('[BannerController] getAllBanners success');
	res.status(200).json({ status: 'success', data: { banners } });
});

exports.createBanner = asyncErrorHandler(async (req, res) => {
	const banner = await bannerService.create(req);
	logger.info('[BannerController] createBanner success');
	res.status(201).json({ status: 'success', data: { banner } });
});

exports.getBannerByProductId = asyncErrorHandler(async (req, res) => {
	const { productId } = req.params;
	const banner = await bannerService.getByProductId(productId);
	logger.info('[BannerController] getBannerByProductId success');
	res.status(200).json({ status: 'success', data: { banner } });
});

exports.updateBanner = asyncErrorHandler(async (req, res) => {
	const { bannerId } = req.params;
	const updatedBanner = await bannerService.update(bannerId, req);
	logger.info('[BannerController] updateBanner success');
	res.status(200).json({ status: 'success', data: { banner: updatedBanner } });
});
