import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import './Style.css';

/* ──────────────────────────────────────────────────────────── */
const API = 'http://localhost:5000';        // ← change here if the Flask URL moves

const STATUS = {
  PENDING : 1,   // “Incomplete”  in the table – waiting for staff action
  DECLINED: 0,
  APPROVED: 2
};

/* ──────────────────────────────────────────────────────────── */
export default function ApplicationStaff () {
  /* ---------- data ------------------------------------------------------- */
  const [rawJobs,         setRawJobs]         = useState([]);
  const [filteredJobs,    setFilteredJobs]    = useState([]);
  const [loading,         setLoading]         = useState(false);

  /* ---------- UI helpers ------------------------------------------------- */
  const [skillsFilter,    setSkillsFilter]    = useState('');
  const [roleFilter,      setRoleFilter]      = useState('');

  const [selectedJob,     setSelectedJob]     = useState(null);   // decline popup
  const [feedbackStaff,   setFeedbackStaff]   = useState('');

  const [approvePopup,    setApprovePopup]    = useState(false);
  const [approvalMsg,     setApprovalMsg]     = useState('');
  const [approvedJobId,   setApprovedJobId]   = useState(null);

  /* ─────────────── helpers ─────────────────────────────────────────────── */
  const email = sessionStorage.getItem('email');

  const fetchApplications = useCallback(() => {
    if (!email) return;

    setLoading(true);
    fetch(`${API}/get_applied_rec`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ email })
    })
      .then(r => r.json())
      .then(json => {
        if (json.message === 'Unauthorized access') {
          alert('Session expired. Please log in again.');
          window.location.href = '/';
          return;
        }

        setRawJobs(Array.isArray(json.applications) ? json.applications : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [email]);

  /* ─────────────── initial load ────────────────────────────────────────── */
  useEffect(fetchApplications, [fetchApplications]);

  /* ─────────────── filter logic with debounce ──────────────────────────── */
  useEffect(() => {
    const id = setTimeout(() => {
      const sf = skillsFilter.trim().toLowerCase();
      const rf = roleFilter.trim().toLowerCase();

      setFilteredJobs(
        rawJobs.filter(j => {
          const jobSkills = (j.studentskills || '').toLowerCase();
          const jobTitle  = (j.jobTitle      || '').toLowerCase();

          const passSkills = !sf || jobSkills.includes(sf);
          const passRole   = !rf || jobTitle .includes(rf);

          return passSkills && passRole;
        })
      );
    }, 300);            // debounce 300 ms

    return () => clearTimeout(id);
  }, [skillsFilter, roleFilter, rawJobs]);

  /* ─────────────── decline flow ────────────────────────────────────────── */
  const submitDecline = (jobId) => {
    if (!feedbackStaff.trim()) {
      alert('Please enter feedback before declining.');
      return;
    }

    fetch(`${API}/feedbackSubmit`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        feedbackStaff,
        job_id     : jobId,
        email,
        jobTitle   : selectedJob.jobTitle,
        company    : selectedJob.jobName,
        status     : 'declined'
      })
    })
      .then(r => r.json())
      .then(() => fetch(`${API}/reject/${jobId}`, { method: 'PATCH' }))
      .then(()   => {
        alert('Declined & feedback sent 🎉');
        resetPopups();
        fetchApplications();
      })
      .catch(err => console.error(err));
  };

  /* ─────────────── approve flow ───────────────────────────────────────── */
  const openApprovePopup = (job) => {
    setApprovedJobId(job.job_id);
    setSelectedJob(job);          // reuse for e‑mail fields
    setApprovePopup(true);
  };

  const sendApprove = () => {
    if (!approvalMsg.trim()) {
      alert('Instruction field cannot be empty.');
      return;
    }

    fetch(`${API}/approveApplication`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        job_id       : approvedJobId,
        instruction  : approvalMsg,
        studentEmail : selectedJob.studentEmail,
        jobTitle     : selectedJob.jobTitle,
        company      : selectedJob.jobName,
        email,
        status       : 'approved'
      })
    })
      .then(r => r.json())
      .then(() => fetch(`${API}/approve/${approvedJobId}`, { method: 'PATCH' }))
      .then(()   => {
        alert('Approval sent ✅');
        resetPopups();
        fetchApplications();
      })
      .catch(err => console.error(err));
  };

  /* ─────────────── utilities ───────────────────────────────────────────── */
  const resetPopups = () => {
    setSelectedJob(null);
    setFeedbackStaff('');
    setApprovePopup(false);
    setApprovalMsg('');
    setApprovedJobId(null);
  };

  const statusBadge = (s) => {
    switch (s) {
      case STATUS.APPROVED: return <span className="status approved">Accepted</span>;
      case STATUS.DECLINED: return <span className="status declined">Rejected</span>;
      default             : return <button className="view-button">Incomplete</button>;
    }
  };

  /* ─────────────── render ──────────────────────────────────────────────── */
  return (
    <div className="containers">
      <Sidebar />

      <div className="application-staff-container">
        <div className="sided-bar-align">
          <h1>Student Applied Jobs</h1>
          <a href="/all-applications">View All Applications</a>
        </div>

        {/* ─── filters ─────────────────── */}
        <div className="filters">
          <input
            placeholder="🔍 Search Skills"
            value={skillsFilter}
            onChange={(e) => setSkillsFilter(e.target.value)}
          />
          <input
            placeholder="Search Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
        </div>

        {/* ─── table / loader ───────────── */}
        {loading ? (
          <p className="loading">Loading…</p>
        ) : filteredJobs.length ? (
          <table className="jobs-table">
            <thead>
              <tr>
                <th>S.No</th><th>Name</th><th>Email</th>
                <th>Skills</th><th>Role</th><th>Resume</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((j, i) => (
                <tr key={j.job_id}>
                  <td>{i + 1}</td>
                  <td>{j.studentName}</td>
                  <td>{j.studentEmail}</td>
                  <td>{j.studentskills}</td>
                  <td>{j.jobTitle}</td>
                  <td>
                    <a
                      href={`${API}/get_resume_pdf/${j.job_id}`}
                      target="_blank" rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </td>
                  <td onClick={() => j.status === STATUS.PENDING && setSelectedJob(j)}>
                    {statusBadge(j.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No applications found.</p>
        )}

        {/* ─── decline popup  ─────────────────────────────────────────── */}
        {selectedJob && (
          <div className="popup-overlay">
            <div className="popup">
              <button className="close-button" onClick={resetPopups}>✕</button>

              <h2>{selectedJob.studentName}</h2>
              <p><strong>E‑mail:</strong> {selectedJob.studentEmail}</p>
              <p><strong>Skills:</strong> {selectedJob.studentskills}</p>
              <p><strong>LinkedIn:</strong> <a href={selectedJob.studentlinkedin} target="_blank" rel="noreferrer">Profile</a></p>
              <p><strong>GitHub:</strong>  <a href={selectedJob.studentgithub}  target="_blank" rel="noreferrer">Profile</a></p>
              <p><strong>Resume:</strong> <a href={`${API}/get_resume_pdf/${selectedJob.job_id}`} target="_blank" rel="noreferrer">View</a></p>

              <label>Feedback (required to decline):</label>
              <input
                value={feedbackStaff}
                onChange={(e) => setFeedbackStaff(e.target.value)}
                placeholder="Enter feedback"
              />

              <div className="popup-buttons">
                <button className="decline-button" onClick={() => submitDecline(selectedJob.job_id)}>Decline</button>
                <button className="approve-button" onClick={() => openApprovePopup(selectedJob)}>Approve</button>
              </div>
            </div>
          </div>
        )}

        {/* ─── approval popup ──────────────────────────────────────────── */}
        {approvePopup && (
          <div className="approval-popup-overlay">
            <div className="approval-popup">
              <button className="close-button" onClick={resetPopups}>✕</button>

              <h4>Approval Form</h4>
              <label>Instruction / next steps for the student</label>
              <input
                value={approvalMsg}
                onChange={(e) => setApprovalMsg(e.target.value)}
                placeholder="e.g. Schedule HR interview on …"
              />

              <div className="popup-buttons">
                <button className="send-button" onClick={sendApprove}>Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
