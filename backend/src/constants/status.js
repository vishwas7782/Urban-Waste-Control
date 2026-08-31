// Lifecycle of a concern / garbage report.
//
//   pending
//      |  municipal employee marks it fixed
//      v
//   awaiting-verification
//      |                         \
//      | citizen confirms         \ citizen rejects
//      v                           v
//   verified  (deletable)       pending  (reopened)
//
// 'resolved' is the legacy single-step status used before verification
// existed. Records already carrying it are grandfathered in as verified so
// they stay immediately deletable.
const PENDING = 'pending';
const AWAITING_VERIFICATION = 'awaiting-verification';
const VERIFIED = 'verified';
const LEGACY_RESOLVED = 'resolved';

const STATUSES = [PENDING, AWAITING_VERIFICATION, VERIFIED, LEGACY_RESOLVED];

// An employee may only delete once a citizen has confirmed the fix.
const isDeletable = (status) => status === VERIFIED || status === LEGACY_RESOLVED;

const isAwaitingVerification = (status) => status === AWAITING_VERIFICATION;

module.exports = {
    PENDING,
    AWAITING_VERIFICATION,
    VERIFIED,
    LEGACY_RESOLVED,
    STATUSES,
    isDeletable,
    isAwaitingVerification,
};
