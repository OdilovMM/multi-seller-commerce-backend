const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/categories', require('./category.routes'));
// router.use('/admin', require('./admin.routes'));
// router.use('/vendor', require('./sellerRoutes'));
// router.use('/customer', require('./customerRoutes'));
// router.use('/product', require('./productRoutes'));
// router.use('/order', require('./orderRoutes'));
// router.use('/payment', require('./payment.routes'));
// router.use('/banner', require('./banner.routes'));

module.exports = router;
