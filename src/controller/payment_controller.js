const db = require('../config/db');

exports.getAllPayments = (req, res) => {
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
};

exports.createPayment = (req, res) => {
    const paymentData = req.body;

    // Validate paymentData
    if (!paymentData.order_id || !paymentData.amount || !paymentData.payment_method || !paymentData.payment_status) {
        return res.status(400).json({ error: 'Order_id, amount, payment_method, and payment_status are required!' });
    }

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
};
