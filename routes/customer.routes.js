const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth-check.middleware');
const authorize = require('../middleware/role-check.middleware');
const logger = require('../utils/logger');

logger.info('[customer.routes.js] Customer route is working');

// Protected user routes
router.use(protect, authorize('user'));

router.get('/me', customerController.getMe);
router.get('/wishlist', customerController.getMyWishlist);
router.get('/cart', customerController.getCustomerCart);

router.post('/wishlist', customerController.addRemoveWishList);
router.post('/cart', customerController.addRemoveCart);

router.patch('/cart/increment/:productId', customerController.incrementProductInCart);
router.patch('/cart/decrement/:productId', customerController.decrementProductInCart);

// Admin route
router.get('/admin/customers', authorize('admin'), customerController.getAllCustomers);

module.exports = router;
