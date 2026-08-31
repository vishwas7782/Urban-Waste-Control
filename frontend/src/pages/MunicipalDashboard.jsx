import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FiGrid,
  FiAlertCircle,
  FiTrash2,
  FiUsers,
  FiCalendar,
  FiCheck,
  FiMapPin,
  FiUser,
  FiSend,
  FiClock,
} from 'react-icons/fi';
import client, { apiErrorMessage } from '../api/client.js';
import Field from '../components/Field.jsx';
import Loader from '../components/Loader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import WorkflowMeta from '../components/WorkflowMeta.jsx';
import resolveImg from '../utils/imageUrl.js';
import { isPending, isAwaitingVerification, isDeletable } from '../utils/status.js';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <FiGrid /> },
  { id: 'concerns', label: 'Concerns', icon: <FiAlertCircle /> },
  { id: 'garbage', label: 'Garbage Reports', icon: <FiTrash2 /> },
  { id: 'public', label: 'Public Reports', icon: <FiUsers /> },
  { id: 'schedule', label: 'Update Schedule', icon: <FiCalendar /> },
];

export default function MunicipalDashboard() {
  const [tab, setTab] = useState('overview');
  const [concerns, setConcerns] = useState([]);
  const [reports, setReports] = useState([]);
  const [publicReports, setPublicReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      client.get('/view-concerns'),
      client.get('/view-garbage-reports'),
      client.get('/view-public-garbage-reports'),
    ]);
    if (results[0].status === 'fulfilled')
      setConcerns(results[0].value.data?.concerns || []);
    if (results[1].status === 'fulfilled')
      setReports(results[1].value.data?.reports || []);
    if (results[2].status === 'fulfilled')
      setPublicReports(results[2].value.data?.PublicReports || []);

    const firstError = results.find((r) => r.status === 'rejected');
    if (firstError) {
      toast.error(apiErrorMessage(firstError.reason, 'Some data could not be loaded.'));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <div className="page container fade-in">
      <div className="dashboard-header">
        <span className="eyebrow">Municipal Dashboard</span>
        <h1>Operations overview</h1>
        <p className="muted" style={{ margin: 0 }}>
          Manage concerns, garbage reports and collection schedules.
        </p>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader label="Loading dashboard..." />
      ) : (
        <>
          {tab === 'overview' && (
            <Overview
              concerns={concerns}
              reports={reports}
              publicReports={publicReports}
            />
          )}
          {tab === 'concerns' && (
            <ManageConcerns concerns={concerns} refresh={loadAll} />
          )}
          {tab === 'garbage' && (
            <ManageGarbage reports={reports} refresh={loadAll} />
          )}
          {tab === 'public' && (
            <ManagePublic reports={publicReports} refresh={loadAll} />
          )}
          {tab === 'schedule' && <UpdateSchedule />}
        </>
      )}
    </div>
  );
}

