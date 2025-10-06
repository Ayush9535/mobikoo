const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/warrantyController');
const jwt = require('jsonwebtoken');

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

// Notification routes
router.get('/notifications', authMiddleware, warrantyController.getWarrantyAlerts);
router.get('/admin/notifications', authMiddleware, warrantyController.getAdminWarrantyAlerts);

// Warranty listing routes
router.get('/shop/warranties', authMiddleware, warrantyController.getShopWarranties);
router.get('/admin', authMiddleware, warrantyController.getAdminWarranties);

// Warranty detail route
router.get('/:id', authMiddleware, warrantyController.getWarrantyDetails);

module.exports = router;