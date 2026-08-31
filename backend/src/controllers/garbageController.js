const Garbage = require('../models/Garbage');
const asyncHandler = require('../utils/asyncHandler');
const { getBaseUrl } = require('../utils/url');
const { markAwaitingVerification, deleteIfVerified } = require('../utils/workflow');

// POST /report-public-garbage  (user, multipart field `garbageImage`)
exports.reportGarbage = asyncHandler(async (req, res) => {
    // Check the file exists BEFORE using it (legacy bug: it was read first).
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { reportName, reportMobileNum, reportLocation, reportLandmark, reportAdditionalDetails } = req.body;
    const imageUrl = `${getBaseUrl(req)}/uploads/${req.file.filename}`;

    const newReport = new Garbage({
        userId: req.userId, // so the reporter can later verify the fix
        reportName,
        reportMobileNum,
        reportLocation,
        reportLandmark,
        reportAdditionalDetails,
        imageUrl,
    });

    await newReport.save();
    res.json({ success: true, message: 'Garbage reported successfully', report: newReport });
});

// GET /view-garbage-reports  (municipal)
exports.viewGarbageReports = asyncHandler(async (req, res) => {
    const reports = await Garbage.find()
        .sort({ _id: -1 })
        .populate('resolvedBy', 'name email')
        .populate('verifiedBy', 'name email');
    res.json({ success: true, reports });
});

// PATCH /mark-solved-garbage/:id  (municipal)
// Moves to awaiting-verification so the citizen who reported it can confirm.
exports.markGarbageResolved = asyncHandler(async (req, res) => {
    const report = await markAwaitingVerification(Garbage, req.params.id, req.userId, 'Garbage report');
    res.json({
        success: true,
        message: 'Marked as resolved. Waiting for a citizen to confirm before it can be deleted.',
        report,
    });
});

// DELETE /delete-garbage/:id  (municipal) — blocked until a citizen verifies.
exports.deleteGarbage = asyncHandler(async (req, res) => {
    await deleteIfVerified(Garbage, req.params.id, 'Garbage report');
    res.json({ success: true, message: 'Garbage report deleted successfully' });
});
