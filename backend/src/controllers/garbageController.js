const Garbage = require('../models/Garbage');
const asyncHandler = require('../utils/asyncHandler');
const { getBaseUrl } = require('../utils/url');

// POST /report-public-garbage  (user, multipart field `garbageImage`)
exports.reportGarbage = asyncHandler(async (req, res) => {
    // Check the file exists BEFORE using it (legacy bug: it was read first).
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { reportName, reportMobileNum, reportLocation, reportLandmark, reportAdditionalDetails } = req.body;
    const imageUrl = `${getBaseUrl(req)}/uploads/${req.file.filename}`;

    const newReport = new Garbage({
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
    const reports = await Garbage.find();
    res.json({ success: true, reports });
});

// PATCH /mark-solved-garbage/:id  (municipal)
exports.markGarbageResolved = asyncHandler(async (req, res) => {
    await Garbage.findByIdAndUpdate(req.params.id, { status: 'resolved' });
    res.json({ success: true, message: 'Garbage report marked as resolved' });
});

// DELETE /delete-garbage/:id  (municipal)
exports.deleteGarbage = asyncHandler(async (req, res) => {
    await Garbage.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Garbage report deleted successfully' });
});
