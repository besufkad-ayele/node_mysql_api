const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection or ORM setup
const authenticateToken = require('../middleware/authenticateToken');

router.get('/',authenticateToken, (req, res) => {
    // Assuming you have a function in your db module to fetch all users
    db.connection.query('SELECT * FROM category', (err, results) => {
        if (err) {
            console.error('Error fetching category:', err);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
        // If no users found
        if (results.length === 0) {
            return res.status(404).json({ message: 'No category found' });
        }
        // If users found, return them
        res.json(results);
    });
});
// POST /api/categories
router.post('/', authenticateToken,(req, res) => {
    const categoryData = req.body; // Assuming JSON payload with category data

    // Validate categoryData
    if (!categoryData.category_name || !categoryData.category_type) {
        return res.status(400).json({ error: 'Category name and type are required!' });
    }

    // Example: Insert categoryData into the database
    const sql = 'INSERT INTO Category (category_name, category_type) VALUES (?, ?)';
    const values = [categoryData.category_name, categoryData.category_type];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting category:', err);
            return res.status(500).json({ error: 'Failed to create category' });
        }

        const insertedCategory = {
            category_id: result.insertId,
            category_name: categoryData.category_name,
            category_type: categoryData.category_type
        };

        res.json({ message: 'Category created successfully', category: insertedCategory });
    });
});

module.exports = router;
