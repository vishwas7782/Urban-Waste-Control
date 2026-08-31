// Shared resolve/verify workflow logic used by concerns, garbage reports and
// anonymous public reports. Keeps the state transitions in one place so all
// three resource types behave identically.
const {
    PENDING,
    AWAITING_VERIFICATION,
    VERIFIED,
    isDeletable,
    isAwaitingVerification,
} = require('../constants/status');
const { httpError } = require('./httpError');

// Load a document or throw a 404.
const findOr404 = async (Model, id, label) => {
    const doc = await Model.findById(id).catch(() => null);
    if (!doc) {
        throw httpError(404, `${label} not found`);
    }
    return doc;
};

// Employee marks the item fixed: pending -> awaiting-verification.
// The item is NOT deletable yet; a citizen has to confirm first.
const markAwaitingVerification = async (Model, id, employeeId, label) => {
    const doc = await findOr404(Model, id, label);

    if (isAwaitingVerification(doc.status)) {
        throw httpError(409, `${label} is already waiting for citizen verification`);
    }
    if (isDeletable(doc.status)) {
        throw httpError(409, `${label} is already verified as resolved`);
    }

    doc.status = AWAITING_VERIFICATION;
    doc.resolvedAt = new Date();
    doc.resolvedBy = employeeId;
    // Clear any verification left over from a previous round.
    doc.verifiedAt = undefined;
    doc.verifiedBy = undefined;
    doc.verificationComment = undefined;

    await doc.save();
    return doc;
};

// Citizen responds to a fix. `confirmed === true` verifies it (making it
// deletable); `false` sends it back to pending with their note.
const applyVerification = async (Model, id, { citizenId, confirmed, comment, label }) => {
    const doc = await findOr404(Model, id, label);

    if (!isAwaitingVerification(doc.status)) {
        throw httpError(
            409,
            isDeletable(doc.status)
                ? `${label} has already been verified`
                : `${label} has not been marked resolved yet, so there is nothing to verify`
        );
    }

    const note = typeof comment === 'string' ? comment.trim().slice(0, 500) : '';

    if (confirmed) {
        doc.status = VERIFIED;
        doc.verifiedAt = new Date();
        doc.verifiedBy = citizenId;
        doc.verificationComment = note || undefined;
    } else {
        // Reopen: back to pending, keep an audit trail of the rejection.
        doc.status = PENDING;
        doc.reopenCount = (doc.reopenCount || 0) + 1;
        doc.reopenHistory.push({ by: citizenId, at: new Date(), comment: note || undefined });
        doc.resolvedAt = undefined;
        doc.resolvedBy = undefined;
        doc.verifiedAt = undefined;
        doc.verifiedBy = undefined;
        doc.verificationComment = undefined;
    }

    await doc.save();
    return doc;
};

// Employee deletes the item — only allowed once a citizen has verified it.
const deleteIfVerified = async (Model, id, label) => {
    const doc = await findOr404(Model, id, label);

    if (!isDeletable(doc.status)) {
        throw httpError(
            409,
            isAwaitingVerification(doc.status)
                ? `Cannot delete yet: waiting for a citizen to confirm the fix`
                : `Cannot delete: ${label.toLowerCase()} is still pending`
        );
    }

    await doc.deleteOne();
    return doc;
};

module.exports = {
    findOr404,
    markAwaitingVerification,
    applyVerification,
    deleteIfVerified,
};
