const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection or ORM setup

router.get('/', (req, res) => {
    db.connection.query('SELECT * FROM Restaurants', (err, results) => {
        if (err) {
            console.error('Error fetching Restaurants:', err);
            return res.status(500).json({ error: 'Failed to fetch restaurants' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No restaurants found' });
        }

        res.json(results);
    });
});
 
// POST /api/restaurants
router.post('/', (req, res) => {
    const restaurantData = req.body; // Assuming JSON payload with restaurant data
    // Validate restaurantData
    if (!restaurantData.name || !restaurantData.phone || !restaurantData.category_id ) {
        return res.status(400).json({ error: 'Restaurant name, phone, category_id are required!' });
    }

    // Insert restaurantData into the database
    const sql = 'INSERT INTO Restaurants (name, category_id, phone) VALUES (?, ?, ?)';
    const values = [restaurantData.name, restaurantData.category_id, restaurantData.phone];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting Restaurant:', err);
            return res.status(500).json({ error: err.message });
        }

        const insertedRestaurant = {
            restaurant_id: result.insertId,
            name: restaurantData.name,
            phone: restaurantData.phone,
            category_id: restaurantData.category_id
        };

        res.json({ message: 'Restaurant created successfully', restaurant: insertedRestaurant });
    });
});

module.exports = router;
