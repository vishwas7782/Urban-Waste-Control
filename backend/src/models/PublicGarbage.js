const mongoose = require('mongoose');

const publicGarbageSchema = new mongoose.Schema({
    publicReportName: String,
    publicReportMobileNum: String,
    publicReportLocation: String,
    publicReportLandmark: String,
    publicReportAdditionalDetails: String,
    publicImageUrl: String, // Absolute URL of the uploaded image
    status: { type: String, default: 'pending' }, // 'pending' or 'resolved'
    publicReportedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PublicGarbage', publicGarbageSchema);
