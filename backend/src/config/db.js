const mongoose = require('mongoose');

// Connect to MongoDB using the MONGO_URI env var.
// Called explicitly from server.js so that requiring app.js does not
// trigger a DB connection.
const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI is not defined in the environment');
    }

    try {
        await mongoose.connect(uri);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process with failure
    }
};

module.exports = connectDB;
