const mongoose = require('mongoose');
const { workflowFields } = require('./workflowFields');

const concernSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    houseNumber: String,
    locality: String,
    mobileNum: String,
    issueType: String,
    additionalDetails: String,
    ...workflowFields(), // status + resolve/verify tracking
});

module.exports = mongoose.model('Concern', concernSchema);
