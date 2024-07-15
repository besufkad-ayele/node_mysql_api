const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection or ORM setup
const authenticateToken = require('../middleware/authenticateToken');

// GET /api/users
router.get('/', authenticateToken, (req, res) => {
    // Assuming you have a function in your db module to fetch all users
    db.connection.query('SELECT * FROM role', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }

        // If no users found
        if (results.length === 0) {
            return res.status(404).json({ message: 'No role found' });
        }

        // If users found, return them
        res.json(results);
    });
});
// POST /api/role
router.post('/',authenticateToken, (req, res) => {
    const roleData = req.body; // Assuming JSON payload

    // Validate roleData
    if (!roleData.role_name) {
        return res.status(400).json({ error: 'Role name required!' });
    }

    // Example: Insert roleData into the database
    const sql = 'INSERT INTO role (role_name) VALUES (?)';
    const values = [roleData.role_name];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting role:', err);
            return res.status(500).json({ error: 'Failed to create role' });
        }

        const insertedRole = {
            role_id: result.insertId,
            role_name: roleData.role_name
        };

        res.json({ message: 'Role created successfully', role: insertedRole });
    });
});

module.exports = router;
