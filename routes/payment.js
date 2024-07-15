const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection or ORM setup
const authenticateToken = require('../middleware/authenticateToken');

// GET /api/payments
router.get('/', authenticateToken, (req, res) => {
    db.connection.query('SELECT * FROM Payments', (err, results) => {
        if (err) {
            console.error('Error fetching payments:', err);
            return res.status(500).json({ error: 'Failed to fetch payments' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No payments found' });
        }

        res.json(results);
    });
});

// POST /api/payments
router.post('/',authenticateToken, (req, res) => {
    const paymentData = req.body; // Assuming JSON payload with payment data

    // Validate paymentData
    if (!paymentData.order_id || !paymentData.amount || !paymentData.payment_method || !paymentData.payment_status) {
        return res.status(400).json({ error: 'Order_id, amount, payment_method, and payment_status are required!' });
    }

    // Insert paymentData into the database
    const sql = 'INSERT INTO Payments (order_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?)';
    const values = [paymentData.order_id, paymentData.amount, paymentData.payment_method, paymentData.payment_status];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting payment:', err);
            return res.status(500).json({ error: err.message });
        }

        const insertedPayment = {
            payment_id: result.insertId,
            order_id: paymentData.order_id,
            amount: paymentData.amount,
            payment_method: paymentData.payment_method,
            payment_status: paymentData.payment_status
        };

        res.json({ message: 'Payment created successfully', payment: insertedPayment });
    });
});

module.exports = router;
