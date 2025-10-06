const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { getModelInvoiceCounts, getModelSalesTrend } = require('../controllers/analyticsController');

const authenticateAnalyticsToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded, 'decoded');

    // Get shop ID for shop owner
    if (decoded.role === 'shopowner') {
      const [shopOwner] = await pool.query(
        `SELECT u.id, so.shop_code 
         FROM users u 
         JOIN shop_owners so ON u.id = so.user_id 
         WHERE u.email = ? AND u.role = ?`,
        [decoded.email, 'shopowner']
      );
      
      if (!shopOwner || !shopOwner[0] || !shopOwner[0].shop_code) {
        return res.status(401).json({ error: 'Shop owner not found' });
      }
      
      decoded.shop_code = shopOwner[0].shop_code;
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get model vs invoice count statistics
router.get('/model-counts', authenticateAnalyticsToken, getModelInvoiceCounts);

// Get model sales trends
router.get('/model-trends', authenticateAnalyticsToken, getModelSalesTrend);

module.exports = router;