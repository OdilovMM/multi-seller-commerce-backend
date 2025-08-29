const OrderService = require('../services/order.service');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

exports.placeNewOrder = asyncErrorHandler(async (req, res) => {
	const order = await OrderService.placeOrder(req.body);
	res.status(201).json({ status: 'success', data: { orderId: order._id } });
});

exports.getAllOrdersByStatus = asyncErrorHandler(async (req, res) => {
	const { userId, status } = req.params;
	const orders = await OrderService.getOrdersByStatus(userId, status);
	res.status(200).json({ status: 'success', data: { orders } });
});

exports.getOrderDetail = asyncErrorHandler(async (req, res) => {
	const order = await OrderService.getOrderDetail(req.params.orderId);
	res.status(200).json({ status: 'success', data: { order } });
});

exports.customerOrderMake = asyncErrorHandler(async (req, res) => {
	const clientSecret = await OrderService.createPayment(req.body.price);
	res.status(201).json({ status: 'success', clientSecret });
});

exports.orderConfirm = asyncErrorHandler(async (req, res) => {
	await OrderService.confirmOrder(req.params.orderId);
	res.status(200).json({ status: 'success' });
});

exports.getCustomerDashboardData = asyncErrorHandler(async (req, res) => {
	const data = await OrderService.getCustomerDashboard(req.params.userId);
	res.status(200).json({ status: 'success', data });
});

// Seller
exports.getSellerOrders = asyncErrorHandler(async (req, res) => {
	const { sellerId } = req.params;
	const page = parseInt(req.query.page) || 1;
	const perPage = parseInt(req.query.perPage) || 10;
	const data = await OrderService.getSellerOrders(sellerId, page, perPage);
	res.status(200).json({ status: 'success', data });
});

exports.getSellerSingleOrderDetail = asyncErrorHandler(async (req, res) => {
	const order = await OrderService.getSellerOrderDetail(req.params.orderId);
	res.status(200).json({ status: 'success', data: { order } });
});

exports.sellerOrderUpdateStatus = asyncErrorHandler(async (req, res) => {
	await OrderService.updateSellerOrderStatus(req.params.orderId, req.body.status);
	res.status(200).json({ status: 'Order Updated' });
});

// Admin
exports.getAdminOrders = asyncErrorHandler(async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const perPage = parseInt(req.query.perPage) || 10;
	const data = await OrderService.getAdminOrders(page, perPage);
	res.status(200).json({ status: 'success', data });
});

exports.getSingleOrderDetail = asyncErrorHandler(async (req, res) => {
	const order = await OrderService.getAdminOrderDetail(req.params.orderId);
	res.status(200).json({ status: 'success', data: { order } });
});

exports.adminOrderUpdateStatus = asyncErrorHandler(async (req, res) => {
	await OrderService.updateAdminOrderStatus(req.params.orderId, req.body.status);
	res.status(200).json({ status: 'Order Updated' });
});
