const express = require("express");
const orderController = require("./../controllers/orderController");
const router = express.Router();

// Customer Related Orders

router.post("/place-order", orderController.placeNewOrder);
router.get("/get-orders/:userId/:status", orderController.getAllOrdersByStatus);
router.get("/get-order-detail/:orderId", orderController.getOrderDetail);
router.post("/create-payment", orderController.customerOrderMake);
router.get("/confirm/:orderId", orderController.orderConfirm);
router.get(
  "/get-dashboard-data/:userId",
  orderController.getCustomerDashboardData
);

// Seller related orders
router.get("/get-seller-order/:sellerId", orderController.getSellerOrders);
router.get(
  "/get-seller-single-order-detail/:orderId",
  orderController.getSellerSingleOrderDetail
);
router.patch(
  "/seller-update-order-status/:orderId",
  orderController.sellerOrderUpdateStatus
);

// Admin Related Orders
router.get("/get-admin-order", orderController.getAdminOrders);
router.get(
  "/get-admin-single-order-detail/:orderId",
  orderController.getSingleOrderDetail
);
router.patch(
  "/admin-update-order-status/:orderId",
  orderController.adminOrderUpdateStatus
);

module.exports = router;
