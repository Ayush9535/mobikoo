const pool = require('../config/db');

// Create invoice
async function createInvoice(data) {
  const [result] = await pool.query(
    `INSERT INTO invoices (invoice_id, date, customer_name, customer_contact_number, customer_alt_contact_number, device_model_name, imei_number, device_price, payment_mode, warranty_duration, created_by, shop_code, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.invoice_id,
      data.date,
      data.customer_name,
      data.customer_contact_number,
      data.customer_alt_contact_number,
      data.device_model_name,
      data.imei_number,
      data.device_price,
      data.payment_mode,
      data.warranty_duration || '2 years',
      data.created_by,
      data.shop_code,
      data.created_at || new Date()
    ]
  );
  return result.insertId;
}

// Get all invoices (for admin, shopowner, manager)
async function getAllInvoices() {
  const [rows] = await pool.query('SELECT * FROM invoices ORDER BY id DESC');
  return rows;
}

// Get invoice by id
async function getInvoiceById(id) {
  const [rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
  return rows[0];
}

// Update invoice (by id)
async function updateInvoice(id, data) {
  await pool.query(
    `UPDATE invoices SET date=?, customer_name=?, customer_contact_number=?, customer_alt_contact_number=?, device_model_name=?, imei_number=?, device_price=?, payment_mode=?, shop_code=? WHERE id=?`,
    [
      data.date,
      data.customer_name,
      data.customer_contact_number,
      data.customer_alt_contact_number,
      data.device_model_name,
      data.imei_number,
      data.device_price,
      data.payment_mode,
      data.shop_code,
      id
    ]
  );
}

// Delete invoice (by id)
async function deleteInvoice(id) {
  await pool.query('DELETE FROM invoices WHERE id = ?', [id]);
}

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
};
