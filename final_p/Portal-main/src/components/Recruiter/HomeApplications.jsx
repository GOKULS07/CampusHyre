// src/pages/HomeApplications.jsx
import React, { useEffect, useState } from 'react';
import { IoLocationSharp } from 'react-icons/io5';
import { FaCalendarAlt }       from 'react-icons/fa';
import { Link, useNavigate }   from 'react-router-dom';
import './Style.css';

const API = 'http://localhost:5000';   

export default function HomeApplications () {
  const [jobs,        setJobs]        = useState([]);
  const [search,      setSearch]      = useState('');
  const [auth,        setAuth]        = useState(false);
  const [loading,     setLoading]     = useState(true);
  const navigate = useNavigate();

  /*───────────────────────────────────────────────────────────────────*/
  /*  1. Check session on mount                                       */
  /*───────────────────────────────────────────────────────────────────*/
  useEffect(() => {
    const email = sessionStorage.getItem('email');
    if (!email) { alert('Please log‑in first'); return navigate('/'); }

    fetch(`${API}/check_session`, {
      method : 'POST',
      headers: {'Content-Type':'application/json'},
      body   : JSON.stringify({ email })
    })
      .then(r => r.json().then(j => ({ ok:r.ok, j })))
      .then(({ ok,j }) => {
        if (!ok) throw new Error(j.message || 'unauthorised');
        setAuth(true);
      })
      .catch(err => {
        alert(err.message); navigate('/');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  /*───────────────────────────────────────────────────────────────────*/
  /*  2. Fetch jobs after we’re authorised                            */
  /*───────────────────────────────────────────────────────────────────*/
  useEffect(() => {
    if (!auth) return;
    const email = sessionStorage.getItem('email');

    fetch(`${API}/jobs_rec`, {
      method : 'POST',
      headers: {'Content-Type':'application/json'},
      body   : JSON.stringify({ email })
    })
      .then(r => {
        if (!r.ok) throw new Error('Cannot load jobs');
        return r.json();
      })
      .then(data => setJobs(data))
      .catch(console.error);
  }, [auth]);

  /*───────────────────────────────────────────────────────────────────*/
  /*  Helpers                                                         */
  /*───────────────────────────────────────────────────────────────────*/
  const formatDate = iso => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Invalid date';
    return `${d.getDate().toString().padStart(2,'0')}/${
            (d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
  };

  const deleteJob = id => {
    fetch(`${API}/delete`, {
      method : 'POST',
      headers: {'Content-Type':'application/json'},
      body   : JSON.stringify({ job_id: id })   // Flask route still expects job_id? fine.
    })
      .then(r => r.json())
      .then(() => setJobs(jobs.filter(j => j._id !== id)))
      .catch(console.error);
  };

  /*───────────────────────────────────────────────────────────────────*/
  /*  Derived lists                                                   */
  /*───────────────────────────────────────────────────────────────────*/
  const visible = jobs
    .filter(j => j.jobTitle.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => new Date(b.createdAt || b.datePosted) -
                   new Date(a.createdAt || a.datePosted));

  /*───────────────────────────────────────────────────────────────────*/
  /*  Render                                                          */
  /*───────────────────────────────────────────────────────────────────*/
  if (loading)      return <div className='loading'>Loading…</div>;
  if (!auth)        return null;

  return (
    <div className='success-container'>
      <h3>Active Posted Jobs</h3>

      <input className='search-input'
             placeholder='Search by Job Title'
             value={search}
             onChange={e=>setSearch(e.target.value)} />

      {visible.length === 0 && <p className='empty-state'>No jobs posted yet.</p>}

      {visible.map(j => (
        <div key={j._id} className='job-details-card'>
          <div className='job-card'>
            <h2>{j.company} – {j.jobTitle}</h2>
            <p className='rupee'><strong>₹ {j.ctc}</strong></p>
            <p><IoLocationSharp/>{j.location}</p>

            <div className='skills-deadline'>
              <div className='skills'>
                {(j.skills || []).map(s =>
                  <span key={s} className='skill-item'>{s}</span>)}
              </div>
              <div className='deadline'>
                <FaCalendarAlt className='calendar-icon-new' />
                <p>Deadline:</p><span>{formatDate(j.deadline)}</span>
              </div>
            </div>

            <p><strong>Description: </strong>{j.jobDescription}</p>

            <div className='other-jobs-btns'>
              {/* Send doc WITH Mongo’s _id but keep existing route: */}
              <Link to='/edit-job' state={{ job: { ...j, deadline:j.deadline?.split('T')[0] } }}>
                <button>Edit</button>
              </Link>

              <button className='job-dele' onClick={()=>deleteJob(j._id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
