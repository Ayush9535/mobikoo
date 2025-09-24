const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/admin/create-user', authController.adminCreateUser);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/admin/shopowners', authController.getAllShopOwners);
router.get('/admin/managers', authController.getAllManagers);

module.exports = router;
