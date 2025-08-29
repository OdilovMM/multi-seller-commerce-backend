const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth-check.middleware');
const authorize = require('../middleware/role-check.middleware');
const logger = require('../utils/logger');
logger.info('[payment.routes.js] Payment routes loaded');
router.use(protect);

// Seller routes
router.post(
	'/seller/create-stripe-account',
	authorize('seller'),
	PaymentController.createSellerStripeAccount,
);

router.patch(
	'/seller/activate-stripe/:activeCode',
	authorize('seller'),
	PaymentController.activateAccount,
);

router.get(
	'/seller/payment-details/:sellerId',
	authorize('seller'),
	PaymentController.getSellerPaymentDetails,
);

router.post('/seller/withdrawal-request', authorize('seller'), PaymentController.paymentRequest);

// Admin routes
router.get(
	'/admin/pending-withdrawals',
	authorize('admin'),
	PaymentController.getAdminPaymentRequest,
);

router.patch(
	'/admin/confirm-withdrawal',
	authorize('admin'),
	PaymentController.adminConfirmPaymentRequest,
);

module.exports = router;
