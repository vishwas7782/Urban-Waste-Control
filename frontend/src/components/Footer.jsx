import { Link } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <FiTrash2 aria-hidden="true" /> Urban Waste Control
            </div>
            <p style={{ maxWidth: 320, marginTop: '0.5rem', color: '#94a3b8' }}>
              Connecting residents and municipalities to ensure timely waste
              collection and cleaner cities.
            </p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <Link to="/about">Privacy</Link>
            <Link to="/about">Terms</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          Urban Waste Control System | © 2024 All rights reserved
        </div>
      </div>
    </footer>
  );
}
