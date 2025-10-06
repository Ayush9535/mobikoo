const pool = require('../config/db');

// Shop Owner Stats
exports.getShopOwnerMonthlyStats = async (req, res) => {
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

        // Get top selling model for current month
        const topSellingModel = await pool.query(
            `SELECT 
                device_model_name,
                COUNT(*) as sales_count
            FROM invoices 
            WHERE shop_code = ?
            AND LEFT(date, 7) = DATE_FORMAT(NOW(), '%Y-%m')
            GROUP BY device_model_name
            ORDER BY sales_count DESC
            LIMIT 1`,
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
            },
            topSellingModel: topSellingModel[0][0]?.device_model_name || '-'
        });

    } catch (error) {
        console.error('Error fetching shop statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

exports.getShopOwnerYearlyStats = async (req, res) => {
    const { shop_code } = req.query;
    if (!shop_code) {
        return res.status(400).json({ error: 'Shop code is required' });
    }

    try {
        // Get current year's data
        const currentYearStats = await pool.query(
            `SELECT 
                COUNT(*) as total_invoices,
                SUM(CAST(device_price AS DECIMAL(10,2))) as total_sales
            FROM invoices 
            WHERE shop_code = ? 
            AND YEAR(date) = YEAR(CURRENT_DATE())`,
            [shop_code]
        );

        // Get top selling model for current year
        const topSellingModel = await pool.query(
            `SELECT 
                device_model_name,
                COUNT(*) as sales_count
            FROM invoices 
            WHERE shop_code = ?
            AND YEAR(date) = YEAR(CURRENT_DATE())
            GROUP BY device_model_name
            ORDER BY sales_count DESC
            LIMIT 1`,
            [shop_code]
        );

        // Get previous year's data
        const previousYearStats = await pool.query(
            `SELECT 
                COUNT(*) as total_invoices,
                SUM(CAST(device_price AS DECIMAL(10,2))) as total_sales
            FROM invoices 
            WHERE shop_code = ? 
            AND YEAR(date) = YEAR(CURRENT_DATE()) - 1`,
            [shop_code]
        );

        const currentYear = currentYearStats[0][0];
        const previousYear = previousYearStats[0][0];

        const salesPercentChange = previousYear.total_sales > 0 
            ? ((currentYear.total_sales - previousYear.total_sales) / previousYear.total_sales) * 100
            : 100;

        const invoicesPercentChange = previousYear.total_invoices > 0
            ? ((currentYear.total_invoices - previousYear.total_invoices) / previousYear.total_invoices) * 100
            : 100;

        res.json({
            currentYear: {
                totalSales: currentYear.total_sales || 0,
                totalInvoices: currentYear.total_invoices || 0
            },
            previousYear: {
                totalSales: previousYear.total_sales || 0,
                totalInvoices: previousYear.total_invoices || 0
            },
            percentageChanges: {
                salesChange: Math.round(salesPercentChange * 10) / 10,
                invoicesChange: Math.round(invoicesPercentChange * 10) / 10
            },
            topSellingModel: topSellingModel[0][0]?.device_model_name || '-'
        });

    } catch (error) {
        console.error('Error fetching shop yearly statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

exports.getShopOwnerLifetimeStats = async (req, res) => {
    const { shop_code } = req.query;
    if (!shop_code) {
        return res.status(400).json({ error: 'Shop code is required' });
    }

    try {
        // Get lifetime data
        const lifetimeStats = await pool.query(
            `SELECT 
                COUNT(*) as total_invoices,
                SUM(CAST(device_price AS DECIMAL(10,2))) as total_sales,
                MIN(date) as first_sale_date
            FROM invoices 
            WHERE shop_code = ?`,
            [shop_code]
        );

        // Get top selling model of all time
        const topSellingModel = await pool.query(
            `SELECT 
                device_model_name,
                COUNT(*) as sales_count
            FROM invoices 
            WHERE shop_code = ?
            GROUP BY device_model_name
            ORDER BY sales_count DESC
            LIMIT 1`,
            [shop_code]
        );

        // Get monthly average
        const monthlyAverage = await pool.query(
            `SELECT 
                COUNT(*) / COUNT(DISTINCT LEFT(date, 7)) as avg_monthly_invoices,
                SUM(CAST(device_price AS DECIMAL(10,2))) / COUNT(DISTINCT LEFT(date, 7)) as avg_monthly_sales
            FROM invoices 
            WHERE shop_code = ?`,
            [shop_code]
        );

        const lifetime = lifetimeStats[0][0];
        const average = monthlyAverage[0][0];

        res.json({
            lifetime: {
                totalSales: lifetime.total_sales || 0,
                totalInvoices: lifetime.total_invoices || 0,
                firstSaleDate: lifetime.first_sale_date,
                avgMonthlySales: Math.round(average.avg_monthly_sales || 0),
                avgMonthlyInvoices: Math.round(average.avg_monthly_invoices || 0)
            },
            topSellingModel: topSellingModel[0][0]?.device_model_name || '-'
        });

    } catch (error) {
        console.error('Error fetching shop lifetime statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

// Admin Stats
exports.getAdminMonthlyStats = async (req, res) => {
    try {
        // Get current month's data
        const currentMonthStats = await pool.query(
            `SELECT 
                COUNT(*) as total_invoices,
                SUM(CAST(device_price AS DECIMAL(10,2))) as total_sales
            FROM invoices 
            WHERE LEFT(date, 7) = DATE_FORMAT(NOW(), '%Y-%m')`
        );

        // Get warranty counts
        const warrantyStats = await pool.query(
            `SELECT 
                SUM(CASE WHEN renewed_on IS NOT NULL THEN 1 ELSE 0 END) as total_extended_warranties,
                SUM(CASE WHEN status = 'Active' AND end_date > CURDATE() THEN 1 ELSE 0 END) as total_active_warranties
            FROM warranty_history`
        );

        // Get top selling model for current month
        const topSellingModel = await pool.query(
            `SELECT 
                device_model_name,
                COUNT(*) as sales_count
            FROM invoices 
            WHERE LEFT(date, 7) = DATE_FORMAT(NOW(), '%Y-%m')
            GROUP BY device_model_name
            ORDER BY sales_count DESC
            LIMIT 1`
        );

        // Get top performing manager for current month
        const topManager = await pool.query(
            `SELECT 
                created_by,
                COUNT(*) as invoice_count
            FROM invoices 
            WHERE LEFT(date, 7) = DATE_FORMAT(NOW(), '%Y-%m')
            GROUP BY created_by
            ORDER BY invoice_count DESC
            LIMIT 1`
        );

        // Get previous month's data
        const previousMonthStats = await pool.query(
            `SELECT 
                COUNT(*) as total_invoices,
                SUM(CAST(device_price AS DECIMAL(10,2))) as total_sales
            FROM invoices 
            WHERE LEFT(date, 7) = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m')`
        );

        const currentMonth = currentMonthStats[0][0];
        const previousMonth = previousMonthStats[0][0];
        const warranties = warrantyStats[0][0];

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
                salesChange: Math.round(salesPercentChange * 10) / 10,
                invoicesChange: Math.round(invoicesPercentChange * 10) / 10
            },
            totalManagers: users.total_managers || 0,
            totalShopOwners: users.total_shop_owners || 0,
            topShop: topShop[0][0]?.shop_code || '-',
            topManager: topManager[0][0]?.created_by || '-',
            topSellingModel: topSellingModel[0][0]?.device_model_name || '-'
        });

    } catch (error) {
        console.error('Error fetching admin monthly statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

exports.getAdminYearlyStats = async (req, res) => {
    try {
        // Get current year's data
        const currentYearStats = await pool.query(
            `SELECT 
                COUNT(*) as total_invoices,
                SUM(CAST(device_price AS DECIMAL(10,2))) as total_sales
            FROM invoices 
            WHERE YEAR(date) = YEAR(CURRENT_DATE())`
        );

        // Get warranty counts for the year
        const warrantyStats = await pool.query(
            `SELECT 
                SUM(CASE WHEN renewed_on IS NOT NULL AND YEAR(renewed_on) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END) as total_extended_warranties,
                SUM(CASE WHEN status = 'Active' AND end_date > CURDATE() THEN 1 ELSE 0 END) as total_active_warranties
            FROM warranty_history`
        );

        // Get top selling model for current year
        const topSellingModel = await pool.query(
            `SELECT 
                device_model_name,
                COUNT(*) as sales_count
            FROM invoices 
            WHERE YEAR(date) = YEAR(CURRENT_DATE())
            GROUP BY device_model_name
            ORDER BY sales_count DESC
            LIMIT 1`
        );

        // Get top performing manager for current year
        const topManager = await pool.query(
            `SELECT 
                created_by,
                COUNT(*) as invoice_count
            FROM invoices 
            WHERE YEAR(date) = YEAR(CURRENT_DATE())
            GROUP BY created_by
            ORDER BY invoice_count DESC
            LIMIT 1`
        );

        // Get previous year's data
        const previousYearStats = await pool.query(
            `SELECT 
                COUNT(*) as total_invoices,
                SUM(CAST(device_price AS DECIMAL(10,2))) as total_sales
            FROM invoices 
            WHERE YEAR(date) = YEAR(CURRENT_DATE()) - 1`
        );

        const currentYear = currentYearStats[0][0];
        const previousYear = previousYearStats[0][0];
        const warranties = warrantyStats[0][0];

        const salesPercentChange = previousYear.total_sales > 0 
            ? ((currentYear.total_sales - previousYear.total_sales) / previousYear.total_sales) * 100
            : 100;

        const invoicesPercentChange = previousYear.total_invoices > 0
            ? ((currentYear.total_invoices - previousYear.total_invoices) / previousYear.total_invoices) * 100
            : 100;

        res.json({
            currentYear: {
                totalSales: currentYear.total_sales || 0,
                totalInvoices: currentYear.total_invoices || 0
            },
            previousYear: {
                totalSales: previousYear.total_sales || 0,
                totalInvoices: previousYear.total_invoices || 0
            },
            percentageChanges: {
                salesChange: Math.round(salesPercentChange * 10) / 10,
                invoicesChange: Math.round(invoicesPercentChange * 10) / 10
            },
            warranties: {
                totalExtendedWarranties: warranties.total_extended_warranties || 0,
                totalActiveWarranties: warranties.total_active_warranties || 0
            },
            topManager: topManager[0][0]?.created_by || '-',
            topSellingModel: topSellingModel[0][0]?.device_model_name || '-'
        });

    } catch (error) {
        console.error('Error fetching admin yearly statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

exports.getAdminLifetimeStats = async (req, res) => {
    try {
        // Get lifetime data
        const lifetimeStats = await pool.query(
            `SELECT 
                COUNT(*) as total_invoices,
                SUM(CAST(device_price AS DECIMAL(10,2))) as total_sales,
                MIN(date) as first_sale_date
            FROM invoices`
        );

        // Get lifetime warranty counts
        const warrantyStats = await pool.query(
            `SELECT 
                SUM(CASE WHEN renewed_on IS NOT NULL THEN 1 ELSE 0 END) as total_extended_warranties,
                SUM(CASE WHEN status = 'Active' AND end_date > CURDATE() THEN 1 ELSE 0 END) as total_active_warranties
            FROM warranty_history`
        );

        // Get top selling model of all time
        const topSellingModel = await pool.query(
            `SELECT 
                device_model_name,
                COUNT(*) as sales_count
            FROM invoices 
            GROUP BY device_model_name
            ORDER BY sales_count DESC
            LIMIT 1`
        );

        // Get top performing manager of all time
        const topManager = await pool.query(
            `SELECT 
                created_by,
                COUNT(*) as invoice_count
            FROM invoices 
            GROUP BY created_by
            ORDER BY invoice_count DESC
            LIMIT 1`
        );

        // Get monthly average
        const monthlyAverage = await pool.query(
            `SELECT 
                COUNT(*) / COUNT(DISTINCT LEFT(date, 7)) as avg_monthly_invoices,
                SUM(CAST(device_price AS DECIMAL(10,2))) / COUNT(DISTINCT LEFT(date, 7)) as avg_monthly_sales
            FROM invoices`
        );

        const lifetime = lifetimeStats[0][0];
        const warranties = warrantyStats[0][0];
        const average = monthlyAverage[0][0];

        res.json({
            lifetime: {
                totalSales: lifetime.total_sales || 0,
                totalInvoices: lifetime.total_invoices || 0,
                firstSaleDate: lifetime.first_sale_date,
                avgMonthlySales: Math.round(average.avg_monthly_sales || 0),
                avgMonthlyInvoices: Math.round(average.avg_monthly_invoices || 0)
            },
            warranties: {
                totalExtendedWarranties: warranties.total_extended_warranties || 0,
                totalActiveWarranties: warranties.total_active_warranties || 0
            },
            topManager: topManager[0][0]?.created_by || '-',
            topSellingModel: topSellingModel[0][0]?.device_model_name || '-'
        });

    } catch (error) {
        console.error('Error fetching admin lifetime statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};