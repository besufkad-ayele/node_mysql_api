const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { authenticateToken } = require('./middlewares');
const router = express.Router();

let refreshTokens = []; // This should be stored in a database in a real application

// Middleware to authenticate the refresh token
const authenticateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

router.post('/refreshPath', authenticateRefreshToken, (req, res) => {
  const { user } = req;
  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  res.json({ accessToken });
});

module.exports = router;
