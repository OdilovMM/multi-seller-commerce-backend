const Review = require('./../models/reviewModel');
const Product = require('./../models/productModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const formidable = require('formidable');
const moment = require('moment');
const cloudinary = require('cloudinary').v2;
const queryProducts = require('../utils/queryProducts');

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

exports.allProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    status: 'dwadwd',
    data: {
      products,
    },
  });
});

exports.addProduct = catchAsync(async (req, res, next) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, field, files) => {
    let {
      name,
      category,
      description,
      stock,
      price,
      discount,
      brand,
      shopName,
    } = field;
    const { images } = files;

    name = name.trim();
    const slug = name.split(' ').join('-');

    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
      secure: true,
    });

    try {
      let allImageUrl = [];

      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.uploader.upload(images[i].filepath, {
          folder: 'products',
        });
        allImageUrl = [...allImageUrl, result.url];
      }

      const product = await Product.create({
        sellerId: req.user.id,
        name,
        slug,
        shopName,
        category: category.trim(),
        description: description.trim(),
        stock: parseInt(stock),
        price: parseInt(price),
        discount: parseInt(discount),
        images: allImageUrl,
        brand: brand.trim(),
      });

      res.status(201).json({
        status: 'Product Added',
        data: {
          product,
        },
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  });
});

