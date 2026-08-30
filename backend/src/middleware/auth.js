const jwt = require('jsonwebtoken');

// Authenticate a request using a JWT.
// Accepts either "Authorization: Bearer <token>" or a raw "<token>" header
// (the legacy client sent the raw token, the new client sends Bearer).
const authenticateToken = (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header) {
        return res.status(401).json({ success: false, message: 'Access Denied. No token provided.' });
    }

    // Strip an optional "Bearer " prefix.
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : header.trim();

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid token or expired' });
        }

        req.userId = decoded.userId; // Attach the user ID to the request
        req.userRole = decoded.role; // Attach the user role
        next();
    });
};

// Guard a route so only a given role may access it.
// Usage: router.get('/x', authenticateToken, requireRole('municipal'), handler)
const requireRole = (role) => (req, res, next) => {
    if (req.userRole !== role) {
        const label = role === 'municipal' ? 'Municipal employees only' : 'Public users only';
        return res.status(403).json({ success: false, message: `Access Denied: ${label}` });
    }
    next();
};

module.exports = { authenticateToken, requireRole };
