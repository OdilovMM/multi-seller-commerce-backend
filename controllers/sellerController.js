const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Seller = require("../models/sellerModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { ObjectId } = require("mongoose").Types;

// dashboard related
const SellerWallet = require("../models/sellerWalletModel");
const Product = require("../models/productModel");
const AuthOrder = require("../models/authOrderModel");

const cloudinary = require("cloudinary").v2;
const formidable = require("formidable");
const chalk = require("chalk");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "development") cookieOptions.secure = true;

  res.cookie("sellerToken", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.sellerRegister = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const existingSeller = await Seller.findOne({ email });

  if (existingSeller) {
    return next(new AppError("Seller Already exist!", 403));
  }
  if (!email || !password || !firstName || !lastName) {
    return next(new AppError("Please provide all credentials", 404));
  }

  const newSeller = await Seller.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    method: "manual",
    shopInfo: {},
  });

  createSendToken(newSeller, 201, res);
});

exports.sellerLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const existSeller = await Seller.findOne({ email });
  if (!existSeller) {
    return next(new AppError("There is no account with this email", 400));
  }

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await Seller.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }


  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await Seller.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
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
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.sellerLogout = (req, res) => {
  res.cookie("sellerToken", null, {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "Logging out...",
  });
};

exports.uploadSellerProfileImage = catchAsync(async (req, res, next) => {
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
        folder: "profile",
      });

      if (result) {
        await Seller.findByIdAndUpdate(id, { image: result.url });
        const userInfo = await Seller.findById(id);
        res.status(200).json({
          status: "Image Uploaded",
          data: {
            userInfo,
          },
        });
      } else {
        return next(new AppError("Invalid Image", 400));
      }
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  });
});

exports.getSellerDetail = catchAsync(async (req, res, next) => {
  const { sellerId } = req.params;

  const seller = await Seller.findById(sellerId);
  res.status(200).json({
    status: "success",
    data: {
      seller,
    },
  });
});

exports.addSellerAddress = catchAsync(async (req, res, next) => {
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
      status: "User information updated",
      data: {
        sellerInfo,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.getSellerRequestToActive = catchAsync(async (req, res, next) => {
  const { page, search, parPage } = req.query;
  const skipPage = parseInt(parPage) * (parseInt(page) - 1);

  try {
    if (search) {
    } else {
      const sellers = await Seller.find({ status: "pending" })
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });

      const totalSellers = await Seller.find({
        status: "pending",
      }).countDocuments();
      res.status(200).json({
        status: "success",
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

exports.getMeSeller = catchAsync(async (req, res, next) => {
  const { _id } = req.user;

  const seller = await Seller.findById(_id);
  res.status(200).json({
    status: "success",
    data: {
      seller,
    },
  });
});

exports.updateSellerStatus = catchAsync(async (req, res, next) => {
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

exports.getActiveSellers = catchAsync(async (req, res, next) => {
  let { page, search, parPage } = req.query;
  page = parseInt(page);
  parPage = parseInt(parPage);
  const skipPage = parPage * (page - 1);
  try {
    if (search) {
      const sellers = await Seller.find({
        $text: { $search: search },
        status: "active",
      })
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });
      const totalSellers = await Seller.find({
        $text: { $search: search },
        status: "active",
      }).countDocuments();

      res.status(200).json({
        status: "success",
        data: {
          totalSellers,
          sellers,
        },
      });
    } else {
      const sellers = await Seller.find({
        status: "active",
      })
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });

      const totalSellers = await Seller.find({
        status: "active",
      }).countDocuments();

      res.status(200).json({
        status: "success",
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

exports.getDeActiveSellers = catchAsync(async (req, res, next) => {
  let { page, search, parPage } = req.query;
  page = parseInt(page);
  parPage = parseInt(parPage);
  const skipPage = parPage * (page - 1);
  try {
    if (search) {
      const deactiveSellers = await Seller.find({
        $text: { $search: search },
        status: "deactive",
      })
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });

      const totalDeactives = await Seller.find({
        $text: { $search: search },
        status: "deactive",
      }).countDocuments();
      res.status(200).json({
        status: "success",
        data: {
          totalDeactives,
          deactiveSellers,
        },
      });
    } else {
      const deactiveSellers = await Seller.find({
        status: "deactive",
      })
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });

      const totalDeactives = await Seller.find({
        status: "deactive",
      }).countDocuments();

      res.status(200).json({
        status: "success",
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

exports.uploadSellerProfilePhoto = catchAsync(async (req, res, next) => {
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
        folder: "profile",
      });

      if (result) {
        await Seller.findByIdAndUpdate(id, { image: result.url });
        const userInfo = await Seller.findById(id);

        res.status(200).json({
          status: "success",
          data: {
            userInfo,
          },
        });
      } else {
        return next(new AppError("Image upload failed", 400));
      }
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  });
});

exports.getSellerDashboardInfo = catchAsync(async (req, res, next) => {
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
            $sum: "$amount",
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
            $eq: "pending",
          },
        },
      ],
    }).countDocuments();

    const recentOrders = await AuthOrder.find({
      sellerId: new ObjectId(req.user.id),
    }).limit(3);

    res.status(200).json({
      status: "success",
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