function Overview({ concerns, reports, publicReports }) {
  const all = [...concerns, ...reports, ...publicReports];
  const pendingConcerns = concerns.filter((c) => isPending(c.status)).length;
  const awaiting = all.filter((r) => isAwaitingVerification(r.status)).length;
  const tiles = [
    {
      label: 'Total Concerns',
      value: concerns.length,
      icon: <FiAlertCircle />,
      color: 'var(--secondary)',
      bg: 'rgba(2,132,199,.12)',
    },
    {
      label: 'Garbage Reports',
      value: reports.length,
      icon: <FiTrash2 />,
      color: 'var(--primary-dark)',
      bg: 'rgba(5,150,105,.12)',
    },
    {
      label: 'Public Reports',
      value: publicReports.length,
      icon: <FiUsers />,
      color: 'var(--warning)',
      bg: 'rgba(245,158,11,.15)',
    },
    {
      label: 'Pending Concerns',
      value: pendingConcerns,
      icon: <FiCalendar />,
      color: 'var(--danger)',
      bg: 'rgba(220,38,38,.12)',
    },
    {
      label: 'Awaiting Citizen Verification',
      value: awaiting,
      icon: <FiClock />,
      color: 'var(--secondary)',
      bg: 'rgba(2,132,199,.12)',
    },
  ];

  return (
    <div className="stat-grid">
      {tiles.map((t) => (
        <div key={t.label} className="stat-tile">
          <span className="stat-icon" style={{ background: t.bg, color: t.color }}>
            {t.icon}
          </span>
          <div>
            <div className="stat-value">{t.value}</div>
            <div className="stat-label">{t.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Runs an async action with a busy state + toast, then refreshes.
function useAction(refresh) {
  const [busyId, setBusyId] = useState(null);
  const run = useCallback(
    async (id, fn, successMsg) => {
      setBusyId(id);
      try {
        const { data } = await fn();
        toast.success(data?.message || successMsg);
        await refresh();
      } catch (error) {
        toast.error(apiErrorMessage(error, 'Action failed.'));
      } finally {
        setBusyId(null);
      }
    },
    [refresh]
  );
  return { busyId, run };
}

// Mark Solved -> locked while a citizen confirms -> Delete.
// The API enforces the same gate; this just keeps the button honest.
function RecordActions({ record, busy, noun, onMarkSolved, onDelete }) {
  if (isAwaitingVerification(record.status)) {
    return (
      <div className="workflow-hint">
        <FiClock aria-hidden="true" /> Waiting for a citizen to confirm the fix — this {noun} can be
        deleted once they do.
      </div>
    );
  }

  if (isDeletable(record.status)) {
    return (
      <div className="record-actions">
        <button className="btn btn-danger btn-sm" disabled={busy} onClick={onDelete}>
          <FiTrash2 aria-hidden="true" /> Delete
        </button>
      </div>
    );
  }

  return (
    <div className="record-actions">
      <button className="btn btn-primary btn-sm" disabled={busy} onClick={onMarkSolved}>
        <FiCheck aria-hidden="true" /> Mark Solved
      </button>
    </div>
  );
}

function ManageConcerns({ concerns, refresh }) {
  const { busyId, run } = useAction(refresh);

  if (concerns.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ margin: 0 }}>No concerns have been raised yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-2">
      {concerns.map((c) => (
        <div key={c._id} className="card record-card">
          <div className="record-head">
            <h3 className="record-title">{c.issueType}</h3>
            <StatusBadge status={c.status} />
          </div>
          <div className="record-meta">
            {c.name && (
              <span>
                <FiUser aria-hidden="true" /> <strong>Name:</strong> {c.name}
              </span>
            )}
            <span>
              <FiMapPin aria-hidden="true" /> <strong>Locality:</strong> {c.locality}
            </span>
            {c.houseNumber && (
              <span>
                <strong>House No:</strong> {c.houseNumber}
              </span>
            )}
            {c.mobileNum && (
              <span>
                <strong>Mobile:</strong> {c.mobileNum}
              </span>
            )}
            {c.additionalDetails && (
              <span>
                <strong>Details:</strong> {c.additionalDetails}
              </span>
            )}
          </div>
          <WorkflowMeta record={c} />
          <RecordActions
            record={c}
            busy={busyId === c._id}
            noun="concern"
            onMarkSolved={() =>
              run(c._id, () => client.patch(`/mark-solved/${c._id}`), 'Concern marked as solved.')
            }
            onDelete={() =>
              run(c._id, () => client.delete(`/delete-concern/${c._id}`), 'Concern deleted.')
            }
          />
        </div>
      ))}
    </div>
  );
}

function ManageGarbage({ reports, refresh }) {
  const { busyId, run } = useAction(refresh);

  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ margin: 0 }}>No garbage reports yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-2">
      {reports.map((r) => (
        <div key={r._id} className="card record-card">
          {r.imageUrl && (
            <img
              className="thumb"
              src={resolveImg(r.imageUrl)}
              alt={`Garbage reported at ${r.reportLocation || 'location'}`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="record-head">
            <h3 className="record-title">{r.reportName || 'Garbage Report'}</h3>
            <StatusBadge status={r.status} />
          </div>
          <div className="record-meta">
            <span>
              <FiMapPin aria-hidden="true" /> <strong>Location:</strong> {r.reportLocation}
            </span>
            {r.reportLandmark && (
              <span>
                <strong>Landmark:</strong> {r.reportLandmark}
              </span>
            )}
            {r.reportMobileNum && (
              <span>
                <strong>Mobile:</strong> {r.reportMobileNum}
              </span>
            )}
            {r.reportAdditionalDetails && (
              <span>
                <strong>Details:</strong> {r.reportAdditionalDetails}
              </span>
            )}
          </div>
          <WorkflowMeta record={r} />
          <RecordActions
            record={r}
            busy={busyId === r._id}
            noun="report"
            onMarkSolved={() =>
              run(
                r._id,
                () => client.patch(`/mark-solved-garbage/${r._id}`),
                'Report marked as solved.'
              )
            }
            onDelete={() =>
              run(r._id, () => client.delete(`/delete-garbage/${r._id}`), 'Report deleted.')
            }
          />
        </div>
      ))}
    </div>
  );
}

function ManagePublic({ reports, refresh }) {
  const { busyId, run } = useAction(refresh);

  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ margin: 0 }}>No public reports yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-2">
      {reports.map((r) => (
        <div key={r._id} className="card record-card">
          {r.publicImageUrl && (
            <img
              className="thumb"
              src={resolveImg(r.publicImageUrl)}
              alt={`Garbage reported at ${r.publicReportLocation || 'location'}`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="record-head">
            <h3 className="record-title">{r.publicReportName || 'Public Report'}</h3>
            <StatusBadge status={r.status} />
          </div>
          <div className="record-meta">
            <span>
              <FiMapPin aria-hidden="true" /> <strong>Location:</strong>{' '}
              {r.publicReportLocation}
            </span>
            {r.publicReportLandmark && (
              <span>
                <strong>Landmark:</strong> {r.publicReportLandmark}
              </span>
            )}
            {r.publicReportMobileNum && (
              <span>
                <strong>Mobile:</strong> {r.publicReportMobileNum}
              </span>
            )}
            {r.publicReportAdditionalDetails && (
              <span>
                <strong>Details:</strong> {r.publicReportAdditionalDetails}
              </span>
            )}
          </div>
          <WorkflowMeta record={r} />
          <RecordActions
            record={r}
            busy={busyId === r._id}
            noun="report"
            onMarkSolved={() =>
              run(
                r._id,
                () => client.patch(`/mark-solved-public-garbage/${r._id}`),
                'Public report marked as solved.'
              )
            }
            onDelete={() =>
              run(
                r._id,
                () => client.delete(`/delete-public-garbage/${r._id}`),
                'Public report deleted.'
              )
            }
          />
        </div>
      ))}
    </div>
  );
}

const scheduleInit = {
  employeeName: '',
  area: '',
  scheduleDay: '',
  scheduleDate: '',
  scheduleTime: '',
};

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

function UpdateSchedule() {
  const [form, setForm] = useState(scheduleInit);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.employeeName.trim()) err.employeeName = 'Employee name is required.';
    if (!form.area.trim()) err.area = 'Area is required.';
    if (!form.scheduleDay) err.scheduleDay = 'Please select a day.';
    if (!form.scheduleDate) err.scheduleDate = 'Please select a date.';
    if (!form.scheduleTime) err.scheduleTime = 'Please select a time.';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { data } = await client.post('/update-schedule', form);
      toast.success(data?.message || 'Schedule updated successfully!');
      setForm(scheduleInit);
      setErrors({});
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not update the schedule.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 700 }}>
      <h2 style={{ fontSize: '1.3rem' }}>Update Collection Schedule</h2>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <Field label="Employee Name" htmlFor="s-emp" required error={errors.employeeName}>
            <input
              id="s-emp"
              name="employeeName"
              className="input"
              value={form.employeeName}
              onChange={update}
            />
          </Field>
          <Field label="Area" htmlFor="s-area" required error={errors.area}>
            <input
              id="s-area"
              name="area"
              className="input"
              value={form.area}
              onChange={update}
            />
          </Field>
        </div>
        <div className="form-row">
          <Field label="Day" htmlFor="s-day" required error={errors.scheduleDay}>
            <select
              id="s-day"
              name="scheduleDay"
              className="select"
              value={form.scheduleDay}
              onChange={update}
            >
              <option value="">Select a day</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date" htmlFor="s-date" required error={errors.scheduleDate}>
            <input
              id="s-date"
              name="scheduleDate"
              type="date"
              className="input"
              value={form.scheduleDate}
              onChange={update}
            />
          </Field>
          <Field label="Time" htmlFor="s-time" required error={errors.scheduleTime}>
            <input
              id="s-time"
              name="scheduleTime"
              type="time"
              className="input"
              value={form.scheduleTime}
              onChange={update}
            />
          </Field>
        </div>
        <button className="btn btn-primary" disabled={submitting}>
          <FiSend aria-hidden="true" /> {submitting ? 'Saving...' : 'Update Schedule'}
        </button>
      </form>
    </div>
  );
}
