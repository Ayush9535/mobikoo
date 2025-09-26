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
    const recentInvoices = await pool.query(
      `SELECT i.*, s.shop_name 
       FROM invoices i 
       LEFT JOIN shop_owners s ON i.shop_code = s.shop_code 
       ORDER BY i.created_at DESC 
       LIMIT 3`
    );
    console.log(recentInvoices);
    res.json(recentInvoices[0]);
  } catch (error) {
    console.error('Error fetching recent invoices:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// CRUD routes
router.post('/', invoiceController.createInvoice); // manager only
router.get('/', invoiceController.getAllInvoices); // all roles
router.get('/:id', invoiceController.getInvoiceById); // all roles
router.put('/:id', invoiceController.updateInvoice); // manager only
router.delete('/:id', invoiceController.deleteInvoice); // manager only

module.exports = router;
