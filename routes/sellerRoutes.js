const express = require('express');
const authAdminController = require('./../controllers/authAdminController');
const sellerController = require('./../controllers/sellerController');

const router = express.Router();

router.post('/seller-register', sellerController.sellerRegister);
router.post('/seller-login', sellerController.sellerLogin);
router.get(
  '/seller-logout',
  sellerController.protect,
  sellerController.sellerLogout,
);
router.post(
  '/seller-profile-image',
  sellerController.protect,
  sellerController.restrictTo('seller'),
  sellerController.uploadSellerProfileImage,
);

router.post(
  '/seller-add-address',
  sellerController.protect,
  sellerController.restrictTo('seller'),
  sellerController.addSellerAddress,
);

router.get(
  '/seller-activate-request',
  authAdminController.protect,
  authAdminController.restrictTo('admin'),
  sellerController.getSellerRequestToActive,
);
router.get(
  '/get-active-sellers',
  authAdminController.protect,
  authAdminController.restrictTo('admin'),
  sellerController.getActiveSellers,
);

router.get(
  '/get-de-active-sellers',
  authAdminController.protect,
  authAdminController.restrictTo('admin'),
  sellerController.getDeActiveSellers,
);

router.patch(
  '/update-seller-status',
  authAdminController.protect,
  authAdminController.restrictTo('admin'),
  sellerController.updateSellerStatus,
);
router.get(
  '/get-me-detail',
  sellerController.protect,
  sellerController.restrictTo('seller'),
  sellerController.getMeSeller,
);

router.get('/get-seller-detail/:sellerId', sellerController.getSellerDetail);

router.patch(
  '/upload-seller-profile-image',
  sellerController.protect,
  sellerController.uploadSellerProfilePhoto,
);

router.get(
  '/get-seller-dashboard-info',
  sellerController.protect,
  sellerController.getSellerDashboardInfo,
);

// router.get("/logout", authController.logout);

module.exports = router;
