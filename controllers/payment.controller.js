const PaymentService = require('../services/payment.service');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { NotFoundError } = require('../errors');

exports.createSellerStripeAccount = asyncErrorHandler(async (req, res, next) => {
	const url = await PaymentService.createStripeAccount(req.user.id);
	res.status(201).json({ status: 'success', url });
});

exports.activateAccount = asyncErrorHandler(async (req, res, next) => {
	const activated = await PaymentService.activateStripeAccount(req.user.id, req.params.activeCode);
	if (!activated) return next(new NotFoundError('Activation code not found'));
	res.status(200).json({ status: 'Payment Activated' });
});

exports.getSellerPaymentDetails = asyncErrorHandler(async (req, res, next) => {
	const data = await PaymentService.getSellerPaymentDetails(req.params.sellerId);
	res.status(200).json({ status: 'success', data });
});

exports.paymentRequest = asyncErrorHandler(async (req, res, next) => {
	const withdrawal = await PaymentService.createWithdrawalRequest(req.user.id, req.body.amount);
	res.status(201).json({ status: 'Withdrawal request created', data: withdrawal });
});

exports.getAdminPaymentRequest = asyncErrorHandler(async (req, res, next) => {
	const requests = await PaymentService.getPendingAdminRequests();
	res.status(200).json({ status: 'success', data: requests });
});

exports.adminConfirmPaymentRequest = asyncErrorHandler(async (req, res, next) => {
	const payment = await PaymentService.adminConfirmWithdrawal(req.body.paymentId);
	if (!payment) return next(new NotFoundError('Payment not found'));
	res.status(200).json({ status: 'Payment Confirmed', data: payment });
});
