const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
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

// Shop Owner routes
router.get('/shopowner/monthly', authMiddleware, statsController.getShopOwnerMonthlyStats);
router.get('/shopowner/yearly', authMiddleware, statsController.getShopOwnerYearlyStats);
router.get('/shopowner/lifetime', authMiddleware, statsController.getShopOwnerLifetimeStats);

// Admin routes
router.get('/admin/monthly', authMiddleware, statsController.getAdminMonthlyStats);
router.get('/admin/yearly', authMiddleware, statsController.getAdminYearlyStats);
router.get('/admin/lifetime', authMiddleware, statsController.getAdminLifetimeStats);

module.exports = router;