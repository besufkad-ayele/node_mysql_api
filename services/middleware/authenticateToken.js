const jwt = require('jsonwebtoken');
require('dotenv').config();

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

const checkRole = (role_id) => {
    return (req, res, next) => {
        console.log(req.user);
        console.log(req.user.role_id);
        console.log(role_id);
        if (req.user && req.user.role_id === role_id) {
            next();
        } else {
            res.sendStatus(403); // Forbidden if the user role does not match
        }
    };
};

module.exports = {
    authenticateToken,
    checkRole
};
