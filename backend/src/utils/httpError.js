// Error carrying an HTTP status code. The central error handler reads
// `err.status`, so throwing one of these from a controller produces a clean
// JSON response instead of a 500.
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
    }
}

const httpError = (status, message) => new HttpError(status, message);

module.exports = { HttpError, httpError };
