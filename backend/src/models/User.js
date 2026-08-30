const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String, // 'user' or 'municipal'
    verified: { type: Boolean, default: false } // Email verification status
});

module.exports = mongoose.model('User', userSchema);
