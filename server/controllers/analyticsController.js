const pool = require('../config/db');

const getModelInvoiceCounts = async (req, res) => {
  const { role, duration = 'lifetime' } = req.query;
  let query = `
    SELECT device_model_name, COUNT(*) as invoice_count
    FROM invoices
    WHERE 1=1
  `;

  // Add role-specific conditions
  if (role === 'shopowner') {
    query += ` AND shop_code = ?`;
  } else if (role === 'manager') {
    query += ` AND manager_id = ?`;
  }

  // Add duration condition based on the selected duration
  if (duration !== 'lifetime') {
    query += duration === 'yearly' 
      ? ` AND created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)`
      : ` AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
  }

  query += ` GROUP BY device_model_name ORDER BY invoice_count DESC LIMIT 10`;

  try {
    const params = role === 'admin' ? [] : [role === 'shopowner' ? req.user.shop_code : req.user.id];
    const [rows] = await pool.query(query, params);
    
    // Ensure we always return an array
    const modelCounts = Array.isArray(rows) ? rows : [];
    res.json({ modelCounts });
  } catch (error) {
    console.error('Error fetching model invoice counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getModelSalesTrend = async (req, res) => {
  const { role, duration = 'monthly' } = req.query;
  
  // Define the date range based on duration
  let dateRange;
  switch (duration) {
    case 'yearly':
      dateRange = 'INTERVAL 1 YEAR';
      break;
    case 'monthly':
      dateRange = 'INTERVAL 30 DAY';
      break;
    case 'lifetime':
      dateRange = 'INTERVAL 1 YEAR'; // Default to 1 year for lifetime view
      break;
    default:
      dateRange = 'INTERVAL 30 DAY';
  }
  
  let query = `
    SELECT 
      DATE(i.created_at) as date,
      device_model_name,
      COUNT(i.id) as sales_count
    FROM invoices i
    WHERE i.created_at >= DATE_SUB(CURDATE(), ${dateRange})
  `;

  // Add role-specific conditions
  if (role === 'shopowner') {
    query += ` AND i.shop_code = ?`;
  } else if (role === 'manager') {
    query += ` AND i.manager_id = ?`;
  }

  query += `
    GROUP BY DATE(i.created_at), device_model_name
    ORDER BY date ASC, sales_count DESC
  `;

  try {
    const params = role === 'admin' ? [] : [role === 'shopowner' ? req.user.shop_code : req.user.id];
    const [rows] = await pool.query(query, params);
    
    // Transform data into a more frontend-friendly format
    const trends = {};
    rows.forEach(row => {
      if (!trends[row.device_model_name]) {
        trends[row.device_model_name] = [];
      }
      trends[row.device_model_name].push({
        date: row.date,
        sales: row.sales_count
      });
    });

    res.json(trends);
  } catch (error) {
    console.error('Error fetching model sales trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getModelInvoiceCounts,
  getModelSalesTrend
};