const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

// Initialize the app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// JWT Secret Key
const JWT_SECRET = 's3cureR@ndomStr1ngTh@tI5VerySecret12345678!';

// MongoDB Connection (Local)
const connectDB = async () => {
    try {
        const uri = 'mongodb://localhost:27017/Urban-db'; // Local MongoDB connection string
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected locally');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process with failure
    }
};

// Call the connect function
connectDB();

// Define Schemas
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String, // 'user' or 'municipal'
    verified: { type: Boolean, default: false } // Email verification status
});

const concernSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    houseNumber: String,
    locality: String,
    mobileNum: String,
    issueType: String,
    additionalDetails: String,
    status: { type: String, default: 'pending' }, // 'pending' or 'resolved'
});

const scheduleSchema = new mongoose.Schema({
    employeeName: String,
    area: String,
    day: String,
    date: String,
    time: String,
});

// Models
const User = mongoose.model('User', userSchema);
const Concern = mongoose.model('Concern', concernSchema);
const Schedule = mongoose.model('Schedule', scheduleSchema);

// Multer setup for file uploads (e.g., images for garbage reporting)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error('Invalid file type');
        return cb(error, false);
    }
    cb(null, true);
};

const upload = multer({
    dest: 'uploads/',
    fileFilter
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ success: false, message: 'Access Denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token or expired' });

        req.userId = decoded.userId; // Attach the user ID to the request object
        req.userRole = decoded.role; // Attach the user role
        next(); // Move to the next middleware/route
    });
};

// Verification Mail Setup
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'urbanwastecontrol@gmail.com', // Your email
        pass: 'tzgs qidz vgrd lxac' // Your email password or app password
    }
});

// Generate Verification Token
const generateVerificationToken = (email) => {
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
};

// User Signup Route
app.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        // Generate verification token
        const token = generateVerificationToken(email);

        // Send verification email
        const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
        const mailOptions = {
            from: 'urbanwastecontrol@gmail.com',
            to: email,
            subject: 'Email Verification',
            html: `<p>Please click the link to verify your email: <a href="${verificationLink}">Verify Email</a></p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email: ', error);
                return res.status(500).json({ success: false, message: 'Error sending verification email' });
            }
            res.status(201).json({ success: true, message: 'Signup successful. Please check your email for verification.' });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error signing up', error });
    }
});

// Email Verification Route
app.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find the user by email
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
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        console.log('User verification status:', user.verified); // Log the verified status

        // Check if the user is verified
        if (!user.verified) {
            return res.status(403).json({ success: false, message: 'Please verify your email before logging in' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ success: true, token, role: user.role, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error logging in', error });
    }
});



// Route for Public Users to Raise a Concern
app.post('/raise-concern', authenticateToken, async (req, res) => {
    if (req.userRole !== 'user') {
        return res.status(403).json({ success: false, message: 'Access Denied: Public users only' });
    }

    const { name, houseNumber, locality, mobileNum, issueType, additionalDetails } = req.body;

    try {
        const newConcern = new Concern({
            userId: req.userId,
            name,
            houseNumber,
            locality,
            mobileNum,
            issueType,
            additionalDetails
        });
        await newConcern.save();
        res.status(201).json({ success: true, message: 'Concern raised successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error raising concern', error });
    }
});

// Route for Municipal Employees to View Concerns
app.get('/view-concerns', authenticateToken, async (req, res) => {
    if (req.userRole !== 'municipal') {
        return res.status(403).json({ success: false, message: 'Access Denied: Municipal employees only' });
    }

    try {
        const concerns = await Concern.find();
        res.json({ concerns });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving concerns', error });
    }
});

// Route for Municipal Employees to Update Garbage Collection Schedule
app.post('/update-schedule', authenticateToken, async (req, res) => {
    if (req.userRole !== 'municipal') {
        return res.status(403).json({ success: false, message: 'Access Denied: Municipal employees only' });
    }

    const { employeeName, area, scheduleDay, scheduleDate, scheduleTime } = req.body;
    try {
        const newSchedule = new Schedule({ employeeName, area, day: scheduleDay, date: scheduleDate, time: scheduleTime });
        await newSchedule.save();
        res.status(201).json({ success: true, message: 'Schedule updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating schedule', error });
    }
});

// Route for Public Users to Report Public Garbage (with Image)
app.post('/report-public-garbage', authenticateToken, upload.single('image'), (req, res) => {
    const { location, locality, mobileNum, additionalDetails } = req.body;
    const filePath = req.file.path;

    const publicUrl = `http://localhost:3000/${filePath}`;

    res.json({ success: true, message: 'Public garbage reported successfully', imageUrl: publicUrl });
});

// Route to Get the Garbage Collection Schedule with search functionality
app.get('/view-schedule', authenticateToken, async (req, res) => {
    try {
        const { area } = req.query;
        let query = {};

        if (area) {
            query.area = { $regex: area, $options: 'i' };
        }

        const schedules = await Schedule.find(query);
        res.json({ success: true, schedules });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving schedule', error });
    }
});

// Route to Mark a Concern as Solved
app.patch('/mark-solved/:id', authenticateToken, async (req, res) => {
    if (req.userRole !== 'municipal') {
        return res.status(403).json({ success: false, message: 'Access Denied: Municipal employees only' });
    }

    const { id } = req.params;

    try {
        await Concern.findByIdAndUpdate(id, { status: 'resolved' });
        res.json({ success: true, message: 'Concern marked as solved' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error marking concern as solved', error });
    }
});

// Route to Delete a Concern
app.delete('/delete-concern/:id', authenticateToken, async (req, res) => {
    if (req.userRole !== 'municipal') {
        return res.status(403).json({ success: false, message: 'Access Denied: Municipal employees only' });
    }

    const { id } = req.params;

    try {
        await Concern.findByIdAndDelete(id);
        res.json({ success: true, message: 'Concern deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting concern', error });
    }
});

// Start the Server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});
