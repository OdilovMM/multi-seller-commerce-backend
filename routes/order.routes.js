const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect } = require('../middleware/auth-check.middleware');
const authorize = require('../middleware/role-check.middleware');
const logger = require('../utils/logger');

// ========================================
// Logger - route file load
// ========================================
logger.info('[order.routes.js] Order routes loaded');

// ========================================
// CUSTOMER ROUTES
// ========================================
router.post('/customer/orders', protect, authorize('CUSTOMER'), orderController.placeNewOrder);

router.get(
	'/customer/orders/:userId',
	protect,
	authorize('CUSTOMER'),
	orderController.getAllOrdersByStatus,
);

router.get(
	'/customer/orders/detail/:orderId',
	protect,
	authorize('CUSTOMER'),
	orderController.getOrderDetail,
);

router.post(
	'/customer/orders/payment',
	protect,
	authorize('CUSTOMER'),
	orderController.customerOrderMake,
);

router.get(
	'/customer/orders/:orderId/confirm',
	protect,
	authorize('CUSTOMER'),
	orderController.orderConfirm,
);

router.get(
	'/customer/dashboard/:userId',
	protect,
	authorize('CUSTOMER'),
	orderController.getCustomerDashboardData,
);

// ========================================
// SELLER ROUTES
// ========================================
router.get(
	'/seller/orders/:sellerId',
	protect,
	authorize('VENDOR'),
	orderController.getSellerOrders,
);

router.get(
	'/seller/orders/detail/:orderId',
	protect,
	authorize('VENDOR'),
	orderController.getSellerSingleOrderDetail,
);

router.patch(
	'/seller/orders/:orderId/status',
	protect,
	authorize('VENDOR'),
	orderController.sellerOrderUpdateStatus,
);

// ========================================
// ADMIN ROUTES
// ========================================
router.get('/admin/orders', protect, authorize('ADMIN'), orderController.getAdminOrders);

router.get(
	'/admin/orders/detail/:orderId',
	protect,
	authorize('ADMIN'),
	orderController.getSingleOrderDetail,
);

router.patch(
	'/admin/orders/:orderId/status',
	protect,
	authorize('ADMIN'),
	orderController.adminOrderUpdateStatus,
);

module.exports = router;
