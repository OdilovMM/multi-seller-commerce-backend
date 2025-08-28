const express = require('express');
const authController = require('./../controllers/authController');
const router = express.Router();



router.post('/seller/signup', (req, res, next) => authController.signup(req, res, next, 'seller'));
router.post('/seller/login', (req, res, next) => authController.login(req, res, next, 'seller'));

router.get('/logout', authController.logout);

module.exports = router;