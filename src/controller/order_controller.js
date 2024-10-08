const db = require('../config/db');

exports.getAllOrders = (req, res) => {
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
};

exports.getOrderById = (req, res) => {
    const orderId = req.params.id;
    db.connection.query('SELECT * FROM Orders WHERE order_id = ?', [orderId], (err, results) => {
        if (err) {
            console.error('Error fetching Order:', err);
            return res.status(500).json({ error: 'Failed to fetch order' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(results[0]);
    });
};

exports.getOrdersByUserId = (req, res) => {
    const userId = req.params.id;
    db.connection.query('SELECT * FROM Orders WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching Orders:', err);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        res.json(results);
    });
};

exports.createOrder = (req, res) => {
    const orderData = req.body;

    // Validate orderData
    if (!orderData.user_id || !orderData.restaurant_id || !orderData.order_total || !orderData.delivery_status) {
        return res.status(400).json({ error: 'User_id, restaurant_id, order_total, and delivery_status are required!' });
    }

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
};

exports.updateOrder = (req, res) => {
    const orderId = req.params.id;
    const orderData = req.body;

    // Validate orderData
    if (!orderData.delivery_status) {
        return res.status(400).json({ error: 'delivery_status is required!' });
    }

    const sql = 'UPDATE Orders SET delivery_status = ? WHERE order_id = ?';
    db.connection.query(sql, [orderData.delivery_status, orderId], (err, result) => {
        if (err) {
            console.error('Error updating Order:', err);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order updated successfully' });
    });
};

exports.deleteOrder = (req, res) => {
    const orderId = req.params.id;

    db.connection.query('DELETE FROM Orders WHERE order_id = ?', [orderId], (err, result) => {
        if (err) {
            console.error('Error deleting Order:', err);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    });
};
