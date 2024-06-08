const express = require("express");
const paymentController = require("../controllers/paymentController");
const sellerController = require("../controllers/sellerController");
const authAdminController = require("../controllers/authAdminController");
const router = express.Router();

router.get(
  "/create-seller-stripe-account",
  sellerController.protect,
  sellerController.restrictTo("seller"),
  paymentController.createSellerStripeAccount
);

router.patch(
  "/activate-seller-stripe-account/:activeCode",
  sellerController.protect,
  sellerController.restrictTo("seller"),
  paymentController.activateAccount
);

router.get(
  "/get-seller-payment-details/:sellerId",
  sellerController.protect,
  paymentController.getSellerPaymentDetails
);

router.post(
  "/send-withdrawal-request",
  sellerController.protect,
  paymentController.paymentRequest
);

// admin related payments operations

router.get(
  "/get-admin-payment-request",
  authAdminController.protect,
  paymentController.getAdminPaymentRequest
);

router.put(
  "/admin-confirm-payment-request",
  authAdminController.protect,
  paymentController.adminConfirmPaymentRequest
);
module.exports = router;
