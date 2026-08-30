import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import client, { apiErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setState('error');
      setMessage('No verification token was provided.');
      return;
    }

    (async () => {
      try {
        const { data } = await client.get('/verify-email', { params: { token } });
        if (data?.success) {
          setState('success');
          setMessage(data.message || 'Your email has been verified successfully!');
        } else {
          setState('error');
          setMessage(data?.message || 'Verification failed.');
        }
      } catch (error) {
        setState('error');
        setMessage(apiErrorMessage(error, 'Verification failed or the link has expired.'));
      }
    })();
  }, [token]);

  return (
    <div className="page container fade-in">
      <div className="verify-box">
        {state === 'loading' && <Loader label="Verifying your email..." />}

        {state === 'success' && (
          <div className="card">
            <div className="verify-icon" style={{ color: 'var(--success)' }}>
              <FiCheckCircle />
            </div>
            <h1 style={{ fontSize: '1.6rem' }}>Email Verified</h1>
            <p className="muted">{message}</p>
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        )}

        {state === 'error' && (
          <div className="card">
            <div className="verify-icon" style={{ color: 'var(--danger)' }}>
              <FiXCircle />
            </div>
            <h1 style={{ fontSize: '1.6rem' }}>Verification Failed</h1>
            <p className="muted">{message}</p>
            <Link to="/login" className="btn btn-outline">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
