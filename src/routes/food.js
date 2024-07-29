const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { authenticateToken, checkRole } = require('../../services/middleware/authenticateToken');

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
// GET /api/food/:id    
router.get('/:id', (req, res) => {
    const foodId = req.params.id;
    db.connection.query('SELECT * FROM Food WHERE food_id = ?', [foodId], (err, results) => {
        if (err) {
            console.error('Error fetching Food:', err);
            return res.status(500).json({ error: 'Failed to fetch food' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.json(results[0]);
    });
});

// PUT /api/food/:id    
router.put('/:id', authenticateToken, (req, res) => {
    const foodId = req.params.id;
    const foodData = req.body; // Assuming JSON payload with food data

    // Validate foodData
    if (!foodData.name && !foodData.category_id && !foodData.price && !foodData.content_id && !foodData.restaurant_id) {
        return res.status(400).json({ error: 'Name, category_id, price, content_id, and restaurant_id are required!' });
    }

    // Update foodData in the database
    const sql = 'UPDATE Food SET ? WHERE food_id = ?';
    db.connection.query(sql, [foodData, foodId], (err, result) => {
        if (err) {
            console.error('Error updating Food:', err);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.json({ message: 'Food updated successfully' });
    });
});

// DELETE /api/food/:id
router.delete('/:id', authenticateToken, (req, res) => {
    const foodId = req.params.id;

    db.connection.query('DELETE FROM Food WHERE food_id = ?', [foodId], (err, result) => {
        if (err) {
            console.error('Error deleting Food:', err);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.json({ message: 'Food deleted successfully' });
    });
});


module.exports = router;
