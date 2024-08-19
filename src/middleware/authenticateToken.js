const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../config/db');
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // console.log("user", user);

    if (token == null) {
        return res.sendStatus(401); // If there's no token, return Unauthorized
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => { 
        if (err) {
            return res.sendStatus(403); // If the token is invalid, return Forbidden
        }   
        req.user = user;
        next();
    });
};

const checkRole = (requiredRoleId) => {
    return (req, res, next) => {
        console.log("req", req.body);
        const email = req.user?.email || req.body.email;
        if (!email) return res.status(401).json({ message: 'Unauthorized: No email provided' });

        // Fetch user from the database by email
        db.connection.query('SELECT role_id FROM Users WHERE email = ?', [email], (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                return res.status(500).json({ message: 'Database error' });
            }

            if (results.length === 0) return res.status(404).json({ message: 'User not found' });

            const userRoleId = results[0].role_id;
            if (userRoleId === requiredRoleId) {
                return next();
            } else {
                return res.sendStatus(403); // Forbidden if the user role does not match
            }
        });
    };
};



module.exports = {
    authenticateToken,
    checkRole
};
