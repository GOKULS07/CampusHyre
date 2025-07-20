import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import './Style.css';

const API = 'http://localhost:5000';

export default function ApplicationStaff() {
  /* -------------- state -------------- */
  const [apps,          setApps]          = useState([]);
  const [filtered,      setFiltered]      = useState([]);

  const [skillKey,      setSkillKey]      = useState('');
  const [roleKey,       setRoleKey]       = useState('');

  const [selected,      setSelected]      = useState(null);
  const [feedback,      setFeedback]      = useState('');

  const [approvePopup,  setApprovePopup]  = useState(false);
  const [instruction,   setInstruction]   = useState('');
  const [approveId,     setApproveId]     = useState(null);

  const [designation,   setDesignation]   = useState(''); 
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  /* -------------- helpers -------------- */
  const fetchDesignation = async () => {
    const res  = await fetch(`${API}/get-user-type`, {
      headers: { email: sessionStorage.getItem('email') }
    });
    const data = await res.json();
    setDesignation(data.type ?? '');
  };

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);

    const email = sessionStorage.getItem('email');
    try {
      const res  = await fetch(`${API}/get_applied`, {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify({ email })
      });
      const data = await res.json();

      if (data.message === 'Unauthorized access') {
        alert('Unauthorized access. Please log in again.');
        window.location.href = '/';
        return;
      }

      setApps(data.applications ?? []);
      setFiltered(data.applications ?? []);
    } catch {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  /* -------------- lifecycle -------------- */
  useEffect(() => {
    fetchDesignation();
    fetchApplications();
  }, []);

  /* -------------- filtering -------------- */
  useEffect(() => {
    const sKey = skillKey.toLowerCase();
    const rKey = roleKey.toLowerCase();
    setFiltered(
      apps.filter(j =>
        (!sKey || (j.studentskills||'').toLowerCase().includes(sKey)) &&
        (!rKey || (j.jobTitle     ||'').toLowerCase().includes(rKey))
      )
    );
  }, [skillKey, roleKey, apps]);

  /* -------------- decline -------------- */
  const decline = async (job_id) => {
    if (!feedback.trim()) return alert('Fill the feedback form');

    await fetch(`${API}/feedbackSubmit`, {
      method : 'POST',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify({
        feedbackStaff : feedback,
        job_id,
        email         : sessionStorage.getItem('email'),
        jobTitle      : selected.jobTitle,
        company       : selected.jobName,
        status        : 'declined'
      })
    });
    await fetch(`${API}/reject/${job_id}`, { method:'PATCH' });

    setSelected(null);
    setFeedback('');
    fetchApplications();
  };

  /* -------------- approve -------------- */
  const openApprove = (job_id) => {
    setApproveId(job_id);
    setApprovePopup(true);
  };

  const sendApproval = async () => {
    if (!instruction.trim()) return alert('Provide instructions');
    await fetch(`${API}/approveApplication`, {
      method : 'POST',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify({
        job_id      : approveId,
        instruction : instruction,
        studentEmail: selected.studentEmail,
        jobTitle    : selected.jobTitle,
        email       : sessionStorage.getItem('email'),
        company     : selected.jobName,
        status      : 'approved'
      })
    });
    await fetch(`${API}/approve/${approveId}`, { method:'PATCH' });

    setInstruction('');
    setApprovePopup(false);
    setSelected(null);
    fetchApplications();
  };

  /* -------------- render -------------- */
  return (
    <div className="containers">
      <Sidebar />

      <div className="application-staff-container">
        <h1>Student Applied Jobs</h1>

        {/* filters */}
        <div className="filters">
          <input
            value={skillKey}
            onChange={e=>setSkillKey(e.target.value)}
            placeholder="🔍 Search Skills"
          />
          <input
            value={roleKey}
            onChange={e=>setRoleKey(e.target.value)}
            placeholder="Search Role"
          />
        </div>

        {loading && <p>Loading applications…</p>}
        {error   && <p style={{color:'red'}}>{error}</p>}

        {!loading && (
          filtered.length ? (
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>S.No</th><th>Name</th><th>Email</th>
                  <th>Skills</th><th>Company</th><th>Role</th>
                  <th>Resume</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((j,i)=>(
                  <tr key={j.job_id}>
                    <td>{i+1}</td>
                    <td>{j.studentName}</td>
                    <td>{j.studentEmail}</td>
                    <td>{j.studentskills}</td>
                    <td>{j.jobName}</td>
                    <td>{j.jobTitle}</td>
                    <td>
                      <a href={`${API}/get_resume_pdf/${j.job_id}`} target="_blank" rel="noreferrer">View</a>
                    </td>
                    <td>
                      <button onClick={()=>setSelected(j)}>
                        {j.status === 'approved' ? 'Accepted'
                          : j.status === 'declined' ? 'Rejected'
                          : 'Incomplete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No student data available.</p>
        )}

        {/* detail popup */}
        {selected && (
          <div className="popup-overlay">
            <div className="popup">
              <div className="popup-content">
                <button className="close-button" onClick={()=>setSelected(null)}>✕</button>

                <p><strong>Name:</strong>   {selected.studentName}</p>
                <p><strong>Email:</strong>  {selected.studentEmail}</p>
                <p><strong>Skills:</strong> {selected.studentskills}</p>
                <p><strong>LinkedIn:</strong> <a href={selected.studentlinkedin} target="_blank" rel="noreferrer">View</a></p>
                <p><strong>Github:</strong>   <a href={selected.studentgithub}   target="_blank" rel="noreferrer">View</a></p>
                <p><strong>Resume:</strong>   <a href={`${API}/get_resume_pdf/${selected.job_id}`} target="_blank" rel="noreferrer">View</a></p>
                <p><strong>Status:</strong>   {selected.status || 'Incomplete'}</p>

                {/* Only Staff can act */}
                {designation === 'Staff' && (
                  <>
                    <label>Feedback:</label>
                    <textarea
                      value={feedback}
                      onChange={e=>setFeedback(e.target.value)}
                      rows={4}
                      placeholder="Enter feedback"
                    />

                    <div className="popup-buttons">
                      <button className="decline-button" onClick={()=>decline(selected.job_id)}>Decline</button>
                      <button className="approve-button" onClick={()=>openApprove(selected.job_id)}>Approve</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* approval form (Staff only) */}
        {designation === 'Staff' && approvePopup && (
          <div className="approval-popup-overlay">
            <div className="approval-popup">
              <button className="close-button" onClick={()=>setApprovePopup(false)}>✕</button>
              <div className="popup-content">
                <h4>Approval Form</h4>
                <label>Add Instructions</label>
                <textarea
                  value={instruction}
                  onChange={e=>setInstruction(e.target.value)}
                  rows={4}
                  placeholder="Next step"
                />
                <button className="send-button" onClick={sendApproval}>Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
