import { FiClock, FiCheckCircle } from 'react-icons/fi';

// Normalizes a status string into a resolved/pending badge.
export default function StatusBadge({ status }) {
  const value = (status || '').toString().toLowerCase();
  const resolved =
    value.includes('resolv') || value.includes('solved') || value.includes('done') || value.includes('complete');

  if (resolved) {
    return (
      <span className="badge badge-resolved">
        <FiCheckCircle aria-hidden="true" /> Resolved
      </span>
    );
  }

  return (
    <span className="badge badge-pending">
      <FiClock aria-hidden="true" /> Pending
    </span>
  );
}

export function isResolved(status) {
  const value = (status || '').toString().toLowerCase();
  return (
    value.includes('resolv') || value.includes('solved') || value.includes('done') || value.includes('complete')
  );
}
