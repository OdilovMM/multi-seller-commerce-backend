const express = require("express");
const customerController = require("./../controllers/customerController");
const router = express.Router();

router.post("/user-register", customerController.userRegister);
router.post("/user-login", customerController.userLogin);

router.get("/get-all-customers", customerController.getAllCustomers);

router.get(
  "/get-me",
  customerController.protect,
  customerController.restrictTo("user"),
  customerController.getMe
);

router.get(
  "/user-logout",
  customerController.protect,
  customerController.restrictTo("user"),
  customerController.userLogout
);
router.post(
  "/add-remove-wishlist",
  customerController.protect,
  customerController.restrictTo("user"),
  customerController.addRemoveWishList
);
router.post(
  "/add-remove-cart",
  customerController.protect,
  customerController.restrictTo("user"),
  customerController.addRemoveCart
);
router.get(
  "/get-my-wishlist",
  customerController.protect,
  customerController.restrictTo("user"),
  customerController.getMyWishlist
);
router.get(
  "/get-my-cart",
  customerController.protect,
  customerController.restrictTo("user"),
  customerController.getCustomerCart
);

router.patch(
  "/increment-cart-quantity/:productId",
  customerController.protect,
  customerController.restrictTo("user"),
  customerController.incrementProductInCart
);
router.patch(
  "/decrement-cart-quantity/:productId",
  customerController.protect,
  customerController.restrictTo("user"),
  customerController.decrementProductInCart
);

module.exports = router;
