// Central error-handling + 404 middleware. Mounted AFTER all routes so it
// actually catches errors thrown by route handlers (the legacy server
// registered its error handler before the routes, so it never fired).

// 404 handler for unmatched routes.
const notFound = (req, res, next) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;

    // Client errors (validation, wrong state, not found) are expected — log a
    // single line. Only real server faults deserve a full stack trace.
    if (status >= 500) {
        console.error(err.stack || err);
    } else if (process.env.NODE_ENV !== 'test') {
        console.warn(`${status} ${req.method} ${req.originalUrl} — ${err.message}`);
    }

    // Multer file-size / upload errors surface as 400s.
    if (err.name === 'MulterError' || err.message === 'Only image files are allowed') {
        return res.status(400).json({ success: false, message: err.message });
    }

    res.status(status).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
};

module.exports = { notFound, errorHandler };
