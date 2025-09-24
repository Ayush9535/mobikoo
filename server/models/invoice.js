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

// Get all invoices (for admin, shopowner, manager) with user email and shop name
async function getAllInvoices(userId) {
  let query = `
    SELECT i.*, 
      u.email AS created_by_email,
      s.shop_name AS shop_name,
      s.shop_code AS shop_code_full
    FROM invoices i
    LEFT JOIN users u ON i.created_by = u.id
    LEFT JOIN shop_owners s ON i.shop_code = s.shop_code
  `;
  const params = [];
  if (userId) {
    query += ' WHERE i.created_by = ?';
    params.push(userId);
  }
  query += ' ORDER BY i.id DESC';
  const [rows] = await pool.query(query, params);
  // Map to replace created_by and shop_code fields for frontend
  return rows.map(row => ({
    ...row,
    created_by: row.created_by_email || row.created_by,
    shop_code: row.shop_code_full || row.shop_code,
    shop_name: row.shop_name || '',
    created_by_email: undefined,
    shop_code_full: undefined
  }));
}

// Get invoice by id, with user email and shop name
async function getInvoiceById(id) {
  const [rows] = await pool.query(`
    SELECT i.*, 
      u.email AS created_by_email,
      s.shop_name AS shop_name,
      s.shop_code AS shop_code_full
    FROM invoices i
    LEFT JOIN users u ON i.created_by = u.id
    LEFT JOIN shop_owners s ON i.shop_code = s.shop_code
    WHERE i.id = ?
  `, [id]);
  if (!rows[0]) return undefined;
  const row = rows[0];
  return {
    ...row,
    created_by: row.created_by_email || row.created_by,
    shop_code: row.shop_code_full || row.shop_code,
    shop_name: row.shop_name || '',
    created_by_email: undefined,
    shop_code_full: undefined
  };
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
