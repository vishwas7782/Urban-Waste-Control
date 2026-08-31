const mongoose = require('mongoose');
const { workflowFields } = require('./workflowFields');

const publicGarbageSchema = new mongoose.Schema({
    publicReportName: String,
    publicReportMobileNum: String,
    publicReportLocation: String,
    publicReportLandmark: String,
    publicReportAdditionalDetails: String,
    publicImageUrl: String, // Absolute URL of the uploaded image
    publicReportedAt: { type: Date, default: Date.now },
    ...workflowFields(), // status + resolve/verify tracking
});

module.exports = mongoose.model('PublicGarbage', publicGarbageSchema);
