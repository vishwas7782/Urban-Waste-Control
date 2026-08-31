// Mirror of backend/src/constants/status.js. Keep the two in sync.
//
// Lifecycle:
//   pending -> awaiting-verification -> verified
//                     |
//                     +-- citizen says "still not fixed" -> pending (reopened)
//
// `resolved` only exists on records created before verification was introduced.
// Those are grandfathered: they behave as if a citizen had already confirmed.
export const PENDING = 'pending';
export const AWAITING_VERIFICATION = 'awaiting-verification';
export const VERIFIED = 'verified';
export const LEGACY_RESOLVED = 'resolved';

const normalize = (status) => (status || '').toString().trim().toLowerCase();

// True while the municipal team still has work to do.
export const isPending = (status) => {
  const value = normalize(status);
  return value === '' || value === PENDING;
};

// The employee has marked it fixed and a citizen has yet to confirm.
export const isAwaitingVerification = (status) => normalize(status) === AWAITING_VERIFICATION;

// A citizen confirmed the fix (or it is a grandfathered legacy record).
export const isVerified = (status) => {
  const value = normalize(status);
  return value === VERIFIED || value === LEGACY_RESOLVED;
};

// The employee may only remove the record once it is verified.
export const isDeletable = isVerified;

export const isLegacyResolved = (status) => normalize(status) === LEGACY_RESOLVED;

// Short human label used in badges and toasts.
export const statusLabel = (status) => {
  if (isAwaitingVerification(status)) return 'Awaiting Verification';
  if (isLegacyResolved(status)) return 'Resolved';
  if (isVerified(status)) return 'Verified';
  return 'Pending';
};

// "12 Aug 2026, 4:05 pm" — blank when the date is missing or unparseable.
export const formatDateTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// resolvedBy/verifiedBy come back populated ({ name, email }) from the list
// endpoints but may be a bare id elsewhere — render whatever we can.
export const personName = (ref) => {
  if (!ref) return '';
  if (typeof ref === 'string') return '';
  return ref.name || ref.email || '';
};
