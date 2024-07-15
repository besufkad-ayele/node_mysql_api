const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection or ORM setup

// GET /api/orders
router.get('/', (req, res) => {
    db.connection.query('SELECT * FROM Orders', (err, results) => {
        if (err) {
            console.error('Error fetching Orders:', err);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        res.json(results);
    });
});

// POST /api/orders
router.post('/', (req, res) => {
    const orderData = req.body; // Assuming JSON payload with order data

    // Validate orderData
    if (!orderData.user_id || !orderData.restaurant_id || !orderData.order_total || !orderData.delivery_status) {
        return res.status(400).json({ error: 'User_id, restaurant_id, order_total, and delivery_status are required!' });
    }

    // Insert orderData into the database
    const sql = 'INSERT INTO Orders (user_id, restaurant_id, driver_id, order_total, delivery_status) VALUES (?, ?, ?, ?, ?)';
    const values = [orderData.user_id, orderData.restaurant_id, orderData.driver_id || null, orderData.order_total, orderData.delivery_status];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting Order:', err);
            return res.status(500).json({ error: err.message });
        }

        const insertedOrder = {
            order_id: result.insertId,
            user_id: orderData.user_id,
            restaurant_id: orderData.restaurant_id,
            driver_id: orderData.driver_id || null,
            order_total: orderData.order_total,
            delivery_status: orderData.delivery_status
        };

        res.json({ message: 'Order created successfully', order: insertedOrder });
    });
});

module.exports = router;
