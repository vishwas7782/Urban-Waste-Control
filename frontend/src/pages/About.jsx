import {
  FiUsers as Users,
  FiRadio,
  FiZap,
  FiHeart,
  FiEdit3,
  FiEye,
  FiCheckSquare,
} from 'react-icons/fi';

const team = [
  {
    name: 'Vishwasjeet Kr Gupta',
    role: 'Founder & Group Leader / Full Stack Developer',
    img: '/Images/vishwasjeet.jpg',
  },
  {
    name: 'Nishu Kumar',
    role: 'Co-Founder / Back-End Developer',
    img: '/Images/nishu.jpeg',
  },
  {
    name: 'Prarthi Kumari',
    role: 'Co-Founder / Back End Developer & UI',
    img: '/Images/prarthi.JPG',
  },
  {
    name: 'Ram Vinay Kumar',
    role: 'Co-Founder / User Experience Designer',
    img: '/Images/ramvinay.jpeg',
  },
];

const whyChoose = [
  {
    icon: <Users />,
    title: 'Citizen Empowerment',
    text: 'Residents get a direct voice to report issues and hold services accountable.',
  },
  {
    icon: <FiRadio />,
    title: 'Real-Time Reporting',
    text: 'Report waste problems with photos and locations, instantly visible to municipal teams.',
  },
  {
    icon: <FiZap />,
    title: 'Efficient Response',
    text: 'Municipal staff triage, assign and resolve concerns faster with a unified dashboard.',
  },
  {
    icon: <FiHeart />,
    title: 'Sustainability',
    text: 'Cleaner streets and smarter collection routes contribute to greener, healthier cities.',
  },
];

const steps = [
  {
    icon: <FiEdit3 />,
    title: 'Report a Concern',
    text: 'Submit a concern or public garbage report with details, location and a photo.',
  },
  {
    icon: <FiEye />,
    title: 'Track the Status',
    text: 'Follow your report as it moves from pending to resolved in real time.',
  },
  {
    icon: <FiCheckSquare />,
    title: 'Efficient Resolution',
    text: 'Municipal teams act on reports and mark them solved once the work is complete.',
  },
];

function Avatar({ member }) {
  return (
    <img
      className="team-photo"
      src={member.img}
      alt={member.name}
      onError={(e) => {
        e.currentTarget.src =
          'data:image/svg+xml;utf8,' +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="110" height="110"><rect width="110" height="110" fill="%23e2e8f0"/><text x="50%" y="54%" font-size="42" text-anchor="middle" fill="%2364748b" font-family="sans-serif">${member.name
              .charAt(0)
              .toUpperCase()}</text></svg>`
          );
      }}
    />
  );
}

export default function About() {
  return (
    <div className="page container fade-in">
      <div className="text-center">
        <span className="eyebrow">About Us</span>
        <h1 className="section-title">Cleaner cities, together</h1>
        <p className="section-subtitle">
          Urban Waste Control bridges the gap between residents and
          municipalities for smarter, faster waste management.
        </p>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
        <div className="card">
          <h3>Our Story</h3>
          <p className="muted">
            Urban Waste Control began with a simple observation: waste issues go
            unresolved because residents and municipalities lack a shared
            platform. We built a system that closes that gap and keeps
            neighbourhoods clean.
          </p>
        </div>
        <div className="card">
          <h3>Our Mission</h3>
          <p className="muted">
            To empower every citizen to report waste problems effortlessly and
            help municipalities respond quickly, creating cleaner and healthier
            urban spaces.
          </p>
        </div>
        <div className="card">
          <h3>Our Vision</h3>
          <p className="muted">
            A future where technology drives sustainable cities - where waste is
            managed transparently, efficiently and responsibly for generations
            to come.
          </p>
        </div>
      </div>

      <section className="section">
        <h2 className="section-title text-center">Why Choose Us</h2>
        <div className="grid grid-4" style={{ marginTop: '1.5rem' }}>
          {whyChoose.map((w) => (
            <div key={w.title} className="card card-hover">
              <span className="feature-icon">{w.icon}</span>
              <h3 style={{ fontSize: '1.05rem' }}>{w.title}</h3>
              <p className="muted" style={{ margin: 0 }}>
                {w.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title text-center">How It Works</h2>
        <div className="grid grid-3" style={{ marginTop: '1.5rem' }}>
          {steps.map((s, i) => (
            <div key={s.title} className="card">
              <span className="step-num">{i + 1}</span>
              <h3 style={{ fontSize: '1.1rem' }}>
                {s.icon} {s.title}
              </h3>
              <p className="muted" style={{ margin: 0 }}>
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title text-center">Meet Our Team</h2>
        <div className="grid grid-4" style={{ marginTop: '1.5rem' }}>
          {team.map((m) => (
            <div key={m.name} className="card card-hover text-center">
              <Avatar member={m} />
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                {m.name}
              </h3>
              <p className="team-role" style={{ margin: 0 }}>
                {m.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div
          className="card text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(5,150,105,.1), rgba(2,132,199,.1))',
            padding: '3rem 1.5rem',
          }}
        >
          <h2 className="section-title">Our Impact</h2>
          <p className="section-subtitle">
            Together we are reducing response times, resolving more concerns and
            keeping our streets cleaner every single day.
          </p>
          <div className="stat-grid" style={{ marginBottom: 0 }}>
            <div className="stat-tile">
              <div>
                <div className="stat-value">1000+</div>
                <div className="stat-label">Concerns Resolved</div>
              </div>
            </div>
            <div className="stat-tile">
              <div>
                <div className="stat-value">50+</div>
                <div className="stat-label">Localities Served</div>
              </div>
            </div>
            <div className="stat-tile">
              <div>
                <div className="stat-value">24/7</div>
                <div className="stat-label">Reporting Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
