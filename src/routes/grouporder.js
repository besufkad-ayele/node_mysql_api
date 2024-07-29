const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { authenticateToken, checkRole } = require('../../services/middleware/authenticateToken');

// GET /api/group-orders
router.get('/', authenticateToken,(req, res) => {
    db.connection.query('SELECT * FROM Group_order', (err, results) => {
        if (err) {
            console.error('Error fetching group orders:', err);
            return res.status(500).json({ error: 'Failed to fetch group orders' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No group orders found' });
        }

        res.json(results);
    });
});

// POST /api/group-orders
router.post('/', authenticateToken,(req, res) => {
    const groupOrderData = req.body; // Assuming JSON payload with group order data

    // Validate groupOrderData
    if (!groupOrderData.restaurant_id || !groupOrderData.group_owner_id || !groupOrderData.status) {
        return res.status(400).json({ error: 'Restaurant_id, group_owner_id, and status are required!' });
    }

    // Insert groupOrderData into the database
    const sql = 'INSERT INTO Group_order (restaurant_id, group_owner_id, status, invitation_code, payment_method, payment_status, payment_type, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [groupOrderData.restaurant_id, groupOrderData.group_owner_id, groupOrderData.status, groupOrderData.invitation_code || null, groupOrderData.payment_method || null, groupOrderData.payment_status || null, groupOrderData.payment_type || null, groupOrderData.total_amount || null];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting group order:', err);
            return res.status(500).json({ error: err.message });
        }

        const insertedGroupOrder = {
            group_order_id: result.insertId,
            restaurant_id: groupOrderData.restaurant_id,
            group_owner_id: groupOrderData.group_owner_id,
            status: groupOrderData.status,
            invitation_code: groupOrderData.invitation_code || null,
            payment_method: groupOrderData.payment_method || null,
            payment_status: groupOrderData.payment_status || null,
            payment_type: groupOrderData.payment_type || null,
            total_amount: groupOrderData.total_amount || null
        };

        res.json({ message: 'Group order created successfully', group_order: insertedGroupOrder });
    });
});

module.exports = router;
