const express = require('express');
const authAdminController = require('../controllers/authAdminController');
const categoryController = require('./../controllers/categoryController');
const router = express.Router();

router.post(
  '/add-category',
  authAdminController.protect,
  authAdminController.restrictTo('admin'),
  categoryController.addCategory,
);
router.get('/get-all-categories', categoryController.getAllCategories);
router.get('/get-all-category/:categoryId', categoryController.getCategory);
router.delete(
  '/delete-category/:categoryId',
  authAdminController.protect,
  authAdminController.restrictTo('admin'),
  categoryController.deleteCategory,
);
router.patch(
  '/update-category/:categoryId',
  authAdminController.protect,
  authAdminController.restrictTo('admin'),
  categoryController.updateCategory,
);

module.exports = router;
