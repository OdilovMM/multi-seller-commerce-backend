const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/seller.controller');
const { protect } = require('../middleware/auth-check.middleware');
const authorize = require('../middleware/role-check.middleware');
const logger = require('../utils/logger');
const validateRequest = require('../middleware/validate.middleware');
const { updateSellerStatusSchema, addAddressSchema } = require('../validations/seller.validator');
logger.info('[seller.routes.js] SELLER route is working');

// Seller protected routes
router.use(protect, authorize('VENDOR'));

router.post('/profile-image', sellerController.uploadProfileImage);
router.patch('/address', validateRequest(addAddressSchema), sellerController.addAddress);
router.get('/me', sellerController.getMe);
router.get('/dashboard', sellerController.getDashboardInfo);

// Admin routes
router.use(protect, authorize('ADMIN'));
router.get('/activate-request', sellerController.getSellersByStatus);
router.get('/active', sellerController.getSellersByStatus);
router.get('/deactive', sellerController.getSellersByStatus);
router.patch(
	'/status',
	validateRequest(updateSellerStatusSchema),
	sellerController.updateSellerStatus,
);
router.get('/:sellerId', sellerController.getSellerById);

module.exports = router;
