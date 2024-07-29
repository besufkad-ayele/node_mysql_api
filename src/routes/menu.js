const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { authenticateToken, checkRole } = require('../../services/middleware/authenticateToken');

// GET /api/menu
router.get('/', (req, res) => {
    db.connection.query('SELECT * FROM Menu', (err, results) => {
        if (err) {
            console.error('Error fetching Menu:', err);
            return res.status(500).json({ error: 'Failed to fetch menu' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No menu found' });
        }

        res.json(results);
    });
});

// POST /api/menu
router.post('/', (req, res) => {
    const menuData = req.body; // Assuming JSON payload with menu data

    // Validate menuData
    if (!menuData.restaurant_id || !menuData.food_id || !menuData.price) {
        return res.status(400).json({ error: 'Restaurant_id, food_id, and price are required!' });
    }

    // Insert menuData into the database
    const sql = 'INSERT INTO Menu (restaurant_id, food_id, price) VALUES (?, ?, ?)';
    const values = [menuData.restaurant_id, menuData.food_id, menuData.price];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting Menu:', err);
            return res.status(500).json({ error: err.message });
        }

        const insertedMenu = {
            menu_id: result.insertId,
            restaurant_id: menuData.restaurant_id,
            food_id: menuData.food_id,
            price: menuData.price
        };

        res.json({ message: 'Menu created successfully', menu: insertedMenu });
    });
});

module.exports = router;
