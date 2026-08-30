import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page container">
      <div className="notfound">
        <h1>404</h1>
        <h2 style={{ marginBottom: '1rem' }}>Page not found</h2>
        <p className="muted">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
