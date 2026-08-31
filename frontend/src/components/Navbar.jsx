import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const publicLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/report', label: 'Report Issue' },
  { to: '/schedule', label: 'View Schedule' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const close = () => setOpen(false);
  const dashboardPath = role === 'municipal' ? '/municipal' : '/dashboard';

  // Never leave the drawer hanging open over a page the user navigated to
  // some other way (browser back, a redirect after login).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Freeze the page behind the drawer so a swipe scrolls the menu, not the
  // content underneath it.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape closes it, as with any other overlay.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const handleLogout = () => {
    close();
    logout();
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" onClick={close}>
          <img
            src="/Images/logo3Bg.png"
            alt="Urban Waste Control logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="brand-text">Urban Waste Control</span>
        </Link>

        <button
          className="hamburger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>

        {open && (
          <button className="nav-overlay" aria-label="Close menu" onClick={close} />
        )}

        <div id="nav-menu" className={`nav-menu ${open ? 'open' : ''}`}>
          <ul className="nav-links">
            {publicLinks.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.end} onClick={close}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    close();
                    navigate(dashboardPath);
                  }}
                >
                  Dashboard
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleLogout}>
                  <FiLogOut aria-hidden="true" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm" onClick={close}>
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm" onClick={close}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
