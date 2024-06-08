const Cart = require("./../models/cartModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const formidable = require("formidable");
const cloudinary = require("cloudinary").v2;

exports.addProductToCart = catchAsync(async (req, res, next) => {
  const { userId, productId, quantity } = req.body;
  try {
    const product = await Cart.findOne({
      $and: [
        {
          productId: {
            $eq: productId,
          },
        },
        {
          userId: {
            $eq: userId,
          },
        },
      ],
    });

    if (product) {
      return next(new AppError("Already Added To Card", 404));
    } else {
      const product = await Cart.create({
        userId,
        productId,
        quantity,
      });
      res.status(statusCode).json({
        status: "Product Added",
        token,
        data: {
          product,
        },
      });
    }
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});
exports.getAllCartProducts = catchAsync(async (req, res, next) => {});
exports.deleteProductFromCart = catchAsync(async (req, res, next) => {});
