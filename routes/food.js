const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection or ORM setup
const authenticateToken = require('../middleware/authenticateToken');

// GET /api/food
router.get('/', (req, res) => {
    db.connection.query('SELECT * FROM Food', (err, results) => {
        if (err) {
            console.error('Error fetching Food:', err);
            return res.status(500).json({ error: 'Failed to fetch food' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No food found' });
        }

        res.json(results);
    });
});

// POST /api/food
router.post('/', authenticateToken, (req, res) => {
    const foodData = req.body; // Assuming JSON payload with food data

    // Validate foodData
    if (!foodData.name || !foodData.category_id || !foodData.price || !foodData.content_id || !foodData.restaurant_id) {
        return res.status(400).json({ error: 'Name, category_id, price, content_id, and restaurant_id are required!' });
    }

    // Insert foodData into the database
    const sql = 'INSERT INTO Food (name, category_id, image, price, content_id, discount, restaurant_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [foodData.name, foodData.category_id, foodData.image || null, foodData.price, foodData.content_id, foodData.discount || 0, foodData.restaurant_id];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting Food:', err);
            return res.status(500).json({ error: err.message });
        }

        const insertedFood = {
            food_id: result.insertId,
            name: foodData.name,
            category_id: foodData.category_id,
            image: foodData.image || null,
            price: foodData.price,
            content_id: foodData.content_id,
            discount: foodData.discount || 0,
            restaurant_id: foodData.restaurant_id
        };

        res.json({ message: 'Food created successfully', food: insertedFood });
    });
});

module.exports = router;
