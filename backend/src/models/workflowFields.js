const mongoose = require('mongoose');
const { STATUSES, PENDING } = require('../constants/status');

// One entry per time a citizen rejected the fix and sent the item back.
const reopenEntrySchema = new mongoose.Schema(
    {
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
        comment: String,
    },
    { _id: false }
);

// Shared resolve/verify workflow fields. Called per schema so each model gets
// its own field definitions rather than sharing one mutable object.
const workflowFields = () => ({
    status: { type: String, enum: STATUSES, default: PENDING },

    // Set when a municipal employee marks the item fixed.
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Set when a citizen confirms the fix.
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationComment: String,

    // Incremented each time a citizen says the problem is still there.
    reopenCount: { type: Number, default: 0 },
    reopenHistory: { type: [reopenEntrySchema], default: [] },
});

module.exports = { workflowFields };
