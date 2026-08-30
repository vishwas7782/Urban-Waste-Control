import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FiEdit3,
  FiList,
  FiCamera,
  FiCalendar,
  FiSearch,
  FiSend,
  FiMapPin,
  FiUser,
  FiClock,
} from 'react-icons/fi';
import client, { apiErrorMessage } from '../api/client.js';
import Field from '../components/Field.jsx';
import Loader from '../components/Loader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const TABS = [
  { id: 'raise', label: 'Raise a Concern', icon: <FiEdit3 /> },
  { id: 'concerns', label: 'My Concerns', icon: <FiList /> },
  { id: 'report', label: 'Report Garbage', icon: <FiCamera /> },
  { id: 'schedule', label: 'View Schedule', icon: <FiCalendar /> },
];

const MAX_SIZE = 5 * 1024 * 1024;
const issueTypes = [
  'Missed Collection',
  'Overflowing Bin',
  'Illegal Dumping',
  'Damaged Bin',
  'Other',
];

export default function UserDashboard() {
  const [tab, setTab] = useState('raise');

  return (
    <div className="page container fade-in">
      <div className="dashboard-header">
        <span className="eyebrow">Resident Dashboard</span>
        <h1>Manage your waste reports</h1>
        <p className="muted" style={{ margin: 0 }}>
          Raise concerns, report public garbage and check collection schedules.
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

      {tab === 'raise' && <RaiseConcern onDone={() => setTab('concerns')} />}
      {tab === 'concerns' && <MyConcerns />}
      {tab === 'report' && <ReportGarbage />}
      {tab === 'schedule' && <ViewSchedule />}
    </div>
  );
}

const concernInit = {
  name: '',
  houseNumber: '',
  locality: '',
  mobileNum: '',
  issueType: '',
  additionalDetails: '',
};

function RaiseConcern({ onDone }) {
  const [form, setForm] = useState(concernInit);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name is required.';
    if (!form.houseNumber.trim()) err.houseNumber = 'House number is required.';
    if (!form.locality.trim()) err.locality = 'Locality is required.';
    if (!form.mobileNum.trim()) err.mobileNum = 'Mobile number is required.';
    else if (!/^\d{10}$/.test(form.mobileNum.trim()))
      err.mobileNum = 'Enter a valid 10-digit mobile number.';
    if (!form.issueType) err.issueType = 'Please select an issue type.';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { data } = await client.post('/raise-concern', form);
      toast.success(data?.message || 'Concern raised successfully!');
      setForm(concernInit);
      setErrors({});
      onDone?.();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not raise your concern.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 700 }}>
      <h2 style={{ fontSize: '1.3rem' }}>Raise a Concern</h2>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <Field label="Name" htmlFor="c-name" required error={errors.name}>
            <input id="c-name" name="name" className="input" value={form.name} onChange={update} />
          </Field>
          <Field label="House Number" htmlFor="c-house" required error={errors.houseNumber}>
            <input
              id="c-house"
              name="houseNumber"
              className="input"
              value={form.houseNumber}
              onChange={update}
            />
          </Field>
        </div>
        <div className="form-row">
          <Field label="Locality" htmlFor="c-locality" required error={errors.locality}>
            <input
              id="c-locality"
              name="locality"
              className="input"
              value={form.locality}
              onChange={update}
            />
          </Field>
          <Field label="Mobile Number" htmlFor="c-mobile" required error={errors.mobileNum}>
            <input
              id="c-mobile"
              name="mobileNum"
              className="input"
              value={form.mobileNum}
              onChange={update}
              inputMode="numeric"
              maxLength={10}
            />
          </Field>
        </div>
        <Field label="Issue Type" htmlFor="c-issue" required error={errors.issueType}>
          <select
            id="c-issue"
            name="issueType"
            className="select"
            value={form.issueType}
            onChange={update}
          >
            <option value="">Select an issue type</option>
            {issueTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Additional Details" htmlFor="c-details">
          <textarea
            id="c-details"
            name="additionalDetails"
            className="textarea"
            value={form.additionalDetails}
            onChange={update}
            placeholder="Describe the issue (optional)"
          />
        </Field>
        <button className="btn btn-primary" disabled={submitting}>
          <FiSend aria-hidden="true" /> {submitting ? 'Submitting...' : 'Submit Concern'}
        </button>
      </form>
    </div>
  );
}

function MyConcerns() {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/view-user-concerns');
      setConcerns(Array.isArray(data?.concerns) ? data.concerns : []);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not load your concerns.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader label="Loading your concerns..." />;

  if (concerns.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ margin: 0 }}>You haven&apos;t raised any concerns yet.</p>
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
            <span>
              <FiMapPin aria-hidden="true" /> <strong>Locality:</strong> {c.locality}
            </span>
            {c.name && (
              <span>
                <FiUser aria-hidden="true" /> <strong>Name:</strong> {c.name}
              </span>
            )}
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
        </div>
      ))}
    </div>
  );
}

