const authController = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');

const router = require('express').Router();

router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/register', validateRequest(registerSchema), authController.register);
router.get('/logout', authController.logout);

module.exports = router;
