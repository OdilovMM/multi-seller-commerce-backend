const Banner = require('../models/banner.model');
const Product = require('../models/product.model');
const cloudinary = require('cloudinary').v2;
const formidable = require('formidable');
const {
	mongo: { ObjectId },
} = require('mongoose');
const logger = require('../utils/logger');
const { BadRequestError, NotFoundError, CustomAPIError } = require('../errors');

class BannerService {
	constructor() {
		cloudinary.config({
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.CLOUD_API_KEY,
			api_secret: process.env.CLOUD_API_SECRET,
			secure: true,
		});
	}

	async getAll() {
		logger.info('[BannerService] getAll called');
		try {
			return await Banner.find({});
		} catch (error) {
			logger.error({ error }, '[BannerService] Failed to getAll');
			throw new CustomAPIError('Failed to fetch banners');
		}
	}

	async create(req) {
		logger.info('[BannerService] create called');
		const form = formidable({ multiples: true });

		return new Promise((resolve, reject) => {
			form.parse(req, async (err, field, files) => {
				if (err) {
					logger.error({ err }, '[BannerService] Form parse error');
					return reject(new BadRequestError('Form data parse failed'));
				}

				const { productId } = field;
				const { mainban } = files;
				if (!productId || !mainban) {
					logger.error('[BannerService] Missing productId or banner image');
					return reject(new BadRequestError('ProductId and banner image are required'));
				}

				try {
					const product = await Product.findById(productId);
					if (!product) throw new NotFoundError('Product not found');

					const result = await cloudinary.uploader.upload(mainban.filepath, {
						folder: 'banner',
					});

					const banner = await Banner.create({
						productId,
						banner: result.url,
						link: product.slug,
					});

					logger.info(`[BannerService] Banner created for productId: ${productId}`);
					resolve(banner);
				} catch (error) {
					logger.error({ error }, '[BannerService] Failed to create banner');
					reject(new CustomAPIError('Failed to create banner'));
				}
			});
		});
	}

	async getByProductId(productId) {
		logger.info(`[BannerService] getByProductId called for productId: ${productId}`);
		if (!ObjectId.isValid(productId)) throw new BadRequestError('Invalid productId');

		try {
			const banner = await Banner.findOne({ productId: new ObjectId(productId) });
			if (!banner) throw new NotFoundError('Banner not found');
			return banner;
		} catch (error) {
			logger.error({ error }, '[BannerService] Failed to getByProductId');
			throw new CustomAPIError('Failed to fetch banner');
		}
	}

	async update(bannerId, req) {
		logger.info(`[BannerService] update called for bannerId: ${bannerId}`);
		if (!ObjectId.isValid(bannerId)) throw new BadRequestError('Invalid bannerId');

		const form = formidable({});

		return new Promise((resolve, reject) => {
			form.parse(req, async (err, _, files) => {
				if (err) {
					logger.error({ err }, '[BannerService] Form parse error on update');
					return reject(new BadRequestError('Form data parse failed'));
				}

				const { mainban } = files;
				if (!mainban) {
					logger.error('[BannerService] Missing new banner image');
					return reject(new BadRequestError('New banner image is required'));
				}

				try {
					const banner = await Banner.findById(bannerId);
					if (!banner) throw new NotFoundError('Banner not found');

					// Delete old image from cloudinary
					let temp = banner.banner.split('/');
					temp = temp[temp.length - 1];
					const imageName = temp.split('.')[0];
					await cloudinary.uploader.destroy(imageName);

					// Upload new image
					const { url } = await cloudinary.uploader.upload(mainban.filepath, {
						folder: 'banner',
					});

					await Banner.findByIdAndUpdate(bannerId, { banner: url });

					const updatedBanner = await Banner.findById(bannerId);
					logger.info(`[BannerService] Banner updated for bannerId: ${bannerId}`);
					resolve(updatedBanner);
				} catch (error) {
					logger.error({ error }, '[BannerService] Failed to update banner');
					reject(new CustomAPIError('Failed to update banner'));
				}
			});
		});
	}
}

module.exports = new BannerService();
