const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel');
const Seller = require('../models/sellerModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { ObjectId } = require('mongoose').Types;

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'development') cookieOptions.secure = true;

  res.cookie('userToken', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.userRegister = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const existingCustomer = await Customer.findOne({
    email,
  });

  if (existingCustomer) {
    return next(new AppError('User Already exist!', 403));
  }
  if (!email || !password || !firstName || !lastName) {
    return next(new AppError('Please provide all credentials', 404));
  }

  const newSeller = await Customer.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  createSendToken(newSeller, 201, res);
});

exports.userLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const existUser = await Customer.findOne({
    email,
  });
  if (!existUser) {
    return next(new AppError('There is no account with this email', 400));
  }

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await Customer.findOne({
    email,
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Login First', 401));
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await Customer.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

exports.userLogout = (req, res) => {
  res.cookie('userToken', null, {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'Logging out...',
  });
};

exports.getMe = catchAsync(async (req, res) => {
  const userInfo = await Customer.findById(req.user.id).populate({
    path: 'wishlists',
  });

  res.status(200).json({
    status: 'success',
    data: {
      userInfo,
    },
  });
});

exports.getMyWishlist = catchAsync(async (req, res) => {
  const wishlistArray = await Wishlist.find({
    userId: new ObjectId(req.user.id),
  }).populate({
    path: 'wishlists',
    options: {
      strictPopulate: false,
    },
  });

  const wishlistArrayCount = await Wishlist.find({
    userId: new ObjectId(req.user.id),
  })
    .populate({
      path: 'wishlists',
      options: {
        strictPopulate: false,
      },
    })
    .countDocuments();

  res.status(200).json({
    status: 'success',
    data: {
      wishlistArray,
      wishlistArrayCount,
    },
  });
});

exports.getCustomerCart = catchAsync(async (req, res) => {
  const co = 5;
  try {
    const cardProducts = await Cart.aggregate([
      {
        $match: {
          userId: {
            $eq: new ObjectId(req.user.id),
          },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'products',
        },
      },
    ]);
    let buyProductItem = 0;
    let calculatePrice = 0;
    let cardProductCount = 0;
    const outOfStockProduct = cardProducts.filter(
      (p) => p.products[0].stock < p.quantity,
    );
    for (let i = 0; i < outOfStockProduct.length; i++) {
      cardProductCount = cardProductCount + outOfStockProduct[i].quantity;
    }
    const stockProduct = cardProducts.filter(
      (p) => p.products[0].stock >= p.quantity,
    );
    for (let i = 0; i < stockProduct.length; i++) {
      const { quantity } = stockProduct[i];
      cardProductCount = buyProductItem + quantity;

      buyProductItem = buyProductItem + quantity;
      const { price, discount } = stockProduct[i].products[0];
      if (discount !== 0) {
        calculatePrice =
          calculatePrice +
          quantity * (price - Math.floor((price * discount) / 100));
      } else {
        calculatePrice = calculatePrice + quantity * price;
      }
    }
    let p = [];
    let unique = [
      ...new Set(stockProduct.map((p) => p.products[0].sellerId.toString())),
    ];
    for (let i = 0; i < unique.length; i++) {
      let price = 0;
      for (let j = 0; j < stockProduct.length; j++) {
        const tempProduct = stockProduct[j].products[0];
        if (unique[i] === tempProduct.sellerId.toString()) {
          let pri = 0;
          if (tempProduct.discount !== 0) {
            pri =
              tempProduct.price -
              Math.floor((tempProduct.price * tempProduct.discount) / 100);
          } else {
            pri = tempProduct.price;
          }
          pri = pri - Math.floor((pri * co) / 100);
          price = price + pri * stockProduct[j].quantity;
          p[i] = {
            sellerId: unique[i],
            shopName: tempProduct.shopName,
            price,
            products: p[i]
              ? [
                  ...p[i].products,
                  {
                    _id: stockProduct[j]._id,
                    quantity: stockProduct[j].quantity,
                    productInfo: tempProduct,
                  },
                ]
              : [
                  {
                    _id: stockProduct[j]._id,
                    quantity: stockProduct[j].quantity,
                    productInfo: tempProduct,
                  },
                ],
          };
        }
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        cardProducts: p,
        price: calculatePrice,
        cardProductCount,
        shippingFee: 20 * p.length,
        outOfStockProduct,
        buyProductItem,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.addRemoveWishList = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  const { id } = req.user;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError('product not found', 404));
  }

  try {
    const savedWishlist = await Wishlist.findOne({
      $and: [
        {
          productId: {
            $eq: productId,
          },
        },
        {
          userId: {
            $eq: id,
          },
        },
      ],
    });

    if (savedWishlist) {
      await Wishlist.findByIdAndDelete(savedWishlist._id);

      res.status(200).json({
        status: 'Removed',
        data: {
          savedWishlist,
          isSaved: !savedWishlist ? true : false,
        },
      });
    } else {
      const savedWishlist = await Wishlist.create({
        userId: id,
        productId: productId,
      });
      res.status(201).json({
        status: 'Added',
        data: {
          savedWishlist,
          isSaved: savedWishlist ? true : false,
        },
      });
    }
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.addRemoveCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { id } = req.user;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError('product not found', 404));
  }

  try {
    const savedCart = await Cart.findOne({
      $and: [
        {
          productId: {
            $eq: productId,
          },
        },
        {
          userId: {
            $eq: id,
          },
        },
      ],
    });

    if (savedCart) {
      await Cart.findByIdAndDelete(savedCart._id);

      res.status(200).json({
        status: 'Removed',
        data: {
          savedCart,
          isSaved: !savedCart ? true : false,
        },
      });
    } else {
      const savedCart = await Cart.create({
        userId: id,
        productId: productId,
        quantity,
      });
      res.status(201).json({
        status: 'Added',
        data: {
          savedCart,
          isSaved: savedCart ? true : false,
        },
      });
    }
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.incrementProductInCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user._id;

  const cartItem = await Cart.findOne({
    userId,
    productId,
  });

  if (!cartItem) {
    return next(new AppError(error.message, 404));
  }
  cartItem.quantity += 1;
  await cartItem.save();

  res.status(200).json({
    status: 'success',
    data: {
      cartItem,
    },
  });
});

exports.decrementProductInCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user._id;

  const cartItem = await Cart.findOne({
    userId,
    productId,
  });
  if (!cartItem) {
    return next(new AppError(error.message, 404));
  }

  if (cartItem.quantity <= 1) {
    return next(new AppError('Quantity can not be less than 1', 400));
  }

  cartItem.quantity -= 1;
  await cartItem.save();

  res.status(200).json({
    status: 'success',
    data: {
      cartItem,
    },
  });
});

exports.getAllCustomers = catchAsync(async (req, res, next) => {
  const customers = await Customer.find({});
  const countCustomer = await Customer.find({}).countDocuments();
  const countSeller = await Seller.find({}).countDocuments();
  const countCategory = await Category.find({}).countDocuments();

  res.status(200).json({
    status: 'success',
    data: {
      customers,
      countCustomer,
      countSeller,
      countCategory,
    },
  });
});