const reportInit = {
  reportName: '',
  reportMobileNum: '',
  reportLocation: '',
  reportLandmark: '',
  reportAdditionalDetails: '',
};

function ReportGarbage() {
  const [form, setForm] = useState(reportInit);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onFile = (e) => {
    setFile(e.target.files?.[0] || null);
    setErrors((p) => ({ ...p, file: undefined }));
  };

  const validate = () => {
    const err = {};
    if (!form.reportName.trim()) err.reportName = 'Name is required.';
    if (!form.reportMobileNum.trim()) err.reportMobileNum = 'Mobile number is required.';
    else if (!/^\d{10}$/.test(form.reportMobileNum.trim()))
      err.reportMobileNum = 'Enter a valid 10-digit mobile number.';
    if (!form.reportLocation.trim()) err.reportLocation = 'Location is required.';
    if (!form.reportLandmark.trim()) err.reportLandmark = 'Landmark is required.';
    if (!file) err.file = 'Please attach an image.';
    else if (!file.type.startsWith('image/')) err.file = 'Please upload an image file.';
    else if (file.size > MAX_SIZE) err.file = 'Image must be 5MB or smaller.';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('garbageImage', file);
      const { data } = await client.post('/report-public-garbage', fd);
      toast.success(data?.message || 'Garbage report submitted!');
      setForm(reportInit);
      setFile(null);
      setErrors({});
      e.target.reset();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not submit your report.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 700 }}>
      <h2 style={{ fontSize: '1.3rem' }}>Report Public Garbage</h2>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <Field label="Name" htmlFor="r-name" required error={errors.reportName}>
            <input
              id="r-name"
              name="reportName"
              className="input"
              value={form.reportName}
              onChange={update}
            />
          </Field>
          <Field label="Mobile Number" htmlFor="r-mobile" required error={errors.reportMobileNum}>
            <input
              id="r-mobile"
              name="reportMobileNum"
              className="input"
              value={form.reportMobileNum}
              onChange={update}
              inputMode="numeric"
              maxLength={10}
            />
          </Field>
        </div>
        <Field label="Location" htmlFor="r-location" required error={errors.reportLocation}>
          <input
            id="r-location"
            name="reportLocation"
            className="input"
            value={form.reportLocation}
            onChange={update}
          />
        </Field>
        <Field label="Landmark" htmlFor="r-landmark" required error={errors.reportLandmark}>
          <input
            id="r-landmark"
            name="reportLandmark"
            className="input"
            value={form.reportLandmark}
            onChange={update}
          />
        </Field>
        <Field label="Additional Details" htmlFor="r-details">
          <textarea
            id="r-details"
            name="reportAdditionalDetails"
            className="textarea"
            value={form.reportAdditionalDetails}
            onChange={update}
          />
        </Field>
        <Field label="Garbage Image" htmlFor="r-image" required error={errors.file} hint="JPEG/PNG, max 5MB.">
          <input id="r-image" type="file" accept="image/*" className="input" onChange={onFile} />
        </Field>
        <button className="btn btn-primary" disabled={submitting}>
          <FiCamera aria-hidden="true" /> {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}

function ViewSchedule() {
  const [area, setArea] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    if (!area.trim()) {
      toast.error('Please enter an area to search.');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await client.get('/view-schedule', { params: { area: area.trim() } });
      setSchedules(Array.isArray(data?.schedules) ? data.schedules : []);
    } catch (error) {
      setSchedules([]);
      toast.error(apiErrorMessage(error, 'Could not load schedules.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form className="search-bar" onSubmit={search} style={{ maxWidth: 620 }}>
        <input
          className="input"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Enter your area"
          aria-label="Area"
        />
        <button className="btn btn-primary" disabled={loading}>
          <FiSearch aria-hidden="true" /> Search
        </button>
      </form>

      {loading && <Loader label="Fetching schedules..." />}
      {!loading && searched && schedules.length === 0 && (
        <div className="empty-state">
          <p style={{ margin: 0 }}>No schedules found for &quot;{area}&quot;.</p>
        </div>
      )}
      {!loading && schedules.length > 0 && (
        <div className="grid grid-3">
          {schedules.map((s) => (
            <div key={s._id} className="card card-hover">
              <span className="feature-icon">
                <FiCalendar />
              </span>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>
                <FiMapPin aria-hidden="true" /> {s.area}
              </h3>
              <div className="record-meta">
                <span>
                  <FiUser aria-hidden="true" /> <strong>Employee:</strong> {s.employeeName}
                </span>
                <span>
                  <strong>Day:</strong> {s.day}
                </span>
                <span>
                  <strong>Date:</strong> {s.date}
                </span>
                <span>
                  <FiClock aria-hidden="true" /> <strong>Time:</strong> {s.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
