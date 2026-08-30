const PublicGarbage = require('../models/PublicGarbage');
const asyncHandler = require('../utils/asyncHandler');
const { getBaseUrl } = require('../utils/url');

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
    const publicReports = await PublicGarbage.find();
    res.status(200).json({ success: true, PublicReports: publicReports });
});

// PATCH /mark-solved-public-garbage/:id  (municipal)
exports.markPublicGarbageResolved = asyncHandler(async (req, res) => {
    await PublicGarbage.findByIdAndUpdate(req.params.id, { status: 'resolved' });
    res.json({ success: true, message: 'Garbage report marked as resolved' });
});

// DELETE /delete-public-garbage/:id  (municipal)
exports.deletePublicGarbage = asyncHandler(async (req, res) => {
    await PublicGarbage.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Garbage report deleted successfully' });
});
