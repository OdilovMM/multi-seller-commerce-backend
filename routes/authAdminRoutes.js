const express = require("express");
const authAdminController = require("../controllers/authAdminController");
const router = express.Router();

// router.post("/admin-register", authAdminController.signup);
router.post("/admin-login", authAdminController.login);
router.get("/logout", authAdminController.protect, authAdminController.logout);
router.get(
  "/get-admin-detail",
  authAdminController.protect,
  authAdminController.restrictTo("admin"),
  authAdminController.getMeAdmin
);

router.get(
  "/get-admin-dashboard-info",
  authAdminController.protect,
  authAdminController.restrictTo("admin"),
  authAdminController.getAdminDashboardInfo
);

module.exports = router;
