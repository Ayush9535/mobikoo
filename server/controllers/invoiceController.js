const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { createWarrantyHistory } = require('../models/warranty');

// Validation helper function
function validateInvoiceData(data) {
  const errors = [];

  // Phone number validation (10 digits)
  if (!data.customer_contact_number || !/^\d{10}$/.test(data.customer_contact_number)) {
    errors.push('Customer contact number must be exactly 10 digits');
  }

  // Alt phone number validation (if provided)
  if (data.customer_alt_contact_number && !/^\d{10}$/.test(data.customer_alt_contact_number)) {
    errors.push('Alternative contact number must be exactly 10 digits');
  }

  // IMEI validation (15 digits)
  if (!data.imei_number || !/^\d{15}$/.test(data.imei_number)) {
    errors.push('IMEI number must be exactly 15 digits');
  }

  // Device price validation
  if (!data.device_price || parseFloat(data.device_price) <= 0) {
    errors.push('Device price must be greater than 0');
  }

  // Payment mode validation
  const validPaymentModes = ['CASH', 'UPI', 'BANK_TRANSFER', 'CARD'];
  if (!data.payment_mode || !validPaymentModes.includes(data.payment_mode.toUpperCase())) {
    errors.push('Payment mode must be one of: CASH, UPI, BANK_TRANSFER, CARD');
  }

  // Required fields validation
  if (!data.customer_name?.trim()) errors.push('Customer name is required');
  if (!data.device_model_name?.trim()) errors.push('Device model name is required');
  if (!data.date) errors.push('Date is required');

  return errors;
}

// Bulk upload invoices (manager only)
exports.bulkUploadInvoices = async (req, res) => {
  const user = req.user;
  if (!canEdit(user.role)) return res.status(403).json({ error: 'Forbidden' });
  const invoices = req.body.invoices;
  if (!Array.isArray(invoices)) return res.status(400).json({ error: 'Invalid data' });
  
  // Validate shop codes first
  const uniqueShopCodes = new Set(invoices.map(inv => inv.shop_code).filter(Boolean));
  
  // Verify all shop codes exist
  const [validShops] = await pool.query(
    'SELECT shop_code FROM shop_owners WHERE shop_code IN (?)',
    [Array.from(uniqueShopCodes)]
  );
  
  const validShopCodes = new Set(validShops.map(shop => shop.shop_code));
  const invalidShopCodes = Array.from(uniqueShopCodes).filter(code => !validShopCodes.has(code));
  
  if (invalidShopCodes.length > 0) {
    return res.status(400).json({
      error: 'Invalid shops',
      message: `The following shop codes do not exist: ${invalidShopCodes.join(', ')}`,
      invalidShopCodes
    });
  }

  // Get all invoice_ids and shop_codes from the request
  const requestInvoices = invoices.filter(inv => inv.invoice_id && inv.shop_code);
  
  // Check for existing invoice_ids in the same shop
  const [existingInvoices] = await pool.query(
    'SELECT invoice_id, shop_code FROM invoices WHERE (invoice_id, shop_code) IN (?)',
    [requestInvoices.map(inv => [inv.invoice_id, inv.shop_code])]
  );
  
  // Create a Set of invoice_id-shop_code combinations
  const existingCombos = new Set(existingInvoices.map(inv => `${inv.invoice_id}-${inv.shop_code}`));

  const fields = [
    'invoice_id', 'date', 'customer_name', 'customer_contact_number', 'customer_alt_contact_number',
    'device_model_name', 'imei_number', 'device_price', 'payment_mode', 'shop_code'
  ];
  let success = 0, failed = 0;
  let failed_ids = [];
  let duplicate_ids = [];
  let validation_errors = [];  // Track validation errors per invoice

  for (const row of invoices) {
    // Skip if invoice_id already exists for this shop
    if (row.invoice_id && row.shop_code && existingCombos.has(`${row.invoice_id}-${row.shop_code}`)) {
      failed++;
      duplicate_ids.push(`${row.invoice_id} (Shop: ${row.shop_code})`);
      continue;
    }

    const data = {};
    for (const f of fields) data[f] = row[f] !== undefined ? row[f] : null;
    data.created_by = user.id;
    data.warranty_duration = '2 years';
    data.created_at = new Date();

    // Normalize payment mode to uppercase
    if (data.payment_mode) data.payment_mode = data.payment_mode.toUpperCase();

    // Validate invoice data
    const validationErrors = validateInvoiceData(data);
    
    if (validationErrors.length > 0) {
      failed++;
      validation_errors.push({
        invoice_id: row.invoice_id || 'Unknown',
        errors: validationErrors
      });
      continue;
    }

    try {
      await createInvoice(data);
      await createWarrantyHistory(id, data.date, data.warranty_duration);
      success++;
    } catch (error) {
      failed++;
      if (row.invoice_id) failed_ids.push(row.invoice_id);
      validation_errors.push({
        invoice_id: row.invoice_id || 'Unknown',
        errors: [error.message]
      });
    }
  }
  // Prepare response message
  let message = [];
  if (duplicate_ids.length > 0) {
    message.push(`${duplicate_ids.length} invoices skipped due to duplicate invoice IDs`);
  }
  if (validation_errors.length > 0) {
    message.push(`${validation_errors.length} invoices failed validation`);
  }

  res.json({ 
    success, 
    failed, 
    failed_ids,
    duplicate_ids,
    validation_errors,
    message: message.length > 0 ? message.join('. ') : undefined
  });
};
const { createInvoice, getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice } = require('../models/invoice');
const { getUserByEmail } = require('../models/user');

