const pool = require('../config/db');

async function createWarrantyHistory(invoiceId, purchaseDate, warrantyDuration = '2 years') {
    // Calculate end date
    const endDateQuery = `SELECT DATE_ADD(?, INTERVAL ${parseInt(warrantyDuration)} YEAR) AS end_date`;
    const [result] = await pool.query(endDateQuery, [purchaseDate]);
    const endDate = result[0].end_date;

    const insertQuery = `
        INSERT INTO warranty_history (invoice_id, start_date, end_date, status)
        VALUES (?, ?, ?, 'Active')
    `;
    await pool.query(insertQuery, [invoiceId, purchaseDate, endDate]);
}

async function getWarrantyNotifications({ shop_code, user_id }) {
    let query = `
        SELECT 
            w.id AS warranty_id,
            i.invoice_id,
            i.customer_name,
            i.device_model_name,
            w.start_date,
            w.end_date,
            w.status,
            i.shop_code
        FROM warranty_history w
        JOIN invoices i ON i.id = w.invoice_id
        WHERE w.status = 'Active'
          AND w.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    `;

    const params = [];

    if (shop_code) {
        query += ` AND i.shop_code = ?`;
        params.push(shop_code);
    }

    if (user_id) {
        // Assuming user_id is the manager/admin/shopowner who created the invoice
        query += ` AND i.created_by = ?`;
        params.push(user_id);
    }

    query += ` ORDER BY w.end_date ASC`;

    const [rows] = await pool.query(query, params);
    return rows;
}

module.exports = { createWarrantyHistory, getWarrantyNotifications };
