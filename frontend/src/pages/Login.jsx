import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import client, { apiErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Field from '../components/Field.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.email.trim()) err.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = 'Enter a valid email address.';
    if (!form.password) err.password = 'Password is required.';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { data } = await client.post('/login', form);
      if (data?.success && data?.token) {
        login(data.token, data.role);
        toast.success(data.message || 'Logged in successfully!');
        const dest = data.role === 'municipal' ? '/municipal' : '/dashboard';
        navigate(dest, { replace: true });
      } else {
        toast.error(data?.message || 'Login failed.');
      }
    } catch (error) {
      const status = error?.response?.status;
      const msg = apiErrorMessage(error, 'Login failed.');
      if (status === 403) {
        toast.error(msg || 'Please verify your email before logging in.');
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page container fade-in">
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="text-center" style={{ marginBottom: '1.5rem' }}>
            <span className="feature-icon">
              <FiLogIn />
            </span>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
              Welcome back
            </h1>
            <p className="muted" style={{ margin: 0 }}>
              Log in to manage your waste reports.
            </p>
          </div>

          <form className="form" onSubmit={handleSubmit} noValidate>
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
            <Field label="Password" htmlFor="password" required error={errors.password}>
              <div className="input-affix">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  value={form.password}
                  onChange={update}
                  placeholder="Your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </Field>
            <button className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
