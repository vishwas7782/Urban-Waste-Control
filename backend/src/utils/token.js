const jwt = require('jsonwebtoken');

// Short-lived token embedded in the email verification link.
const generateVerificationToken = (email) =>
    jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

// Auth token returned on login.
const signAuthToken = (user) =>
    jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

module.exports = { generateVerificationToken, signAuthToken };
