const mongoose = require('mongoose');
const { workflowFields } = require('./workflowFields');

const garbageSchema = new mongoose.Schema({
    // The logged-in citizen who filed the report. Optional because reports
    // created before this field existed have no reporter recorded.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportName: String,
    reportMobileNum: String,
    reportLocation: String,
    reportLandmark: String,
    reportAdditionalDetails: String,
    imageUrl: String, // Absolute URL of the uploaded image
    reportedAt: { type: Date, default: Date.now },
    ...workflowFields(), // status + resolve/verify tracking
});

module.exports = mongoose.model('Garbage', garbageSchema);
