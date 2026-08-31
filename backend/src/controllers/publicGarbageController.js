const PublicGarbage = require('../models/PublicGarbage');
const asyncHandler = require('../utils/asyncHandler');
const { getBaseUrl } = require('../utils/url');
const { markAwaitingVerification, deleteIfVerified } = require('../utils/workflow');

// POST /report-public-garbage-no-login  (public, multipart field `publicGarbageImage`)
exports.reportPublicGarbage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const {
        publicReportName,
        publicReportMobileNum,
        publicReportLocation,
        publicReportLandmark,
        publicReportAdditionalDetails,
    } = req.body;
    const publicImageUrl = `${getBaseUrl(req)}/uploads/${req.file.filename}`;

    const newReport = new PublicGarbage({
        publicReportName,
        publicReportMobileNum,
        publicReportLocation,
        publicReportLandmark,
        publicReportAdditionalDetails,
        publicImageUrl,
    });

    await newReport.save();
    res.status(201).json({ success: true, message: 'Garbage reported successfully', report: newReport });
});

// GET /view-public-garbage-reports  (municipal)
exports.viewPublicGarbageReports = asyncHandler(async (req, res) => {
    const publicReports = await PublicGarbage.find()
        .sort({ _id: -1 })
        .populate('resolvedBy', 'name email')
        .populate('verifiedBy', 'name email');
    res.status(200).json({ success: true, PublicReports: publicReports });
});

// PATCH /mark-solved-public-garbage/:id  (municipal)
// Anonymous reports have no owner, so any logged-in citizen may confirm the fix.
exports.markPublicGarbageResolved = asyncHandler(async (req, res) => {
    const report = await markAwaitingVerification(PublicGarbage, req.params.id, req.userId, 'Public garbage report');
    res.json({
        success: true,
        message: 'Marked as resolved. Waiting for a citizen to confirm before it can be deleted.',
        report,
    });
});

// DELETE /delete-public-garbage/:id  (municipal) — blocked until verified.
exports.deletePublicGarbage = asyncHandler(async (req, res) => {
    await deleteIfVerified(PublicGarbage, req.params.id, 'Public garbage report');
    res.json({ success: true, message: 'Garbage report deleted successfully' });
});
