const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const jwt = require('jsonwebtoken');
const { getUserByEmail } = require('../models/user');

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

// CRUD routes
router.post('/', invoiceController.createInvoice); // manager only
router.get('/', invoiceController.getAllInvoices); // all roles
router.get('/:id', invoiceController.getInvoiceById); // all roles
router.put('/:id', invoiceController.updateInvoice); // manager only
router.delete('/:id', invoiceController.deleteInvoice); // manager only

module.exports = router;
