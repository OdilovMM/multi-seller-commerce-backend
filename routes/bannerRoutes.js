const express = require('express');
const bannerController = require('./../controllers/bannerController');
const router = express.Router();

router.get('/get-all-banners', bannerController.getAllBanners);
router.post('/add-banner', bannerController.addBanner);
router.get('/get-banner/:productId', bannerController.getBanner);
router.patch('/get-banner/:productId', bannerController.updateBanner);

module.exports = router;
