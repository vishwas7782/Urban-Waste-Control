// Citizen-side verification: a municipal employee can mark something fixed,
// but only a citizen can confirm it, and only then may the employee delete it.
//
// Who is allowed to verify what:
//   Concern        -> the resident who raised it
//   Garbage report -> the citizen who reported it (any citizen if the report
//                     predates reporter tracking and has no userId)
//   Public report  -> any logged-in citizen (the report was anonymous)
const Concern = require('../models/Concern');
const Garbage = require('../models/Garbage');
const PublicGarbage = require('../models/PublicGarbage');
const asyncHandler = require('../utils/asyncHandler');
const { httpError } = require('../utils/httpError');
const { findOr404, applyVerification } = require('../utils/workflow');
const { AWAITING_VERIFICATION } = require('../constants/status');

// Reads `confirmed` from the body, accepting booleans or their string forms
// so the field survives form encoding as well as JSON.
const readConfirmed = (body) => {
    const raw = body?.confirmed;
    if (typeof raw === 'boolean') return raw;
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    throw httpError(400, 'Field "confirmed" is required and must be true or false');
};

const sameId = (a, b) => a && b && String(a) === String(b);

// Builds a verify handler for one resource type.
const makeVerifyHandler = ({ Model, label, canVerify, key }) =>
    asyncHandler(async (req, res) => {
        const confirmed = readConfirmed(req.body);
        const doc = await findOr404(Model, req.params.id, label);

        if (!canVerify(doc, req.userId)) {
            throw httpError(403, `Only the citizen who reported this ${label.toLowerCase()} can verify it`);
        }

        const updated = await applyVerification(Model, req.params.id, {
            citizenId: req.userId,
            confirmed,
            comment: req.body?.comment,
            label,
        });

        res.json({
            success: true,
            message: confirmed
                ? 'Thanks for confirming! The municipal team can now close this record.'
                : 'Reported as still unresolved. It has been sent back to the municipal team.',
            [key]: updated,
        });
    });

// PATCH /verify-concern/:id  (user)
exports.verifyConcern = makeVerifyHandler({
    Model: Concern,
    label: 'Concern',
    key: 'concern',
    canVerify: (doc, userId) => sameId(doc.userId, userId),
});

// PATCH /verify-garbage/:id  (user)
exports.verifyGarbage = makeVerifyHandler({
    Model: Garbage,
    label: 'Garbage report',
    key: 'report',
    // Legacy reports carry no userId — allow any citizen to verify those.
    canVerify: (doc, userId) => !doc.userId || sameId(doc.userId, userId),
});

// PATCH /verify-public-garbage/:id  (user)
exports.verifyPublicGarbage = makeVerifyHandler({
    Model: PublicGarbage,
    label: 'Public garbage report',
    key: 'report',
    canVerify: () => true, // anonymous report: any logged-in citizen may confirm
});

// GET /pending-verifications  (user)
// Everything this citizen is being asked to confirm.
exports.pendingVerifications = asyncHandler(async (req, res) => {
    // Who marked it fixed is worth showing the citizen alongside the request.
    const withResolver = (query) => query.sort({ _id: -1 }).populate('resolvedBy', 'name email');

    const [concerns, reports, publicReports] = await Promise.all([
        withResolver(Concern.find({ userId: req.userId, status: AWAITING_VERIFICATION })),
        withResolver(
            Garbage.find({
                status: AWAITING_VERIFICATION,
                $or: [{ userId: req.userId }, { userId: { $exists: false } }, { userId: null }],
            })
        ),
        withResolver(PublicGarbage.find({ status: AWAITING_VERIFICATION })),
    ]);

    res.json({
        success: true,
        total: concerns.length + reports.length + publicReports.length,
        concerns,
        reports,
        publicReports,
    });
});
