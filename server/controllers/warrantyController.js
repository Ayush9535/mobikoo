const { getWarrantyNotifications, getAllWarranties, getWarrantyById } = require('../models/warranty');
const pool = require('../config/db');

async function getShopCodeByEmail(email) {
    const query = `
        SELECT so.shop_code 
        FROM shop_owners so
        JOIN users u ON u.id = so.user_id
        WHERE u.email = ?`;
    const [rows] = await pool.query(query, [email]);
    return rows[0]?.shop_code;
}

// Get notifications for shopowner
exports.getWarrantyAlerts = async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'shopowner') {
        return res.status(403).json({ error: 'Forbidden. This endpoint is for shop owners only.' });
    }

    const { shop_code } = req.query;

    if (!shop_code) {
        return res.status(400).json({ error: 'Shop code is required' });
    }

    try {
        const notifications = await getWarrantyNotifications({ shop_code });
        res.json({ count: notifications.length, notifications });
    } catch (err) {
        console.error('Error fetching warranty notifications:', err);
        res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
    }
};

// Get all warranty notifications for admin
exports.getAdminWarrantyAlerts = async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    try {
        // Pass empty object to get all notifications
        const notifications = await getWarrantyNotifications({});
        
        // Group notifications by shop
        const groupedNotifications = notifications.reduce((acc, notif) => {
            const shop = notif.shop_code;
            if (!acc[shop]) {
                acc[shop] = [];
            }
            acc[shop].push(notif);
            return acc;
        }, {});

        // Calculate totals
        const totalCount = notifications.length;
        const shopCount = Object.keys(groupedNotifications).length;

        res.json({
            total_count: totalCount,
            shops_affected: shopCount,
            notifications_by_shop: groupedNotifications,
            all_notifications: notifications
        });
    } catch (err) {
        console.error('Error fetching admin warranty notifications:', err);
        res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
    }
};

// Get all warranties for a shop
exports.getShopWarranties = async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'shopowner') {
        return res.status(403).json({ error: 'Forbidden. This endpoint is for shop owners only.' });
    }

    try {
        const shop_code = await getShopCodeByEmail(user.email);
        
        if (!shop_code) {
            return res.status(404).json({ error: 'Shop not found for this user' });
        }

        const warranties = await getAllWarranties(shop_code);
        res.json({
            count: warranties.length,
            warranties
        });
    } catch (err) {
        console.error('Error fetching shop warranties:', err);
        res.status(500).json({ error: 'Failed to fetch warranties', details: err.message });
    }
};

// Get all warranties for admin
exports.getAdminWarranties = async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    try {
        const warranties = await getAllWarranties();
        res.json({
            total: warranties.length,
            warranties
        });
    } catch (err) {
        console.error('Error fetching admin warranties:', err);
        res.status(500).json({ error: 'Failed to fetch warranties', details: err.message });
    }
};

// Get warranty details by ID
exports.getWarrantyDetails = async (req, res) => {
    const user = req.user;
    const { id } = req.params;

    try {
        const warranty = await getWarrantyById(id);
        
        if (!warranty) {
            return res.status(404).json({ error: 'Warranty not found' });
        }

        // If user is shop owner, verify they own this warranty
        if (user.role === 'shopowner' && warranty.shop_code !== req.query.shop_code) {
            return res.status(403).json({ error: 'Forbidden. This warranty belongs to a different shop.' });
        }

        res.json(warranty);
    } catch (err) {
        console.error('Error fetching warranty details:', err);
        res.status(500).json({ error: 'Failed to fetch warranty details', details: err.message });
    }
};
