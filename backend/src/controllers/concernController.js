const Concern = require('../models/Concern');
const asyncHandler = require('../utils/asyncHandler');
const { markAwaitingVerification, deleteIfVerified } = require('../utils/workflow');

// Turn the resolvedBy/verifiedBy ids into names so the dashboards can show
// who marked a record fixed and who confirmed it.
const withActors = (query) =>
    query.populate('resolvedBy', 'name email').populate('verifiedBy', 'name email');

// POST /raise-concern  (user)
exports.raiseConcern = asyncHandler(async (req, res) => {
    const { name, houseNumber, locality, mobileNum, issueType, additionalDetails } = req.body;

    const newConcern = new Concern({
        userId: req.userId,
        name,
        houseNumber,
        locality,
        mobileNum,
        issueType,
        additionalDetails,
    });

    await newConcern.save();
    res.status(201).json({ success: true, message: 'Concern raised successfully' });
});

// GET /view-user-concerns  (user) — only the caller's own concerns
exports.viewUserConcerns = asyncHandler(async (req, res) => {
    // Newest first. Sorting on _id avoids needing a createdAt on legacy rows.
    const concerns = await withActors(Concern.find({ userId: req.userId }).sort({ _id: -1 }));
    res.json({ success: true, concerns });
});

// GET /view-concerns  (municipal) — all concerns
exports.viewConcerns = asyncHandler(async (req, res) => {
    const concerns = await withActors(Concern.find().sort({ _id: -1 }));
    res.json({ success: true, concerns });
});

// PATCH /mark-solved/:id  (municipal)
// Does not close the concern outright — it moves to awaiting-verification so
// the resident who raised it can confirm the fix first.
exports.markSolved = asyncHandler(async (req, res) => {
    const concern = await markAwaitingVerification(Concern, req.params.id, req.userId, 'Concern');
    res.json({
        success: true,
        message: 'Marked as resolved. Waiting for the resident to confirm before it can be deleted.',
        concern,
    });
});

// DELETE /delete-concern/:id  (municipal) — blocked until a citizen verifies.
exports.deleteConcern = asyncHandler(async (req, res) => {
    await deleteIfVerified(Concern, req.params.id, 'Concern');
    res.json({ success: true, message: 'Concern deleted successfully' });
});
