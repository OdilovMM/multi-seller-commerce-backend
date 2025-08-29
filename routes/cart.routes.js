const express = require('express');
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth-check.middleware');
const authorize = require('../middleware/role-check.middleware');
const logger = require('../utils/logger');
const router = express.Router();

logger.info('[cart.routes.js] Cart route is working');

router.use(protect);

router.post('/add', authorize('CUSTOMER'), cartController.addProductToCart);
router.get('/me', authorize('CUSTOMER'), cartController.getUserCart);
router.delete('/remove/:productId', authorize('CUSTOMER'), cartController.removeProductFromCart);

module.exports = router;
