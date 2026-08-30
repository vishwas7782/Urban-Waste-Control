import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUserPlus, FiMail } from 'react-icons/fi';
import client, { apiErrorMessage } from '../api/client.js';
import Field from '../components/Field.jsx';

const initial = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
};

const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

export default function Signup() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name is required.';
    if (!form.email.trim()) err.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = 'Enter a valid email address.';
    if (!form.password) err.password = 'Password is required.';
    else if (!strongPw.test(form.password))
      err.password =
        'Min 6 chars with uppercase, lowercase, number and a special character.';
    if (!form.confirmPassword) err.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword)
      err.confirmPassword = 'Passwords do not match.';
    if (!form.role) err.role = 'Please select a role.';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { data } = await client.post('/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      if (data?.success) {
        toast.success(data.message || 'Account created! Check your email.');
        setDone(true);
      } else {
        toast.error(data?.message || 'Signup failed.');
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Signup failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="page container fade-in">
        <div className="auth-wrap">
          <div className="auth-card text-center">
            <span className="feature-icon">
              <FiMail />
            </span>
            <h1 style={{ fontSize: '1.5rem' }}>Verify your email</h1>
            <p className="muted">
              We&apos;ve sent a verification link to <strong>{form.email}</strong>.
              Please check your inbox and verify your email before logging in.
            </p>
            <Link to="/login" className="btn btn-primary btn-block">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page container fade-in">
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="text-center" style={{ marginBottom: '1.5rem' }}>
            <span className="feature-icon">
              <FiUserPlus />
            </span>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
              Create your account
            </h1>
            <p className="muted" style={{ margin: 0 }}>
              Join Urban Waste Control in a minute.
            </p>
          </div>

          <form className="form" onSubmit={handleSubmit} noValidate>
            <Field label="Full Name" htmlFor="name" required error={errors.name}>
              <input
                id="name"
                name="name"
                className="input"
                value={form.name}
                onChange={update}
                placeholder="Your full name"
                autoComplete="name"
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
                autoComplete="email"
              />
            </Field>
            <Field
              label="Password"
              htmlFor="password"
              required
              error={errors.password}
              hint="At least 6 characters with upper & lower case, a number and a special character."
            >
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                value={form.password}
                onChange={update}
                placeholder="Create a password"
                autoComplete="new-password"
              />
            </Field>
            <Field
              label="Confirm Password"
              htmlFor="confirmPassword"
              required
              error={errors.confirmPassword}
            >
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="input"
                value={form.confirmPassword}
                onChange={update}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </Field>
            <Field label="Role" htmlFor="role" required error={errors.role}>
              <select
                id="role"
                name="role"
                className="select"
                value={form.role}
                onChange={update}
              >
                <option value="">Select a role</option>
                <option value="user">Resident (User)</option>
                <option value="municipal">Municipal Staff</option>
              </select>
            </Field>
            <button className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
