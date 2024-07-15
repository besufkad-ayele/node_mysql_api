const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection or ORM setup
require('dotenv').config();
const authenticateToken = require('../middleware/authenticateToken');

// Default role ID for regular users
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const DEFAULT_ROLE_ID = 1; // Assuming role_id 1 is for regular users

let refreshTokens = []; // In-memory store for refresh tokens

router.post('/login/email', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    db.connection.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ success: false, message: err.message });
        }

        if (results.length === 0 || results[0].password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = results[0];
        const accessToken = generateAccessToken({ id: user.id, email: user.email });
        const refreshToken = jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET);

        refreshTokens.push(refreshToken);
        res.json({ success: true, message: 'Login successful.', accessToken, refreshToken });
    });
}));

// Get all users (protected route)
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    db.connection.query('SELECT * FROM Users', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch users' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'No users found' });
        }

        res.json({ success: true, message: 'Users retrieved successfully.', data: results });
    });
}));


// Login with Phone Number
router.post('/login/phone', asyncHandler(async (req, res) => {
    const { phone, password } = req.body;

    try {
        // Query database for user with matching phone number
        const query = 'SELECT * FROM Users WHERE phone = ?';
        db.connection.query(query, [phone], (err, results) => {
            if (err) {
                console.error('Error fetching user:', err);
                return res.status(500).json({ success: false, message: err.message });
            }

            if (results.length === 0 || results[0].password !== password) {
                return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
            }

            // User found and password matches, generate JWT token
            const user = results[0];
            const accessToken = jwt.sign({ id: user.user_id, phone: user.phone }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h' // Token expiration time
            });
            const refreshToken = jwt.sign({ id: user.id, phone: user.phone }, process.env.REFRESH_TOKEN_SECRET);

            refreshTokens.push(refreshToken);
            res.status(200).json({ success: true, message: 'Login successful.', data: user, accessToken , refreshToken });
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
}));


// Get a user by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const userID = req.params.id;

    db.connection.query('SELECT * FROM Users WHERE user_id = ?', [userID], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ success: false, message: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const user = results[0];
        res.json({ success: true, message: 'User retrieved successfully.', data: user });
    });
}));

// Create a new user
router.post('/register', asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({ success: false, message: 'Name, email, password, and phone are required.' });
    }

    const sql = 'INSERT INTO Users (name, email, password, phone) VALUES (?, ?, ?, ?)';
    const values = [name, email, password, phone];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ success: false, message: err.message });
        }

        const user = { id: result.insertId, name, email, phone };
        const accessToken = generateAccessToken({ id: user.id, email: user.email });
        const refreshToken = jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET);

        refreshTokens.push(refreshToken);
        res.json({ success: true, message: 'User created successfully.', accessToken, refreshToken });
    });
}));


// Update a user
router.put('/:id', asyncHandler(async (req, res) => {
    const userID = req.params.id;
    const { name, email, password, phone, role_id } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({ success: false, message: 'Name, email, password, and phone are required.' });
    }

    const sql = 'UPDATE Users SET name = ?, email = ?, password = ?, phone = ?, role_id = ? WHERE user_id = ?';
    const values = [name, email, password, phone, role_id || DEFAULT_ROLE_ID, userID];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ success: false, message: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.json({ success: true, message: 'User updated successfully.' });
    });
}));

// Delete a user
router.delete('/:id', asyncHandler(async (req, res) => {
    const userID = req.params.id;

    db.connection.query('DELETE FROM Users WHERE user_id = ?', [userID], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ success: false, message: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.json({ success: true, message: 'User deleted successfully.' });
    });
}));

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}
module.exports = router;
