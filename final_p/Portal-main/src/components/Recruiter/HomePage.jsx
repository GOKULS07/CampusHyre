// src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar                from './Sidebar';
import HomeApplications       from './HomeApplications';
import './Style.css';

const API = 'http://localhost:5000';   // <- single place to change later

export default function HomePage () {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingApprovals     : 0,
    applicationsReceived : 0,
    activeJobPosts       : 0,
    jobsPosted           : 0,
  });
  const [loading, setLoading] = useState(true);

  /*────────────────────────────────────────────────────*/
  /*  1) Fetch stats once on mount                      */
  /*────────────────────────────────────────────────────*/
  const fetchStats = useCallback(async () => {
    const email = sessionStorage.getItem('email');
    if (!email) return navigate('/');               // not logged in

    try {
      const r = await fetch(`${API}/stat`, {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify({ email })
      });
      if (!r.ok) throw new Error('Cannot load dashboard stats');

      const data = await r.json();
      setStats({
        jobsPosted          : data.jobsPosted          ?? 0,
        activeJobPosts      : data.activeJobPosts      ?? 0,
        applicationsReceived: data.applicationsReceived?? 0,
        pendingApprovals    : data.pendingApprovals    ?? 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  /*────────────────────────────────────────────────────*/
  /*  2) Helper to render the four coloured cards       */
  /*────────────────────────────────────────────────────*/
  const card = (label, value, bg) => (
    <div className="recruit-box" style={{ backgroundColor:bg }}>
      <h3>{label}</h3>
      <p>{loading ? 'Loading…' : value}</p>
    </div>
  );

  /*────────────────────────────────────────────────────*/
  /*  3) Render                                         */
  /*────────────────────────────────────────────────────*/
  return (
    <>
      <div className="containers">
        <Sidebar />

        <div className="centered-text">
          <h1>Welcome to the Job Portal</h1>

          <div className="recruiter-section">
            {card('Job Posted',            stats.jobsPosted,           '#68AD5D')}
            {card('Active Job Posts',      stats.activeJobPosts,       '#4FB6CA')}
            {card('Application Received',  stats.applicationsReceived, '#E69F50')}
            {card('Pending Approvals',     stats.pendingApprovals,     '#8748B1')}
          </div>
        </div>
      </div>

      {/* Active job‑post listings */}
      <div className="job-posted-details">
        <HomeApplications />
      </div>
    </>
  );
}
