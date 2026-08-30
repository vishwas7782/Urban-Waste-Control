const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { generateVerificationToken, signAuthToken } = require('../utils/token');
const { sendVerificationEmail } = require('../utils/email');
const jwt = require('jsonwebtoken');

// POST /signup
exports.signup = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Name, email, password and role are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    const token = generateVerificationToken(email);

    try {
        await sendVerificationEmail(name, email, token);
    } catch (error) {
        console.error('Error sending verification email:', error);
        return res.status(500).json({ success: false, message: 'Error sending verification email' });
    }

    res.status(201).json({ success: true, message: 'Signup successful. Please check your email for verification.' });
});

// GET /verify-email?token=...
exports.verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.verified) {
        return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
});

// POST /login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ success: false, message: 'User not found' });
    }
    if (!user.verified) {
        return res.status(403).json({ success: false, message: 'Please verify your email before logging in' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signAuthToken(user);
    res.status(200).json({ success: true, token, role: user.role, message: 'Login successful' });
});

// POST /logout — JWTs are stateless, so nothing to invalidate server-side.
exports.logout = (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
};
