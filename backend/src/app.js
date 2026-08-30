const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const concernRoutes = require('./routes/concernRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const garbageRoutes = require('./routes/garbageRoutes');
const publicGarbageRoutes = require('./routes/publicGarbageRoutes');

const app = express();

// --- Core middleware ---
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // allow images to load cross-origin
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Serve uploaded images.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check.
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// --- Routes (mounted at root to preserve the existing API paths) ---
app.use('/', authRoutes);
app.use('/', contactRoutes);
app.use('/', concernRoutes);
app.use('/', scheduleRoutes);
app.use('/', garbageRoutes);
app.use('/', publicGarbageRoutes);

// --- 404 + error handling (MUST come after routes) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
