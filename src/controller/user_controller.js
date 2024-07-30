//here we left it comment because we are using the old and unstructured way of code


// const db = require('../../config/db');
// const jwt = require('jsonwebtoken');
// const asyncHandler = require('express-async-handler');

// let refreshTokens = []; // In-memory store for refresh tokens

// const generateAccessToken = (user) => {
//     return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
// };

// exports.loginByEmail = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;

//     db.connection.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
//         if (err) {
//             console.error('Error fetching user:', err);
//             return res.status(500).json({ success: false, message: err.message });
//         }

//         if (results.length === 0 || results[0].password !== password) {
//             return res.status(401).json({ success: false, message: 'Invalid email or password.' });
//         }

//         const user = results[0];
//         const accessToken = generateAccessToken({ id: user.id, email: user.email });
//         const refreshToken = jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET);

//         refreshTokens.push(refreshToken);
//         res.json({ success: true, message: 'Login successful.', accessToken, refreshToken });
//     });
// });

// exports.getAllUsers = asyncHandler(async (req, res) => {
//     db.connection.query('SELECT * FROM Users', (err, results) => {
//         if (err) {
//             console.error('Error fetching users:', err);
//             return res.status(500).json({ success: false, message: 'Failed to fetch users' });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ success: false, message: 'No users found' });
//         }

//         res.json({ success: true, message: 'Users retrieved successfully.', data: results });
//     });
// });

// exports.loginByPhone = asyncHandler(async (req, res) => {
//     const { phone, password } = req.body;

//     db.connection.query('SELECT * FROM Users WHERE phone = ?', [phone], (err, results) => {
//         if (err) {
//             console.error('Error fetching user:', err);
//             return res.status(500).json({ success: false, message: err.message });
//         }

//         if (results.length === 0 || results[0].password !== password) {
//             return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
//         }

//         const user = results[0];
//         const accessToken = generateAccessToken({ id: user.user_id, phone: user.phone });
//         const refreshToken = jwt.sign({ id: user.user_id, phone: user.phone }, process.env.REFRESH_TOKEN_SECRET);

//         refreshTokens.push(refreshToken);
//         res.status(200).json({ success: true, message: 'Login successful.', data: user, accessToken, refreshToken });
//     });
// });

// exports.getUserById = asyncHandler(async (req, res) => {
//     const userID = req.params.id;

//     db.connection.query('SELECT * FROM Users WHERE user_id = ?', [userID], (err, results) => {
//         if (err) {
//             console.error('Error fetching user:', err);
//             return res.status(500).json({ success: false, message: err.message });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ success: false, message: 'User not found.' });
//         }

//         res.json({ success: true, message: 'User retrieved successfully.', data: results[0] });
//     });
// });

// exports.registerUser = asyncHandler(async (req, res) => {
//     const { name, email, password, phone, role_id } = req.body;

//     if (!(email || phone)) {
//         return res.status(400).json({ success: false, message: 'Either email or phone is required.' });
//     }

//     if (!name || !password) {
//         return res.status(400).json({ success: false, message: 'Name, password, and either email or phone are required.' });
//     }

//     const defaultRoleId = role_id || 1;

//     let sql, values;
//     if (email && phone) {
//         sql = 'INSERT INTO Users (name, email, password, phone, role_id) VALUES (?, ?, ?, ?, ?)';
//         values = [name, email, password, phone, defaultRoleId];
//     } else if (email) {
//         sql = 'INSERT INTO Users (name, email, password, role_id) VALUES (?, ?, ?, ?)';
//         values = [name, email, password, defaultRoleId];
//     } else if (phone) {
//         sql = 'INSERT INTO Users (name, password, phone, role_id) VALUES (?, ?, ?, ?)';
//         values = [name, password, phone, defaultRoleId];
//     }

//     db.connection.query(sql, values, (err, result) => {
//         if (err) {
//             console.error('Error inserting user:', err);
//             return res.status(500).json({ success: false, message: err.message });
//         }

//         const user = { id: result.insertId, name, email, phone };
//         const accessToken = generateAccessToken({ id: user.id, email: user.email });
//         const refreshToken = jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET);

//         refreshTokens.push(refreshToken);
//         res.json({ success: true, message: 'User created successfully.', accessToken, refreshToken });
//     });
// });

// exports.updateUser = asyncHandler(async (req, res) => {
//     const userID = req.params.id;
//     const { name, email, password, phone, role_id } = req.body;

//     if (!name || !email || !password || !phone) {
//         return res.status(400).json({ success: false, message: 'Name, email, password, and phone are required.' });
//     }

//     const sql = 'UPDATE Users SET name = ?, email = ?, password = ?, phone = ?, role_id = ? WHERE user_id = ?';
//     const values = [name, email, password, phone, role_id || defaultRoleId, userID];

//     db.connection.query(sql, values, (err, result) => {
//         if (err) {
//             console.error('Error updating user:', err);
//             return res.status(500).json({ success: false, message: err.message });
//         }

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ success: false, message: 'User not found.' });
//         }

//         res.json({ success: true, message: 'User updated successfully.' });
//     });
// });

// exports.deleteUser = asyncHandler(async (req, res) => {
//     const userID = req.params.id;

//     db.connection.query('DELETE FROM Users WHERE user_id = ?', [userID], (err, result) => {
//         if (err) {
//             console.error('Error deleting user:', err);
//             return res.status(500).json({ success: false, message: err.message });
//         }

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ success: false, message: 'User not found.' });
//         }

//         res.json({ success: true, message: 'User deleted successfully.' });
//     });
// });

// exports.logout = (req, res) => {
//     const refreshToken = req.body.token;
//     refreshTokens = refreshTokens.filter(token => token !== refreshToken);
//     res.json({ success: true, message: 'Logout successful.', data: refreshTokens });
// };

// // You can uncomment the refresh token logic if needed in the future
// // exports.refreshToken = asyncHandler(async (req, res) => {
// //     const refreshToken = req.body.token;
// //     if (!refreshToken) {
// //         return res.status(401).json({ success: false, message: 'Refresh token required.' });
// //     }

// //     if (!refreshTokens.includes(refreshToken)) {
// //         return res.status(403).json({ success: false, message: 'Invalid refresh token.' });
// //     }

// //     jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
// //         if (err) {
// //             return res.status(403).json({ success: false, message: 'Invalid refresh token.' });
// //         }

// //         const accessToken = generateAccessToken({ id: user.id, email: user.email });
// //         res.json({ success: true, accessToken });
// //     });
// // });
