const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');

router.post('/admin/create-user', authController.adminCreateUser);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/admin/shopowners', authController.getAllShopOwners);
router.get('/admin/managers', authController.getAllManagers);
// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/shopowner/details', authMiddleware, authController.getShopOwnerDetails);
router.get('/manager/details', authMiddleware, authController.getManagerDetails);
router.get('/admin/details', authMiddleware, authController.getAdminDetails);

module.exports = router;
