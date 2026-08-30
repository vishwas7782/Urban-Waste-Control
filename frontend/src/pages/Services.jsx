import {
  FiHome,
  FiCamera,
  FiBell,
  FiGrid,
  FiMonitor,
  FiMapPin,
  FiBarChart2,
  FiSmile,
  FiSmartphone,
} from 'react-icons/fi';

const services = [
  {
    icon: <FiHome />,
    title: 'Waste Management for Residents',
    points: [
      'Raise waste-collection concerns online',
      'Track each concern from pending to resolved',
      'Get timely pickup for your locality',
    ],
  },
  {
    icon: <FiCamera />,
    title: 'Public Garbage Reporting',
    points: [
      'Report garbage in public spaces',
      'Attach a photo and precise location',
      'Report with or without an account',
    ],
  },
  {
    icon: <FiBell />,
    title: 'Real-Time Notifications',
    points: [
      'Instant status updates on reports',
      'Stay informed on collection schedules',
      'Never miss a resolution update',
    ],
  },
  {
    icon: <FiGrid />,
    title: 'Municipal Dashboard',
    points: [
      'Manage concerns and garbage reports',
      'Mark issues solved or remove them',
      'Assign collection schedules by area',
    ],
  },
  {
    icon: <FiMonitor />,
    title: 'Public Dashboard',
    points: [
      'Browse collection schedules by area',
      'Access key info without logging in',
      'Stay updated on your neighbourhood',
    ],
  },
  {
    icon: <FiMapPin />,
    title: 'Photo & Location-Based Reporting',
    points: [
      'Upload images of the problem',
      'Pinpoint the exact location and landmark',
      'Give teams the context they need',
    ],
  },
  {
    icon: <FiBarChart2 />,
    title: 'Data Analytics for Municipalities',
    points: [
      'Summary counts across all reports',
      'Spot trends and recurring hotspots',
      'Make data-driven decisions',
    ],
  },
  {
    icon: <FiSmile />,
    title: 'User-Friendly Interface',
    points: [
      'Clean, modern and intuitive design',
      'Accessible forms and clear feedback',
      'Simple flows for every user',
    ],
  },
  {
    icon: <FiSmartphone />,
    title: 'Mobile Access',
    points: [
      'Fully responsive on any device',
      'Report on the go from your phone',
      'Optimised down to small screens',
    ],
  },
];

export default function Services() {
  return (
    <div className="page container fade-in">
      <div className="text-center">
        <span className="eyebrow">Our Services</span>
        <h1 className="section-title">Everything you need for cleaner cities</h1>
        <p className="section-subtitle">
          A complete toolkit for residents and municipalities to manage urban
          waste efficiently.
        </p>
      </div>

      <div className="grid grid-3">
        {services.map((s, i) => (
          <div key={s.title} className="card card-hover service-card">
            <span className="service-num">{i + 1}</span>
            <span className="feature-icon" aria-hidden="true">
              {s.icon}
            </span>
            <h3 style={{ fontSize: '1.1rem' }}>{s.title}</h3>
            <ul>
              {s.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
