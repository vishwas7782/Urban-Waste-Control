const mongoose = require('mongoose');

const garbageSchema = new mongoose.Schema({
    reportName: String,
    reportMobileNum: String,
    reportLocation: String,
    reportLandmark: String,
    reportAdditionalDetails: String,
    imageUrl: String, // Absolute URL of the uploaded image
    status: { type: String, default: 'pending' }, // 'pending' or 'resolved'
    reportedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Garbage', garbageSchema);
