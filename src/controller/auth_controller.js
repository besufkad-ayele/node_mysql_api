const jwt = require('jsonwebtoken');
let refreshTokens = []; // In-memory store for refresh tokens

exports.token = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid refresh token' });
        }

        const accessToken = generateAccessToken({ id: user.id, email: user.email });
        res.json({ accessToken });
    });
};

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
}
