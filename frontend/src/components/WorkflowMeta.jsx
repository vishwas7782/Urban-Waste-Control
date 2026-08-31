import { FiCheckCircle, FiRotateCcw, FiUserCheck, FiMessageSquare } from 'react-icons/fi';
import {
  isAwaitingVerification,
  isVerified,
  formatDateTime,
  personName,
} from '../utils/status.js';

// Shows the verification trail of a record: who marked it fixed, who confirmed
// it, the citizen's note, and how many times it has been sent back.
export default function WorkflowMeta({ record }) {
  if (!record) return null;

  const resolvedBy = personName(record.resolvedBy);
  const resolvedAt = formatDateTime(record.resolvedAt);
  const verifiedBy = personName(record.verifiedBy);
  const verifiedAt = formatDateTime(record.verifiedAt);
  const reopens = record.reopenCount || 0;
  const lastReopen = record.reopenHistory?.[record.reopenHistory.length - 1];

  const awaiting = isAwaitingVerification(record.status);
  const verified = isVerified(record.status);

  // Nothing has happened yet beyond being raised.
  if (!awaiting && !verified && reopens === 0) return null;

  return (
    <div className="workflow-meta">
      {awaiting && (
        <span>
          <FiUserCheck aria-hidden="true" /> Marked fixed
          {resolvedBy ? ` by ${resolvedBy}` : ''}
          {resolvedAt ? ` on ${resolvedAt}` : ''} — awaiting citizen confirmation.
        </span>
      )}

      {verified && (
        <span>
          <FiCheckCircle aria-hidden="true" /> Confirmed fixed
          {verifiedBy ? ` by ${verifiedBy}` : ''}
          {verifiedAt ? ` on ${verifiedAt}` : ''}.
        </span>
      )}

      {verified && record.verificationComment && (
        <span>
          <FiMessageSquare aria-hidden="true" /> &ldquo;{record.verificationComment}&rdquo;
        </span>
      )}

      {reopens > 0 && (
        <span className="workflow-meta-warn">
          <FiRotateCcw aria-hidden="true" /> Sent back by a citizen {reopens}{' '}
          {reopens === 1 ? 'time' : 'times'}
          {lastReopen?.comment ? `: “${lastReopen.comment}”` : ''}
        </span>
      )}
    </div>
  );
}