exports.getSingleProduct = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  try {
    const product = await Product.findOne({ slug });
    const categoryRelatedProducts = await Product.find({
      $and: [
        {
          _id: {
            $ne: product._id,
          },
        },
        {
          category: {
            $eq: product.category,
          },
        },
      ],
    }).limit(20);
    const sellerRelatedProducts = await Product.find({
      $and: [
        {
          _id: {
            $ne: product._id,
          },
        },
        {
          sellerId: {
            $eq: product.sellerId,
          },
        },
      ],
    }).limit(5);
    res.status(200).json({
      status: 'success',
      data: {
        product,
        categoryRelatedProducts,
        sellerRelatedProducts,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.getSingleProductToAdmin = catchAsync(async (req, res, next) => {
  try {
    const product = await Product.findById({ _id: req.params.productId });

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  let { name, description, discount, price, brand, stock, productId } =
    req.body;
  trimmedName = name?.trim();
  const slug = trimmedName.split(' ').join('-');

  try {
    await Product.findByIdAndUpdate(
      productId,
      {
        name: trimmedName,
        description,
        discount,
        price,
        brand,
        stock,
        productId,
        slug,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    const product = await Product.findById(productId);

    res.status(200).json({
      status: 'Product Updated',
      data: {
        product,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.updateProductImage = catchAsync(async (req, res, next) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, field, files) => {
    const { oldImage, productId } = field;
    const { newImage } = files;

    if (err) {
      return next(new AppError(err.message, 404));
    } else {
      try {
        cloudinary.config({
          cloud_name: process.env.CLOUD_NAME,
          api_key: process.env.CLOUD_API_KEY,
          api_secret: process.env.CLOUD_API_SECRET,
          secure: true,
        });

        const result = await cloudinary.uploader.upload(newImage.filepath, {
          folder: 'products',
        });

        if (result) {
          let { images } = await Product.findById(productId);
          const index = images.findIndex((img) => img === oldImage);
          images[index] = result.url;
          await Product.findByIdAndUpdate(productId, { images });

          const product = await Product.findById(productId);
          res.status(200).json({
            status: 'Product Image updated',
            data: {
              product,
            },
          });
        } else {
          return next(new AppError(err.message, 404));
        }
      } catch (error) {
        return next(new AppError(err.message, 500));
      }
    }
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { id } = req;
  await Product.findByIdAndDelete({ sellerId: id, id: productId });

  res.status(200).json({
    status: 'Product Deleted',
    data: {
      data: null,
    },
  });
});

exports.addProductReview = catchAsync(async (req, res, next) => {
  const { productId, review, rating, name } = req.body;

  try {
    await Review.create({
      productId,
      name,
      rating,
      review,
      date: moment(Date.now()).format('LL'),
    });

    let rat = 0;
    const reviews = await Review.find({
      productId,
    });
    for (let i = 0; i < reviews.length; i++) {
      rat = rat + reviews[i].rating;
    }
    let productRating = 0;
    if (reviews.length !== 0) {
      productRating = (rat / reviews.length).toFixed(1);
    }
    await Product.findByIdAndUpdate(productId, {
      rating: productRating,
    });
    res.status(201).json({
      status: 'Review added',
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.getAllProductReviews = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  let { pageNumber } = req.query;
  pageNumber = parseInt(pageNumber);
  const limit = 5;
  const skipPage = limit * (pageNumber - 1);

  try {
    let getRating = await Review.aggregate([
      {
        $match: {
          productId: {
            $eq: new ObjectId(productId),
          },
          rating: {
            $not: {
              $size: 0,
            },
          },
        },
      },
      {
        $unwind: '$rating',
      },
      {
        $group: {
          _id: '$rating',
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    let ratingReview = [
      {
        rating: 5,
        sum: 0,
      },
      {
        rating: 4,
        sum: 0,
      },
      {
        rating: 3,
        sum: 0,
      },
      {
        rating: 2,
        sum: 0,
      },
      {
        rating: 1,
        sum: 0,
      },
    ];

    for (let i = 0; i < ratingReview.length; i++) {
      for (let j = 0; j < getRating.length; j++) {
        if (ratingReview[i].rating === getRating[j]._id) {
          ratingReview[i].sum = getRating[j].count;
          break;
        }
      }
    }

    const getAll = await Review.find({
      productId,
    });
    const reviews = await Review.find({
      productId,
    })
      .skip(skipPage)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
        totalReview: getAll.length,
        ratingReview,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 403));
  }
});

exports.getProductsByPriceRange = catchAsync(async (req, res, next) => {
  try {
    const priceRange = {
      low: 0,
      high: 0,
    };

    const products = await Product.find({}).limit(20).sort({
      createdAt: -1,
    });

    const latestProduct = formateProduct(products);
    const getPriceProduct = await Product.find({}).sort({
      price: 1,
    });
    if (getPriceProduct.length > 0) {
      priceRange.high = getPriceProduct[getPriceProduct.length - 1].price;
      priceRange.low = getPriceProduct[0].price;
    }

    res.status(200).json({
      status: 'success',
      data: {
        latestProduct,
        priceRange,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.getHomeProducts = catchAsync(async (req, res, next) => {
  const topRatedProducts = await Product.find().sort({ rating: -1 }).limit(16);
  const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(16);

  res.status(200).json({
    status: 'success',
    data: {
      topRatedProducts,
      newArrivals,
    },
  });
});

exports.getProductQuery = catchAsync(async (req, res, next) => {
  const parPage = 16;
  req.query.parPage = parPage;
  try {
    const products = await Product.find({}).sort({
      createdAt: -1,
    });

    const totalProducts = new queryProducts(products, req.query)
      .queryCategory()
      .queryRating()
      .queryPrice()
      .querySearch()
      .querySortPrice()
      .getProductsCount();

    const result = new queryProducts(products, req.query)
      .queryCategory()
      .queryRating()
      .queryPrice()
      .querySearch()
      .querySortPrice()
      .paginate()
      .limitField()
      .getProducts();

    res.status(200).json({
      status: 'success',
      data: {
        products: result,
        totalProducts: totalProducts,
        parPage,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.getAllMyProductsSeller = catchAsync(async (req, res, next) => {
  const { page = 1, search = '', parPage = 10 } = req.query;
  const id = req.user?.id;

  const skipPage = parseInt(parPage) * (parseInt(page) - 1);

  try {
    const query = id ? { sellerId: id } : {};

    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .skip(skipPage)
      .limit(parseInt(parPage))
      .sort({ createdAt: -1 });

    const totalProducts = await Product.find(query).countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        products,
        totalProducts,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});
exports.getProductToEdit = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

//
exports.updateProductImage = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// Fetch all products of a specific type
exports.getProductsByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  let products;

  if (type === 'top-rated') {
    products = await Product.find().sort({ rating: -1 });
  } else if (type === 'new-arrivals') {
    products = await Product.find().sort({ createdAt: -1 });
  }

  res.status(200).json({
    status: 'success',
    data: {
      products,
    },
  });
});

exports.addProductReview = catchAsync(async (req, res, next) => {
  const { productId, review, rating, firstName } = req.body;

  await Review.create({
    productId,
    firstName,
    rating,
    review,
    date: moment(Date.now()).format('LL'),
  });

  let rat = 0;
  const reviews = await Review.find({
    productId,
  });
  for (let i = 0; i < reviews.length; i++) {
    rat = rat + reviews[i].rating;
  }
  let productRating = 0;
  if (reviews.length !== 0) {
    productRating = (rat / reviews.length).toFixed(1);
  }
  await Product.findByIdAndUpdate(productId, {
    rating: productRating,
  });

  res.status(200).json({
    status: 'Review Added',
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  let { pageNumber } = req.query;
  pageNumber = parseInt(pageNumber);
  const limit = 5;
  const skipPage = limit * (pageNumber - 1);
  try {
    let getRating = await Review.aggregate([
      {
        $match: {
          productId: {
            $eq: new ObjectId(productId),
          },
          rating: {
            $not: {
              $size: 0,
            },
          },
        },
      },
      {
        $unwind: '$rating',
      },
      {
        $group: {
          _id: '$rating',
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    let ratingReview = [
      {
        rating: 5,
        sum: 0,
      },
      {
        rating: 4,
        sum: 0,
      },
      {
        rating: 3,
        sum: 0,
      },
      {
        rating: 2,
        sum: 0,
      },
      {
        rating: 1,
        sum: 0,
      },
    ];

    for (let i = 0; i < ratingReview.length; i++) {
      for (let j = 0; j < getRating.length; j++) {
        if (ratingReview[i].rating === getRating[j]._id) {
          ratingReview[i].sum = getRating[j].count;
          break;
        }
      }
    }

    const getAll = await Review.find({
      productId,
    });
    const reviews = await Review.find({
      productId,
    })
      .skip(skipPage)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
        totalReview: getAll.length,
        ratingReview,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.getAllAdminProducts = catchAsync(async (req, res, next) => {
  const allProducts = await Product.find({});
  const productCount = await Product.find({}).countDocuments();

  res.status(200).json({
    status: 'success',
    data: {
      allProducts,
      productCount,
    },
  });
});
