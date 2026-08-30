import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiCamera } from 'react-icons/fi';
import client, { apiErrorMessage } from '../api/client.js';
import Field from '../components/Field.jsx';

const initial = {
  name: '',
  mobile: '',
  location: '',
  landmark: '',
  details: '',
};

const MAX_SIZE = 5 * 1024 * 1024;

export default function PublicReport() {
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onFile = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setErrors((prev) => ({ ...prev, file: undefined }));
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name is required.';
    if (!form.mobile.trim()) err.mobile = 'Mobile number is required.';
    else if (!/^\d{10}$/.test(form.mobile.trim()))
      err.mobile = 'Enter a valid 10-digit mobile number.';
    if (!form.location.trim()) err.location = 'Location is required.';
    if (!form.landmark.trim()) err.landmark = 'Landmark is required.';
    if (!file) err.file = 'Please attach an image of the garbage.';
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
      fd.append('publicReportName', form.name);
      fd.append('publicReportMobileNum', form.mobile);
      fd.append('publicReportLocation', form.location);
      fd.append('publicReportLandmark', form.landmark);
      fd.append('publicReportAdditionalDetails', form.details);
      fd.append('publicGarbageImage', file);

      const { data } = await client.post('/report-public-garbage-no-login', fd);
      toast.success(data?.message || 'Report submitted. Thank you!');
      setForm(initial);
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
    <div className="page container fade-in">
      <div className="text-center">
        <span className="eyebrow">Report Issue</span>
        <h1 className="section-title">Report Public Garbage</h1>
        <p className="section-subtitle">
          Spotted garbage in a public space? Report it here - no account needed.
        </p>
      </div>

      <div className="auth-wrap" style={{ maxWidth: 620 }}>
        <div className="card">
          <form className="form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <Field label="Your Name" htmlFor="name" required error={errors.name}>
                <input
                  id="name"
                  name="name"
                  className="input"
                  value={form.name}
                  onChange={update}
                  placeholder="Full name"
                />
              </Field>
              <Field
                label="Mobile Number"
                htmlFor="mobile"
                required
                error={errors.mobile}
              >
                <input
                  id="mobile"
                  name="mobile"
                  className="input"
                  value={form.mobile}
                  onChange={update}
                  placeholder="10-digit number"
                  inputMode="numeric"
                  maxLength={10}
                />
              </Field>
            </div>
            <Field label="Location" htmlFor="location" required error={errors.location}>
              <input
                id="location"
                name="location"
                className="input"
                value={form.location}
                onChange={update}
                placeholder="Area / street where the garbage is"
              />
            </Field>
            <Field label="Landmark" htmlFor="landmark" required error={errors.landmark}>
              <input
                id="landmark"
                name="landmark"
                className="input"
                value={form.landmark}
                onChange={update}
                placeholder="Nearby landmark"
              />
            </Field>
            <Field label="Additional Details" htmlFor="details">
              <textarea
                id="details"
                name="details"
                className="textarea"
                value={form.details}
                onChange={update}
                placeholder="Any extra details that could help (optional)"
              />
            </Field>
            <Field
              label="Garbage Image"
              htmlFor="image"
              required
              error={errors.file}
              hint="JPEG/PNG, max 5MB."
            >
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="input"
                onChange={onFile}
              />
            </Field>
            <button className="btn btn-primary btn-block" disabled={submitting}>
              <FiCamera aria-hidden="true" />{' '}
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
