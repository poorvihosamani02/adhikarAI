const jwt = require('jsonwebtoken');

/**
 * Authentication middleware that verifies JWT from Authorization header.
 * Attaches verified userId to req.userId.
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            message: 'Access denied. Bearer token missing or malformed.'
        });
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is missing from environment variables.');
        return res.status(500).json({
            status: 'error',
            message: 'Server authentication configuration error.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token payload.'
            });
        }

        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token.'
        });
    }
}

module.exports = authenticateToken;
