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

async function getWarrantyNotifications({ shop_code }) {
    let query = `
        SELECT 
            w.id AS warranty_id,
            i.invoice_id,
            i.customer_name,
            i.device_model_name,
            w.start_date,
            w.end_date,
            w.status,
            i.shop_code,
            i.imei_number,
            s.shop_name,
            DATEDIFF(w.end_date, CURDATE()) as days_remaining
        FROM warranty_history w
        JOIN invoices i ON i.id = w.invoice_id
        LEFT JOIN shop_owners s ON i.shop_code = s.shop_code
        WHERE w.status = 'Active'
          AND w.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    `;

    const params = [];

    // Only add shop_code filter if it's provided (for shop owner view)
    if (shop_code) {
        query += ` AND i.shop_code = ?`;
        params.push(shop_code);
    }

    query += ` ORDER BY w.end_date ASC`;

    const [rows] = await pool.query(query, params);
    return rows;
}

async function getAllWarranties(shop_code = null) {
    let query = `
        SELECT 
            w.id AS warranty_id,
            i.invoice_id,
            i.customer_name,
            i.device_model_name,
            w.start_date,
            w.end_date,
            w.status,
            CASE
                WHEN w.end_date < CURDATE() THEN 'expired'
                ELSE w.status
            END AS computed_status,
            w.renewed_on,
            w.renewal_notes,
            i.shop_code,
            i.imei_number,
            s.shop_name,
            DATEDIFF(w.end_date, CURDATE()) as days_remaining
        FROM warranty_history w
        JOIN invoices i ON i.id = w.invoice_id
        LEFT JOIN shop_owners s ON i.shop_code = s.shop_code
    `;

    const params = [];

    if (shop_code) {
        query += ` WHERE i.shop_code = ?`;
        params.push(shop_code);
    }

    query += ` ORDER BY w.end_date DESC`;

    const [rows] = await pool.query(query, params);

    // Self-healing: Update expired warranties in the database
    const expiredWarranties = rows.filter(w => 
        w.computed_status === 'expired' && w.status !== 'expired'
    );

    if (expiredWarranties.length > 0) {
        const updateQuery = `
            UPDATE warranty_history 
            SET status = 'expired' 
            WHERE id IN (?)`
        await pool.query(updateQuery, [expiredWarranties.map(w => w.warranty_id)]);
    }

    // Return warranties with computed status
    return rows.map(warranty => ({
        ...warranty,
        status: warranty.computed_status
    }));
}

async function getWarrantyById(warrantyId) {
    const query = `
        SELECT 
            w.id AS warranty_id,
            i.invoice_id,
            i.customer_name,
            i.customer_contact_number,
            i.customer_alt_contact_number,
            i.device_model_name,
            w.start_date,
            w.end_date,
            w.status,
            w.renewed_on,
            w.renewal_notes,
            i.shop_code,
            i.imei_number,
            s.shop_name,
            s.shop_address,
            s.contact_number as shop_contact,
            DATEDIFF(w.end_date, CURDATE()) as days_remaining
        FROM warranty_history w
        JOIN invoices i ON i.id = w.invoice_id
        LEFT JOIN shop_owners s ON i.shop_code = s.shop_code
        WHERE w.id = ?
    `;

    const [rows] = await pool.query(query, [warrantyId]);
    return rows[0];  // Return single warranty or null if not found
}

module.exports = { 
    createWarrantyHistory, 
    getWarrantyNotifications,
    getAllWarranties,
    getWarrantyById
};
