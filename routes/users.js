const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection or ORM setup

// GET /api/users
router.get('/', (req, res) => {
    // Assuming you have a function in your db module to fetch all users
    db.connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }

        // If no users found
        if (results.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        // If users found, return them
        res.json(results);
    });
});

// Default role ID for regular users
const DEFAULT_ROLE_ID = 1; // Assuming role_id 1 is for regular users

// POST /api/users
router.post('/', (req, res) => {
    const userData = req.body; // Assuming JSON payload

    // Validate userData
    if (!userData.name || !userData.email || !userData.password || !userData.phone) {
        return res.status(400).json({ error: 'Name, email, password, and phone are required' });
    }

    // Set role_id to default if not provided in request body
    const role_id = userData.role_id || DEFAULT_ROLE_ID;

    const sql = 'INSERT INTO Users (name, email, password, phone, role_id) VALUES (?, ?, ?, ?, ?)';
    const values = [userData.name, userData.email, userData.password, userData.phone, role_id];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ error: err.message });
        }

        const insertedUser = {
            user_id: result.insertId,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role_id: role_id
            // Add other fields as needed
        };

        res.json({ message: 'User created successfully', user: insertedUser });
    });
});

module.exports = router;
