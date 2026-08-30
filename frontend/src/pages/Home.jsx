import { Link } from 'react-router-dom';
import { FiTruck, FiActivity, FiCamera, FiArrowRight, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  {
    icon: <FiTruck />,
    title: 'Efficient Waste Management',
    text: 'Streamlined collection workflows that connect residents with municipal teams for timely pickups.',
  },
  {
    icon: <FiActivity />,
    title: 'Real-time Issue Tracking',
    text: 'Raise a concern and follow it from pending to resolved with live status updates.',
  },
  {
    icon: <FiCamera />,
    title: 'Public Garbage Reporting',
    text: 'Snap a photo, add a location, and report public garbage in seconds - even without an account.',
  },
];

export default function Home() {
  const { isAuthenticated, role } = useAuth();
  const concernLink = isAuthenticated
    ? role === 'municipal'
      ? '/municipal'
      : '/dashboard'
    : '/signup';

  return (
    <div className="fade-in">
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="eyebrow" style={{ color: '#e0f2fe' }}>
              Smarter cities, cleaner streets
            </span>
            <h1>Streamline Urban Waste Management with Ease</h1>
            <p>
              The Urban Waste Control System connects residents and
              municipalities to ensure timely waste collection and cleaner
              cities.
            </p>
            <div className="hero-cta">
              <Link to={concernLink} className="btn btn-ghost">
                Raise a Concern <FiArrowRight aria-hidden="true" />
              </Link>
              <Link to="/schedule" className="btn btn-primary">
                <FiCalendar aria-hidden="true" /> View Schedule
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="/Images/man-dustbin.jpg"
              alt="A worker managing urban waste collection"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="text-center">
          <span className="eyebrow">Why Choose Us?</span>
          <h2 className="section-title">Built for residents and municipalities</h2>
          <p className="section-subtitle">
            Everything you need to keep neighbourhoods clean, from reporting to
            resolution.
          </p>
        </div>
        <div className="grid grid-3">
          {features.map((f) => (
            <div key={f.title} className="card card-hover">
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p className="muted" style={{ margin: 0 }}>
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section container">
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(5,150,105,.1), rgba(2,132,199,.1))',
            textAlign: 'center',
            padding: '3rem 1.5rem',
          }}
        >
          <h2 className="section-title">Ready to make your city cleaner?</h2>
          <p className="section-subtitle">
            Join residents already reporting issues and tracking waste
            collection schedules.
          </p>
          <div className="hero-cta" style={{ justifyContent: 'center' }}>
            <Link to="/signup" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/report" className="btn btn-outline">
              Report Garbage Anonymously
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
