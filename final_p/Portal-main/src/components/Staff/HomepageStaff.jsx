import React, {
  useEffect,
  useState,
  useMemo,
  Suspense,
  lazy
} from 'react';
import Sidebar from './Sidebar';
import './Style.css';
import { FaCalendarAlt } from 'react-icons/fa';

const LineChartComponent = lazy(() => import('./LineChartComponent'));
const API = 'http://localhost:5000';

export default function HomepageStaff() {
  const [students, setStudents] = useState([]);
  const [upcomingDrives, setUpcomingDrives] = useState([]);
  const [analytics, setAnalytics] = useState({
    TotaljobPosts: 0,
    ongoingRecruitment: 0,
    studentsApplied: 0
  });

  const [filterSkill, setFilterSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normaliseSkills = (skillsField) => {
    if (!skillsField) return [];
    if (Array.isArray(skillsField)) return skillsField;
    if (typeof skillsField === 'string') return skillsField.split(',').map(s => s.trim());
    return [];
  };

  const fetchStudentList = async () => {
    const res = await fetch(`${API}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department: 'all', batch: 'all' })
    });
    if (!res.ok) throw new Error(`/students ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.students) ? data.students : [];
  };

  const fetchDrives = async () => {
    const res = await fetch(`${API}/upcoming_drives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daysAhead: 30 })
    });
    if (!res.ok) throw new Error(`/upcoming_drives ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.upcomingDrives) ? data.upcomingDrives : [];
  };

  const fetchAnalytics = async () => {
    const res = await fetch(`${API}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        period: 'month',
        staffId: 'STAFF-001' // ← Change this to dynamic value if needed
      })
    });
    if (!res.ok) throw new Error(`/analytics ${res.status}`);
    return await res.json();
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [stu, drives, ana] = await Promise.all([
          fetchStudentList(),
          fetchDrives(),
          fetchAnalytics()
        ]);
        setStudents(stu);
        setUpcomingDrives(drives);
        setAnalytics({
          TotaljobPosts: ana.TotaljobPosts ?? 0,
          ongoingRecruitment: ana.ongoingRecruitment ?? 0,
          studentsApplied: ana.studentsApplied ?? 0
        });
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();

    const id = setInterval(async () => {
      try {
        setAnalytics(await fetchAnalytics());
        setUpcomingDrives(await fetchDrives());
      } catch (e) {
        console.warn('Auto-refresh failed:', e);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const filteredStudents = useMemo(() => {
    if (!filterSkill.trim()) return students;
    const key = filterSkill.toLowerCase();
    return students.filter(stu =>
      normaliseSkills(stu.skills).some(s => s.toLowerCase().includes(key))
    );
  }, [students, filterSkill]);

  if (loading) {
    return (
      <div className="containers">
        <Sidebar />
        <div className="main-content"><p>Loading…</p></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="containers">
        <Sidebar />
        <div className="main-content"><p style={{ color: 'red' }}>{error}</p></div>
      </div>
    );
  }

  return (
    <div className="containers">
      <Sidebar />

      <div className="main-content">
        <h1>Welcome to the Job Portal</h1>

        <div className="analytics-box">
          {[
            { label: 'Total Job Posts', value: analytics.TotaljobPosts, class: 'circle1' },
            { label: 'Ongoing Recruitment', value: analytics.ongoingRecruitment, class: 'circle2' },
            { label: 'Students Applied', value: analytics.studentsApplied, class: 'circle3' }
          ].map(({ label, value, class: cls }) => (
            <div key={label} className="circle-container">
              <div className={`circle ${cls}`}><p>{value}</p></div>
              <h2>{label}</h2>
            </div>
          ))}

          <div className="calendar-box">
            <h2>Upcoming Placement Drives</h2>
            {upcomingDrives.length ? upcomingDrives.map(d => (
              <div key={d.companyName + d.date} className="event">
                <FaCalendarAlt className="calendar-icon" />
                <div className="event-detail">
                  <h4>{d.companyName}</h4>
                  <p>{d.date}</p>
                </div>
              </div>
            )) : <p>No upcoming drives.</p>}
          </div>
        </div>

        <Suspense fallback={<p>Loading chart…</p>}>
          <LineChartComponent />
        </Suspense>

        <section className="filter-and-student-section">
          <h1>Student Details</h1>
          <input
            type="text"
            placeholder="Filter by skill…"
            value={filterSkill}
            onChange={e => setFilterSkill(e.target.value)}
          />

          <table className="student-details-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Skills</th>
                <th>Department</th>
                <th>Batch</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length ? filteredStudents.map(stu => (
                <tr key={stu.rollno}>
                  <td>{stu.rollno}</td>
                  <td>{stu.name}</td>
                  <td>{normaliseSkills(stu.skills).join(', ')}</td>
                  <td>{stu.department}</td>
                  <td>{stu.batch}</td>
                  <td>{stu.email}</td>
                </tr>
              )) : (
                <tr><td colSpan="6">No students match your filter.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
