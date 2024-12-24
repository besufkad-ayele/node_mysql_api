const express = require('express');
const router = express.Router();
require('dotenv').config();
const db = require('../config/db');

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { authenticateToken, checkRole } = require('../middleware/authenticateToken');

let refreshTokens = [];
// Login with Email
router.post('/login/email', checkRole(1), asyncHandler(async (req, res) => {
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
        res.json({ success: true, message: 'Login successful.', accessToken, refreshToken,data:user });
    });
}));

router.post('/login/driver/email', checkRole(2), asyncHandler(async (req, res) => {
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
        res.json({ success: true, message: 'Login successful.', accessToken, refreshToken,data:user });
    });
}));

// Get all users
router.get('/',asyncHandler(async (req, res) => {
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

// Helper function to execute a query and return a promise
function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.connection.query(query, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}
// Get user profile based on role and id
router.get('/profile/:id', asyncHandler(async (req, res) => {
    const userId = req.params.id; // Get user_id from the URL parameter

    if (!userId) {
        console.log('User ID is missing:', userId);
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    console.log('User ID:', userId);

    try {
        // Fetch user details
        const userQueryResult = await executeQuery('SELECT * FROM Users WHERE user_id = ?', [userId]);
        console.log('User Query Result:', userQueryResult);

        if (userQueryResult.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = userQueryResult[0]; // Access the first result object
        console.log('User:', user);

        if (user.role_id === 1) { // If the user is a Customer
            const customerQueryResult = await executeQuery('SELECT * FROM Customer WHERE user_id = ?', [userId]);
            console.log('Customer Query Result:', customerQueryResult);

            if (customerQueryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'Customer profile not found' });
            }

            const customer = customerQueryResult[0];

            // Fetch customer address
            const customerAddressResult = await executeQuery('SELECT * FROM Customer_Address WHERE user_id = ?', [userId]);
            console.log('Customer Address Result:', customerAddressResult);

            const customerAddress = customerAddressResult.length > 0 ? customerAddressResult[0] : null;

            res.json({
                success: true,
                message: 'Customer profile retrieved successfully.',
                data: {
                    user_id: user.user_id,
                    email: user.email,
                    phone: user.phone,
                    name: customer.name,
                    image: customer.image,
                    address: customerAddress ? {
                        street: customerAddress.street,
                        city: customerAddress.city,
                        state: customerAddress.state,
                        zip_code: customerAddress.zip_code,
                    } : null
                }
            });
        } else if (user.role_id === 2) { // If the user is a Driver
            const driverQueryResult = await executeQuery('SELECT * FROM Drivers WHERE user_id = ?', [userId]);
            console.log('Driver Query Result:', driverQueryResult);

            if (driverQueryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'Driver profile not found' });
            }

            const driver = driverQueryResult[0];
            res.json({
                success: true,
                message: 'Driver profile retrieved successfully.',
                data: {
                    user_id: user.user_id,
                    email: user.email,
                    phone: user.phone,
                    name: driver.name,
                    image: driver.image,
                    location: driver.location,
                    driver_type: driver.driver_type
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user role' });
        }
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch profile due to server error' });
    }
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

// Register a new user
router.post('/register', asyncHandler(async (req, res) => {
    const {email, password, phone, role_id } = req.body;

    // Check if at least one of email or phone is provided
    if (!(email)) {
        return res.status(400).json({ success: false, message: ' email is required.' });
    }
    
    // Ensure required fields are provided
    if (!password) {
        return res.status(400).json({ success: false, message: ' password is required.' });
    }

    // Set default role_id to 1 if not provided
    const defaultRoleId = role_id || 1;

    // Construct SQL query and values based on provided fields
    let sql, values;
    if (email && phone) {
        sql = 'INSERT INTO Users (  email, password, phone, role_id) VALUES (  ?, ?, ?,?)';
        values = [ email, password, phone, defaultRoleId];
    } else if (email) {
        sql = 'INSERT INTO Users ( email, password, role_id) VALUES ( ?, ?, ?)';
        values = [email, password, defaultRoleId];
    } else if (phone) {
        sql = 'INSERT INTO Users ( password, phone, role_id) VALUES ( ?, ?, ?)';
        values = [ password, phone, defaultRoleId];
    }

    // Execute the SQL query
    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ success: false, message: err.message });
        }

        const user = { user_id: result.insertId, email, phone };
        const accessToken = generateAccessToken({ user_id: user.user_id, email: user.email });
        const refreshToken = jwt.sign({ user_id: user.user_id, email: user.email }, process.env.REFRESH_TOKEN_SECRET);

        refreshTokens.push(refreshToken);
        res.json({ success: true, message: 'User created successfully.', accessToken, refreshToken });
    });
}));

// Update a user
router.put('/:id', asyncHandler(async (req, res) => {
    const userID = req.params.id;
    const { name, email, password, phone, role_id } = req.body;

    // Create an array to hold query parts and values
    let updateFields = [];
    let values = [];

    // Append fields to the query and values array if provided
    if (name) {
        updateFields.push('name = ?');
        values.push(name);
    }
    if (email) {
        updateFields.push('email = ?');
        values.push(email);
    }
    if (password) {
        updateFields.push('password = ?');
        values.push(password);
    }
    if (phone) {
        updateFields.push('phone = ?');
        values.push(phone);
    }
    if (role_id) {
        updateFields.push('role_id = ?');
        values.push(role_id);
    }

    // Check if any fields are provided to update
    if (updateFields.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    // Add the user ID to the values array
    values.push(userID);

    // Construct the SQL query
    const sql = `UPDATE Users SET ${updateFields.join(', ')} WHERE user_id = ?`;

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
// Logout
//user using token can logout
router.post('/logout', (req, res) => {
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    res.json({ success: true, message: 'Logout successful.',data:refreshTokens });
});

router.get('/email/:email', asyncHandler(async (req, res) => {
    const email = req.params.email;

    db.connection.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
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

//get method to print respond message of working here
      router.get('/verifytoken/getuser',  authenticateToken,(req, res) => {
        email = req.user.email;
        
        //checke for email form database 
        db.connection.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
            if (err) {
                console.error('Error fetching user:', err);
                return res.status(500).json({ success: false, message: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ success: false, message: 'No users found' });
            }
            res.json({ success: true, message: 'API is working', data: results[0] });
        });
    });



function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}
module.exports = router;