// Helper: check if user can edit (manager only)
function canEdit(role) {
  return role === 'manager';
}
// Helper: check if user can read (admin, manager, shopowner)
function canRead(role) {
  return ['admin', 'manager', 'shopowner'].includes(role);
}

// Create invoice (manager only)
exports.createInvoice = async (req, res) => {
  const user = req.user;
  if (!canEdit(user.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const data = req.body;

    if (!data.shop_code) {
      return res.status(400).json({ error: 'Invalid shop', message: 'Shop code is required' });
    }

    const [shopExists] = await pool.query(
      'SELECT shop_code FROM shop_owners WHERE shop_code = ?',
      [data.shop_code]
    );

    if (!shopExists || shopExists.length === 0) {
      return res.status(400).json({ error: 'Invalid shop', message: `Shop with code ${data.shop_code} does not exist` });
    }

    if (data.invoice_id && data.shop_code) {
      const [existing] = await pool.query(
        'SELECT invoice_id FROM invoices WHERE invoice_id = ? AND shop_code = ?',
        [data.invoice_id, data.shop_code]
      );

      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'Duplicate invoice', message: `An invoice with ID ${data.invoice_id} already exists for shop ${data.shop_code}`, isDuplicate: true });
      }
    }

    data.created_by = user.id;
    data.warranty_duration = '2 years';
    if (!data.created_at) data.created_at = new Date();

    const id = await createInvoice(data);

    // **Add warranty history entry**
    await createWarrantyHistory(id, data.date, data.warranty_duration);

    res.json({ id, invoice_id: data.invoice_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create invoice', details: err.message });
  }
};

// Get all invoices (admin, manager, shopowner)
exports.getAllInvoices = async (req, res) => {
  const user = req.user;
  if (!canRead(user.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    let invoices;
    if (user.role === 'shopowner') {
      // Get shop_code for the shop owner
      const [shopOwner] = await pool.query(
        'SELECT shop_code FROM shop_owners WHERE user_id = ?',
        [user.id]
      );
      if (!shopOwner || !shopOwner[0]) {
        return res.status(404).json({ error: 'Shop owner details not found' });
      }
      const shop_code = shopOwner[0].shop_code;
      
      // Get invoices for this shop
      let orderBy = 'i.created_at DESC';
      if (req.query.sort) {
        const [field, order] = req.query.sort.split(':');
        // Only allow certain fields to be sorted
        const allowedFields = ['date', 'created_at', 'invoice_id', 'customer_name', 'device_price'];
        const allowedOrders = ['asc', 'desc'];
        if (allowedFields.includes(field) && allowedOrders.includes(order.toLowerCase())) {
          orderBy = `i.${field} ${order.toUpperCase()}`;
        }
      }

      const [rows] = await pool.query(
        `SELECT i.*, s.shop_name 
         FROM invoices i 
         LEFT JOIN shop_owners s ON i.shop_code = s.shop_code 
         WHERE i.shop_code = ?
         ORDER BY ${orderBy}`,
        [shop_code]
      );
      invoices = rows;
    } else if (user.role === 'manager' && req.query.mine === '1') {
      invoices = await getAllInvoices(user.id);
    } else {
      invoices = await getAllInvoices();
    }
    res.json(invoices);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ error: 'Failed to fetch invoices', details: err.message });
  }
};

// Get invoice by id
exports.getInvoiceById = async (req, res) => {
  const user = req.user;
  if (!canRead(user.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoice', details: err.message });
  }
};

// Update invoice (manager only)
exports.updateInvoice = async (req, res) => {
  const user = req.user;
  if (!canEdit(user.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    await updateInvoice(req.params.id, req.body);
    res.json({ message: 'Invoice updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update invoice', details: err.message });
  }
};

// Delete invoice (manager only)
exports.deleteInvoice = async (req, res) => {
  const user = req.user;
  if (!canEdit(user.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    await deleteInvoice(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete invoice', details: err.message });
  }
};
