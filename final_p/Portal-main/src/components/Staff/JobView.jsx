// src/pages/JobView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Style.css';

const API = 'http://localhost:5000';

export default function JobView () {
  const { job_id } = useParams();          
  const navigate   = useNavigate();

  const [job,     setJob]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  /* ───────────────────── fetch job once ───────────────────── */
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);

        /* 1️⃣  Try a dedicated endpoint (faster) */
        const direct = await fetch(`${API}/jobs/${encodeURIComponent(job_id)}`);
        if (direct.ok) {
          const single = await direct.json();
          setJob(single);
          setError(null);
          return;
        }

        /* 2️⃣  Fallback: GET full list then filter */
        const listRes = await fetch(`${API}/jobs`);
        if (!listRes.ok) throw new Error('Failed to fetch jobs list');

        const all = await listRes.json();
        const found = all.find(j => String(j.job_id) === String(job_id));

        if (!found) throw new Error('Job not found');
        setJob(found);
        setError(null);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.message || 'Error fetching job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [job_id]);

  /* ───────────────────── helpers ───────────────────── */
  const formatDate = iso => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? 'Invalid date'
      : `${d.getDate().toString().padStart(2,'0')}/${
          (d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
  };

  /* ───────────────────── early returns ───────────────────── */
  if (loading) return <div className="loading-indicator">Loading…</div>;
  if (error)   return <div className="error-message">{error}</div>;

  /* ───────────────────── render ───────────────────── */
  return (
    <>
      <Sidebar />

      <div className="job-detail-page">
        <button className="back-arrow-button" onClick={() => navigate(-1)}>
          ᐸ <span>Back to Jobs</span>
        </button>

        <h2>{job.company} – {job.jobTitle}</h2>
        <p className="ctc">₹ {job.ctc}</p>

        {job.website && (
          <p className="company-website">
            <i>
              <a href={job.website} target="_blank" rel="noopener noreferrer">
                {job.website}
              </a>
            </i>
          </p>
        )}

        {/* Skills */}
        <div className="skills">
          {Array.isArray(job.skills)
            ? job.skills.map((s,i) => <span key={i} className="skill">{s}</span>)
            : String(job.skills ?? '')
                .split(',')
                .filter(Boolean)
                .map((s,i) => <span key={i} className="skill">{s.trim()}</span>)}
        </div>

        {/* Details */}
        <div className="job-details">
          <h4><strong>Job Description</strong></h4>
          <p>{job.jobDescription}</p>

          <h4><strong>Job Type:</strong> <span className="new-detail">{job.jobtype}</span></h4>

          <h4><strong>Job Requirements</strong></h4>
          <ul>
            {job.jobRequirement?.split('.').map((sent,i) =>
              sent.trim() ? <li key={i}>{sent.trim()}.</li> : null)}
          </ul>

          <h4><strong>Job Responsibilities</strong></h4>
          <p>{job.jobResponsibility}</p>

          <h4><strong>Location:</strong> <span className="new-detail">{job.location}</span></h4>

          <h4><strong>Deadline:</strong> <span className="new-detail">{formatDate(job.deadline)}</span></h4>
        </div>
      </div>
    </>
  );
}
