const pool = require('../config/db');

exports.getShopOwnerStats = async (req, res) => {
    const { shop_code } = req.query;
    if (!shop_code) {
        return res.status(400).json({ error: 'Shop code is required' });
    }

    try {
        // Get current month's data
        const currentMonthStats = await pool.query(
            `SELECT 
                COUNT(*) as total_invoices,
                SUM(CAST(device_price AS DECIMAL(10,2))) as total_sales
            FROM invoices 
            WHERE shop_code = ? 
            AND LEFT(date, 7) = DATE_FORMAT(NOW(), '%Y-%m')`,
            [shop_code]
        );

        // Get previous month's data
        const previousMonthStats = await pool.query(
            `SELECT 
                COUNT(*) as total_invoices,
                SUM(CAST(device_price AS DECIMAL(10,2))) as total_sales
            FROM invoices 
            WHERE shop_code = ? 
            AND LEFT(date, 7) = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m')`,
            [shop_code]
        );

        // Calculate percentages
        const currentMonth = currentMonthStats[0][0];
        const previousMonth = previousMonthStats[0][0];

        const salesPercentChange = previousMonth.total_sales > 0 
            ? ((currentMonth.total_sales - previousMonth.total_sales) / previousMonth.total_sales) * 100
            : 100;

        const invoicesPercentChange = previousMonth.total_invoices > 0
            ? ((currentMonth.total_invoices - previousMonth.total_invoices) / previousMonth.total_invoices) * 100
            : 100;

        res.json({
            currentMonth: {
                totalSales: currentMonth.total_sales || 0,
                totalInvoices: currentMonth.total_invoices || 0
            },
            previousMonth: {
                totalSales: previousMonth.total_sales || 0,
                totalInvoices: previousMonth.total_invoices || 0
            },
            percentageChanges: {
                salesChange: Math.round(salesPercentChange * 10) / 10, // Round to 1 decimal place
                invoicesChange: Math.round(invoicesPercentChange * 10) / 10
            }
        });

    } catch (error) {
        console.error('Error fetching shop statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};