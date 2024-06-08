const SellerWallet = require("../models/sellerWalletModel");
const Payment = require("../models/paymentModel");
const Seller = require("../models/sellerModel");
const WithDrawal = require("../models/withdrawalReqModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { ObjectId } = require("mongoose").Types;
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const sellerUrl = "http://localhost:5174";
const stripe = require("stripe")(process.env.SECRET_KEY_STRIPE);

const sumAmount = (data) => {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum = sum + data[i].amount;
  }
  return sum;
};

exports.createSellerStripeAccount = catchAsync(async (req, res, next) => {
  const uniqueId = uuidv4();
  try {
    const paymentInfo = await Payment.findOne({ sellerId: req.user.id });
    if (paymentInfo) {
      await Payment.deleteOne({ sellerId: req.user.id });
      const account = await stripe.accounts.create({ type: "express" });
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `http://localhost:5174/refresh`,
        return_url: `http://localhost:5174/success?activeCode=${uniqueId}`,
        type: "account_onboarding",
      });
      await Payment.create({
        sellerId: req.user.id,
        stripeId: account.id,
        code: uniqueId,
      });

      res.status(201).json({
        url: accountLink.url,
      });
    } else {
      const account = await stripe.accounts.create({ type: "express" });
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `http://localhost:5174/refresh`,
        return_url: `http://localhost:5174/success?activeCode=${uniqueId}`,
        type: "account_onboarding",
      });
      await Payment.create({
        sellerId: req.user.id,
        stripeId: account.id,
        code: uniqueId,
      });

      res.status(201).json({
        url: accountLink.url,
      });
    }
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.activateAccount = catchAsync(async (req, res, next) => {
  const { activeCode } = req.params;

  try {
    const userStripeInfo = await Payment.findOne({ code: activeCode });
    if (userStripeInfo) {
      await Seller.findByIdAndUpdate(req.user.id, {
        payment: "active",
      });
      res.status(201).json({
        status: "Payment Activated",
      });
    } else {
      return next(new AppError(error.message, 400));
    }
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.getSellerPaymentDetails = catchAsync(async (req, res, next) => {
  const { sellerId } = req.params;

  try {
    const payments = await SellerWallet.find({ sellerId });
    const pendingWithdraws = await WithDrawal.find({
      $and: [
        {
          sellerId: {
            $eq: sellerId,
          },
        },
        {
          status: {
            $eq: "pending",
          },
        },
      ],
    });

    const successWithdraws = await WithDrawal.find({
      $and: [
        {
          sellerId: {
            $eq: sellerId,
          },
        },
        {
          status: {
            $eq: "success",
          },
        },
      ],
    });

    const pendingAmount = sumAmount(pendingWithdraws);
    const withdrawAmount = sumAmount(successWithdraws);
    const totalAmount = sumAmount(payments);

    let availableAmount = 0;

    if (totalAmount > 0) {
      availableAmount = totalAmount - (pendingAmount + withdrawAmount);
    }
    res.status(201).json({
      status: "Payment Activated",
      data: {
        totalAmount,
        pendingAmount,
        withdrawAmount,
        availableAmount,
        pendingWithdraws,
        successWithdraws,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.paymentRequest = catchAsync(async (req, res) => {
  const { amount, sellerId } = req.body;

  try {
    const withdrawal = await WithDrawal.create({
      sellerId,
      amount: parseInt(amount),
    });

    res.status(201).json({
      status: "Successfully withdrawal",
      data: {
        withdrawal,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.getAdminPaymentRequest = catchAsync(async (req, res, next) => {
  try {
    const withdrawalRequest = await WithDrawal.find({
      status: "pending",
    });
    res.status(201).json({
      status: "Successfully withdrawal",
      data: {
        withdrawalRequest,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.adminConfirmPaymentRequest = catchAsync(async (req, res, next) => {
  const { paymentId } = req.body;

  try {
    const payment = await WithDrawal.findById(paymentId);
    const { stripeId } = await Payment.findOne({
      sellerId: new ObjectId(payment.sellerId),
    });

    await stripe.transfers.create({
      amount: payment.amount * 100,
      currency: "usd",
      destination: stripeId,
    });

    await WithDrawal.findByIdAndUpdate(paymentId, {
      status: "success",
    });
    res.status(201).json({
      status: "Payment Confirmed",
      data: {
        payment,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});
