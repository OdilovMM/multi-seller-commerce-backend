const Product = require('./../models/productModel');
const Banner = require('./../models/bannerModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
const {
  mongo: { ObjectId },
} = require('mongoose');

formateProduct = (products) => {
  const productArray = [];
  let i = 0;
  while (i < products.length) {
    let temp = [];
    let j = i;
    while (j < i + 3) {
      if (products[j]) {
        temp.push(products[j]);
      }
      j++;
    }
    productArray.push([...temp]);
    i = j;
  }
  return productArray;
};


exports.getAllBanners = catchAsync(async (req, res, next) => {
  const banners = await Banner.find({});

  res.status(200).json({
    status: 'ok',
    data: {
      banners,
    },
  });
});

exports.addBanner = catchAsync(async (req, res, next) => {
  const form = formidable({ multiples: true });
  form.parse(req, async (err, field, files) => {
    const { productId } = field;
    const { mainban } = files;

    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
      secure: true,
    });

    try {
      const { slug } = await Product.findById(productId);
      const result = await cloudinary.uploader.upload(mainban.filepath, {
        folder: 'banner',
      });
      const banner = await Banner.create({
        productId,
        banner: result.url,
        link: slug,
      });
      res.status(201).json({
        status: 'Banner Added',
        data: {
          banner,
        },
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  });
});

exports.getBanner = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const getBanner = await Banner.findOne({
    productId: new ObjectId(productId),
  });
  res.status(201).json({
    status: 'success',
    data: {
      getBanner,
    },
  });
});

exports.updateBanner = catchAsync(async (req, res, next) => {
  const { bannerId } = req.params;
  const form = formidable({});

  form.parse(req, async (err, _, files) => {
    const { mainban } = files;

    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
      secure: true,
    });

    const banner = await Banner.findById(bannerId);
    let temp = banner.banner.split('/');
    temp = temp[temp.length - 1];
    const imageName = temp.split('.')[0];
    await cloudinary.uploader.destroy(imageName);

    const { url } = await cloudinary.uploader.upload(mainban.filepath, {
      folder: 'banner',
    });

    await Banner.findByIdAndUpdate(bannerId, {
      banner: url,
    });

    const updatedBanner = await Banner.findById(bannerId);

    res.status(201).json({
      status: 'Banner Updated',
      data: {
        banner: updatedBanner,
      },
    });
  });
});
