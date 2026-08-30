import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiCalendar, FiUser, FiClock, FiMapPin } from 'react-icons/fi';
import client, { apiErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';

export default function PublicSchedule() {
  const [area, setArea] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    if (!area.trim()) {
      toast.error('Please enter an area to search.');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await client.get('/public-schedule', {
        params: { area: area.trim() },
      });
      setSchedules(Array.isArray(data?.schedules) ? data.schedules : []);
    } catch (error) {
      setSchedules([]);
      toast.error(apiErrorMessage(error, 'Could not load schedules.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container fade-in">
      <div className="text-center">
        <span className="eyebrow">View Schedule</span>
        <h1 className="section-title">Waste Collection Schedule</h1>
        <p className="section-subtitle">
          Search by area to see upcoming waste-collection schedules in your
          neighbourhood.
        </p>
      </div>

      <form className="search-bar" onSubmit={search} style={{ maxWidth: 620, margin: '0 auto 2rem' }}>
        <input
          className="input"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Enter your area (e.g. Sector 5)"
          aria-label="Area"
        />
        <button className="btn btn-primary" disabled={loading}>
          <FiSearch aria-hidden="true" /> Search
        </button>
      </form>

      {loading && <Loader label="Fetching schedules..." />}

      {!loading && searched && schedules.length === 0 && (
        <div className="empty-state">
          <p style={{ margin: 0 }}>No schedules found for &quot;{area}&quot;.</p>
        </div>
      )}

      {!loading && schedules.length > 0 && (
        <div className="grid grid-3">
          {schedules.map((s) => (
            <div key={s._id} className="card card-hover">
              <span className="feature-icon">
                <FiCalendar />
              </span>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>
                <FiMapPin aria-hidden="true" /> {s.area}
              </h3>
              <div className="record-meta">
                <span>
                  <FiUser aria-hidden="true" /> <strong>Employee:</strong>{' '}
                  {s.employeeName}
                </span>
                <span>
                  <FiCalendar aria-hidden="true" /> <strong>Day:</strong> {s.day}
                </span>
                <span>
                  <FiCalendar aria-hidden="true" /> <strong>Date:</strong> {s.date}
                </span>
                <span>
                  <FiClock aria-hidden="true" /> <strong>Time:</strong> {s.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
