const { getWarrantyNotifications } = require('../models/warranty');

exports.getWarrantyAlerts = async (req, res) => {
    const user = req.user;
    
    // Only allow roles that can read (admin, manager, shopowner)
    if (!['admin', 'manager', 'shopowner'].includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { shop_code, user_id } = req.query;

    try {
        const notifications = await getWarrantyNotifications({ shop_code, user_id });
        res.json({ count: notifications.length, notifications });
    } catch (err) {
        console.error('Error fetching warranty notifications:', err);
        res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
    }
};
