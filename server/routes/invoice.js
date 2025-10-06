const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const jwt = require('jsonwebtoken');
const { getUserByEmail } = require('../models/user');
const pool = require('../config/db');
const {authMiddleware} = require('../routes/auth');

// Auth middleware to set req.user
router.use(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserByEmail(payload.email);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
});


// Bulk upload
router.post('/bulk', invoiceController.bulkUploadInvoices); // manager only

// Get recent invoices (must be before /:id route to avoid conflict)
router.get('/recent', async (req, res) => {
  try {
    const user = req.user;
    
    // For admin dashboard, always return exactly 3 most recent invoices
    if (user.role === 'admin') {
      const [recentInvoices] = await pool.query(`
        SELECT i.*, s.shop_name 
        FROM invoices i 
        LEFT JOIN shop_owners s ON i.shop_code = s.shop_code 
        ORDER BY i.created_at DESC 
        LIMIT 3
      `);
      return res.json(recentInvoices);
    }
    
    // For shop owner dashboard, allow custom limit
    if (user.role === 'shopowner') {
      const limit = parseInt(req.query.limit) || 7; // Default to 7 for shop owner view
      
      // Get shop owner's shop_code
      const [shopOwner] = await pool.query(
        'SELECT shop_code FROM shop_owners WHERE user_id = ?',
        [user.id]
      );
      
      if (!shopOwner || !shopOwner[0]) {
        return res.status(404).json({ error: 'Shop owner details not found' });
      }
      
      // Get invoices for this shop
      const [recentInvoices] = await pool.query(`
        SELECT i.*, s.shop_name 
        FROM invoices i 
        LEFT JOIN shop_owners s ON i.shop_code = s.shop_code 
        WHERE i.shop_code = ?
        ORDER BY i.created_at DESC 
        LIMIT ?
      `, [shopOwner[0].shop_code, limit]);
      
      return res.json(recentInvoices);
    }
    
    // For manager role or others, return with default limit
    const limit = parseInt(req.query.limit) || 3;
    const [recentInvoices] = await pool.query(`
      SELECT i.*, s.shop_name 
      FROM invoices i 
      LEFT JOIN shop_owners s ON i.shop_code = s.shop_code 
      ORDER BY i.created_at DESC 
      LIMIT ?
    `, [limit]);
    
    res.json(recentInvoices);
  } catch (error) {
    console.error('Error fetching recent invoices:', error);
    res.status(500).json({ error: 'Failed to fetch recent invoices', details: error.message });
  }
});

// CRUD routes
router.post('/', invoiceController.createInvoice); // manager only
router.get('/', invoiceController.getAllInvoices); // all roles
router.get('/:id', invoiceController.getInvoiceById); // all roles
router.get('/getByInvoiceId/:invoice_id/:shop_code', invoiceController.getInvoiceByInvoiceId); // all roles
router.put('/:id', invoiceController.updateInvoice); // manager only
router.delete('/:id', invoiceController.deleteInvoice); // manager only

module.exports = router;
