const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
// dashboard related
const CustomerOrders = require("../models/customerOrderModel");
const MyWallet = require("../models/myWalletModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
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

  res.cookie("adminToken", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    return next(new AppError("Admin Already exist!", 403));
  }
  if (!email || !password || !firstName || !lastName) {
    return next(new AppError("Please provide all credentials", 404));
  }

  const newUser = await Admin.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const existAdmin = await Admin.findOne({ email });
  
  if (!existAdmin) {
    return next(new AppError("There is no account with this email", 400));
  }

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await Admin.findOne({ email }).select("+password");

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
  const currentUser = await Admin.findById(decoded.id);
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

exports.logout = (req, res) => {
  res.cookie("adminToken", null, {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "Logging out...",
  });
};

exports.getMeAdmin = catchAsync(async (req, res, next) => {
  const { _id } = req.user;

  const admin = await Admin.findById(_id);
  res.status(200).json({
    status: "success",
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
          $sum: "$amount",
        },
      },
    },
  ]);
  const totalOrders = await CustomerOrders.find({}).countDocuments();

  res.status(200).json({
    status: "success",
    data: {
      totalSales: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
      totalOrders,
    },
  });
});
