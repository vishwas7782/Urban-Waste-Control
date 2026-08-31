import { FiClock, FiCheckCircle, FiUserCheck } from 'react-icons/fi';
import {
  isAwaitingVerification,
  isVerified,
  statusLabel,
} from '../utils/status.js';

// Renders one of the three workflow states as a pill.
export default function StatusBadge({ status }) {
  if (isAwaitingVerification(status)) {
    return (
      <span className="badge badge-awaiting" title="Waiting for a citizen to confirm the fix">
        <FiUserCheck aria-hidden="true" /> {statusLabel(status)}
      </span>
    );
  }

  if (isVerified(status)) {
    return (
      <span className="badge badge-resolved">
        <FiCheckCircle aria-hidden="true" /> {statusLabel(status)}
      </span>
    );
  }

  return (
    <span className="badge badge-pending">
      <FiClock aria-hidden="true" /> {statusLabel(status)}
    </span>
  );
}
