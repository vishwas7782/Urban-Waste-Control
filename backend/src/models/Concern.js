const mongoose = require('mongoose');

const concernSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    houseNumber: String,
    locality: String,
    mobileNum: String,
    issueType: String,
    additionalDetails: String,
    status: { type: String, default: 'pending' }, // 'pending' or 'resolved'
});

module.exports = mongoose.model('Concern', concernSchema);
