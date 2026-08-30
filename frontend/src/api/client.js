import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const client = axios.create({ baseURL });

// Attach bearer token from localStorage on every request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth failures. Only force logout+redirect when the failure looks like
// an expired/invalid token (unauthenticated). Role-permission 403s are surfaced
// to the caller so a toast can display the backend message instead.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data || {};
    const message = (data.message || '').toLowerCase();

    const looksLikeAuthFailure =
      status === 401 ||
      (status === 403 &&
        (message.includes('token') ||
          message.includes('expired') ||
          message.includes('invalid') ||
          message.includes('unauthor') ||
          message.includes('log in') ||
          message.includes('login')));

    const onLoginPage = window.location.pathname === '/login';

    if (looksLikeAuthFailure && !onLoginPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('verified');
      window.location.assign('/login');
    }

    return Promise.reject(error);
  }
);

// Helper to extract a human-friendly message from an axios error.
export function apiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default client;
