const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection or ORM setup

router.get('/', (req, res) => {
    db.connection.query('SELECT * FROM address', (err, results) => {
        if (err) {
            console.error('Error fetching Restaurants:', err);
            return res.status(500).json({ error: 'Failed to fetch address' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No address found' });
        }

        res.json(results);
    });
});
 
// POST /api/address
router.post('/', (req, res) => {
    const addressData = req.body; // Assuming JSON payload with address data

    // Validate addressData
    if (!addressData.state || !addressData.city || !addressData.street || !addressData.latitude || !addressData.longitude || (!addressData.user_id && !addressData.restaurant_id)) {
        return res.status(400).json({ error: 'State, city, street, latitude, longitude, and either user_id or restaurant_id are required!' });
    }

    // Insert addressData into the database
    const sql = 'INSERT INTO Address (state, city, street, latitude, longitude, user_id, restaurant_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [addressData.state, addressData.city, addressData.street, addressData.latitude, addressData.longitude, addressData.user_id || null, addressData.restaurant_id || null];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting Address:', err);
            return res.status(500).json({ error: err.message });
        }

        const insertedAddress = {
            address_id: result.insertId,
            state: addressData.state,
            city: addressData.city,
            street: addressData.street,
            latitude: addressData.latitude,
            longitude: addressData.longitude,
            user_id: addressData.user_id || null,
            restaurant_id: addressData.restaurant_id || null
        };

        res.json({ message: 'Address created successfully', address: insertedAddress });
    });
});

module.exports = router;
