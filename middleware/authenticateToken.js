// middleware/authenticateToken.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
                                        
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

module.exports = authenticateToken;
