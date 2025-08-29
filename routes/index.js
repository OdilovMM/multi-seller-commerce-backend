const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/categories', require('./category.routes'));
router.use('/products', require('./product.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/banner', require('./banner.routes'));
router.use('/customer', require('./customer.routes'));
router.use('/vendor', require('./seller.routes'));
router.use('/cart', require('./cart.routes'));
router.use('/order', require('./order.routes'));
router.use('/payment', require('./payment.routes'));

module.exports = router;
