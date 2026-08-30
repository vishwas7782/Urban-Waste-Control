// Build the absolute base URL for serving uploaded files.
// Prefers SERVER_URL from env, else derives it from the incoming request.
const getBaseUrl = (req) => {
    if (process.env.SERVER_URL) {
        return process.env.SERVER_URL.replace(/\/$/, '');
    }
    return `${req.protocol}://${req.get('host')}`;
};

module.exports = { getBaseUrl };
