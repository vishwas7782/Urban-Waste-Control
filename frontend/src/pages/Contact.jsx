import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import client, { apiErrorMessage } from '../api/client.js';
import Field from '../components/Field.jsx';

const initial = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name is required.';
    if (!form.email.trim()) err.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = 'Enter a valid email address.';
    if (!form.subject.trim()) err.subject = 'Subject is required.';
    if (!form.message.trim()) err.message = 'Message is required.';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { data } = await client.post('/send-contact-mail', form);
      toast.success(data?.message || 'Message sent successfully!');
      setForm(initial);
      setErrors({});
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not send your message.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page container fade-in">
      <div className="text-center">
        <span className="eyebrow">Contact Us</span>
        <h1 className="section-title">Get in touch</h1>
        <p className="section-subtitle">
          Questions, feedback or partnership ideas? We would love to hear from
          you.
        </p>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="grid" style={{ gap: '1rem' }}>
          <div className="card">
            <span className="feature-icon">
              <FiMail />
            </span>
            <h3 style={{ fontSize: '1.05rem' }}>Email</h3>
            <p className="muted" style={{ margin: 0 }}>
              support@urbanwastecontrol.com
            </p>
          </div>
          <div className="card">
            <span className="feature-icon">
              <FiPhone />
            </span>
            <h3 style={{ fontSize: '1.05rem' }}>Phone</h3>
            <p className="muted" style={{ margin: 0 }}>
              +91 00000 00000
            </p>
          </div>
          <div className="card">
            <span className="feature-icon">
              <FiMapPin />
            </span>
            <h3 style={{ fontSize: '1.05rem' }}>Location</h3>
            <p className="muted" style={{ margin: 0 }}>
              Serving cities across the region
            </p>
          </div>
        </div>

        <div className="card">
          <form className="form" onSubmit={handleSubmit} noValidate>
            <Field label="Name" htmlFor="name" required error={errors.name}>
              <input
                id="name"
                name="name"
                className="input"
                value={form.name}
                onChange={update}
                placeholder="Your name"
              />
            </Field>
            <Field label="Email" htmlFor="email" required error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                value={form.email}
                onChange={update}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Subject" htmlFor="subject" required error={errors.subject}>
              <input
                id="subject"
                name="subject"
                className="input"
                value={form.subject}
                onChange={update}
                placeholder="How can we help?"
              />
            </Field>
            <Field label="Message" htmlFor="message" required error={errors.message}>
              <textarea
                id="message"
                name="message"
                className="textarea"
                value={form.message}
                onChange={update}
                placeholder="Write your message..."
              />
            </Field>
            <button className="btn btn-primary btn-block" disabled={submitting}>
              <FiSend aria-hidden="true" /> {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
