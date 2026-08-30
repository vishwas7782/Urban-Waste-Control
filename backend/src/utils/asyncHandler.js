// Small wrapper so async route handlers forward rejected promises to the
// central error handler instead of crashing the process.
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
