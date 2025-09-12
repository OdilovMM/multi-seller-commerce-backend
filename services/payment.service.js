const SellerWallet = require('../models/seller-wallet.model');
const Payment = require('../models/payment.model');
const Seller = require('../models/user.model');
const WithDrawal = require('../models/withdrawal-req.model');
const { ObjectId } = require('mongoose').Types;
const { v4: uuidv4 } = require('uuid');
const stripe = require('stripe')(process.env.SECRET_KEY_STRIPE);

class PaymentService {
	constructor() {}

	static sumAmount(data) {
		return data.reduce((acc, item) => acc + item.amount, 0);
	}

	async createStripeAccount(sellerId) {
		const uniqueId = uuidv4();
		try {
			let paymentInfo = await Payment.findOne({ sellerId });
			if (paymentInfo) await Payment.deleteOne({ sellerId });

			const account = await stripe.accounts.create({ type: 'express' });
			const accountLink = await stripe.accountLinks.create({
				account: account.id,
				refresh_url: `${process.env.CLIENT_URL}/refresh`,
				return_url: `${process.env.CLIENT_URL}/success?activeCode=${uniqueId}`,
				type: 'account_onboarding',
			});

			await Payment.create({
				sellerId,
				stripeId: account.id,
				code: uniqueId,
			});

			return accountLink.url;
		} catch (error) {
			console.log(error);
		}
	}

	async activateStripeAccount(userId, activeCode) {
		try {
			const userStripeInfo = await Payment.findOne({ code: activeCode });
			if (!userStripeInfo) return null;

			await Seller.findByIdAndUpdate(userId, { payment: 'active' });
			return true;
		} catch (error) {
			console.log(error);
		}
	}

	async getSellerPaymentDetails(sellerId) {
		try {
			const payments = await SellerWallet.find({ sellerId });
			const pendingWithdraws = await WithDrawal.find({ sellerId, status: 'pending' });
			const successWithdraws = await WithDrawal.find({ sellerId, status: 'success' });

			const totalAmount = PaymentService.sumAmount(payments);
			const pendingAmount = PaymentService.sumAmount(pendingWithdraws);
			const withdrawAmount = PaymentService.sumAmount(successWithdraws);
			const availableAmount = Math.max(totalAmount - (pendingAmount + withdrawAmount), 0);

			return {
				totalAmount,
				pendingAmount,
				withdrawAmount,
				availableAmount,
				pendingWithdraws,
				successWithdraws,
			};
		} catch (error) {
			console.log(error);
		}
	}

	async createWithdrawalRequest(sellerId, amount) {
		try {
			const withdrawal = await WithDrawal.create({
				sellerId,
				amount: parseInt(amount),
			});
			return withdrawal;
		} catch (error) {
			console.log(error);
		}
	}

	async getPendingAdminRequests() {
		try {
			return await WithDrawal.find({ status: 'pending' });
		} catch (error) {
			console.log(error);
		}
	}

	async adminConfirmWithdrawal(paymentId) {
		try {
			const payment = await WithDrawal.findById(paymentId);
			if (!payment) return null;

			const sellerPayment = await Payment.findOne({ sellerId: new ObjectId(payment.sellerId) });

			await stripe.transfers.create({
				amount: payment.amount * 100,
				currency: 'usd',
				destination: sellerPayment.stripeId,
			});

			await WithDrawal.findByIdAndUpdate(paymentId, { status: 'success' });

			return payment;
		} catch (error) {
			console.log(error);
		}
	}
}

module.exports = new PaymentService();
