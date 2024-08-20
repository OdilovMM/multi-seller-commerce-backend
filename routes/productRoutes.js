const express = require('express');
const sellerController = require('../controllers/sellerController');
const productController = require('./../controllers/productController');
const customerController = require('./../controllers/customerController');
const authAdminController = require('./../controllers/authAdminController');
const router = express.Router();

router.post(
  '/add-product',
  sellerController.protect,
  sellerController.restrictTo('seller'),
  productController.addProduct,
);

router.get('/get-product-detail/:slug', productController.getSingleProduct);
router.get(
  '/get-product-detail-to-admin/:productId',
  productController.getSingleProductToAdmin,
);

router.get(
  '/get-product-to-edit/:productId',
  productController.getProductToEdit,
);

router.delete(
  '/delete-product/:productId',
  sellerController.protect,
  sellerController.restrictTo('seller'),
  productController.deleteProduct,
);

router.patch(
  '/update-product',
  sellerController.protect,
  sellerController.restrictTo('seller'),
  productController.updateProduct,
);

router.patch(
  '/update-product-image',
  sellerController.protect,
  sellerController.restrictTo('seller'),
  productController.updateProductImage,
);

router.post(
  '/add-product-review/:productId',
  productController.addProductReview,
);

router.get(
  '/get-product-review/:productId',
  productController.getAllProductReviews,
);

router.get(
  '/get-products-by-price-range',
  productController.getProductsByPriceRange,
);

router.get('/get-home-products', productController.getHomeProducts);

router.get('/product-query', productController.getProductQuery);

router.get(
  '/get-all-my-products',
  sellerController.protect,
  sellerController.restrictTo('seller'),
  productController.getAllMyProductsSeller,
);

router.get('/get-all-admin-products', productController.getAllAdminProducts);

router.get('/:type', productController.getProductsByType);

router.post(
  '/add-customer-product-review',
  customerController.protect,
  customerController.restrictTo('user'),
  productController.addProductReview,
);

router.get('/get-all-reviews/:productId', productController.getAllReviews);

module.exports = router;
