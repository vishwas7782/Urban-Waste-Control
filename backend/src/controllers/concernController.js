const Concern = require('../models/Concern');
const asyncHandler = require('../utils/asyncHandler');

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
    const concerns = await Concern.find({ userId: req.userId });
    res.json({ success: true, concerns });
});

// GET /view-concerns  (municipal) — all concerns
exports.viewConcerns = asyncHandler(async (req, res) => {
    const concerns = await Concern.find();
    res.json({ success: true, concerns });
});

// PATCH /mark-solved/:id  (municipal)
exports.markSolved = asyncHandler(async (req, res) => {
    await Concern.findByIdAndUpdate(req.params.id, { status: 'resolved' });
    res.json({ success: true, message: 'Concern marked as solved' });
});

// DELETE /delete-concern/:id  (municipal)
exports.deleteConcern = asyncHandler(async (req, res) => {
    await Concern.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Concern deleted successfully' });
});
