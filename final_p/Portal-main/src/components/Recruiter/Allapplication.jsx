import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

export default function AllApplications() {
 
  const [applications, setApplications]       = useState([]);
  const [selectedJob,  setSelectedJob]        = useState(null);

  const [feedback,     setFeedback]           = useState('');
  const [showApprove,  setShowApprove]        = useState(false);
  const [instruction,  setInstruction]        = useState('');
  const [approveJobId, setApproveJobId]       = useState(null);

  const [designation,  setDesignation]        = useState('');   // "Staff" | "Recruiter"

  const navigate = useNavigate();

  /* ---------------- helpers ---------------- */
  const fetchDesignation = async () => {
    const res  = await fetch(`${API}/get-user-type`, {
      headers: { email: sessionStorage.getItem('email') }
    });
    const data = await res.json();
    setDesignation(data.type ?? '');           // backend returns {"type":"Recruiter"}
  };

  const fetchApplications = async () => {
    const email = sessionStorage.getItem('email');
    const res   = await fetch(`${API}/alljobs`, {
      method : 'POST',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify({ email })
    });
    const data = await res.json();
    const filtered = (data.applications || []).filter(app =>
      app.status === 0 || app.status === 2
    );
    setApplications(filtered);
  };

  /* ---------------- lifecycle ---------------- */
  useEffect(() => {
    fetchDesignation();
    fetchApplications();
  }, []);

  /* ---------------- decline ---------------- */
  const handleDecline = async (job_id) => {
    if (!feedback.trim()) return alert('Fill the feedback form');

    await fetch(`${API}/feedbackSubmit`, {
      method : 'POST',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify({
        feedbackStaff : feedback,
        job_id,
        email         : sessionStorage.getItem('email'),
        jobTitle      : selectedJob.jobTitle,
        company       : selectedJob.jobName,
        status        : 'declined'
      })
    });

    await fetch(`${API}/reject/${job_id}`, { method:'PATCH' });
    setFeedback('');
    setSelectedJob(null);
    fetchApplications();
  };

  /* ---------------- approve ---------------- */
  const openApprovePopup = (job_id) => {
    setApproveJobId(job_id);
    setShowApprove(true);
  };

  const sendApproval = async () => {
    if (!instruction.trim()) {
      return alert('Provide instructions before sending');
    }
    await fetch(`${API}/approveApplication`, {
      method : 'POST',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify({
        job_id      : approveJobId,
        instruction : instruction,
        studentEmail: selectedJob.studentEmail,
        jobTitle    : selectedJob.jobTitle,
        email       : sessionStorage.getItem('email'),
        company     : selectedJob.jobName,
        status      : 'approved'
      })
    });
    await fetch(`${API}/approve/${approveJobId}`, { method:'PATCH' });
    setInstruction('');
    setShowApprove(false);
    setSelectedJob(null);
    fetchApplications();
  };

  /* ---------------- render ---------------- */
  return (
    <div className="all-applications-container">
      <button className="back-arrow-button" onClick={() => navigate(-1)}>
        ᐸ <span>Back to Jobs</span>
      </button>

      <div className="whole-new-all">
        <h1>All Applications</h1>

        {applications.length
          ? (
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>S.No</th><th>Name</th><th>Email</th><th>Skills</th>
                  <th>Role</th><th>Resume</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app,i)=>(
                  <tr key={app.job_id}>
                    <td>{i+1}</td>
                    <td>{app.studentName}</td>
                    <td>{app.studentEmail}</td>
                    <td>{app.studentskills}</td>
                    <td>{app.jobTitle}</td>
                    <td>
                      <a href={`${API}/get_resume_pdf/${app.job_id}`} target="_blank" rel="noreferrer">
                        View
                      </a>
                    </td>
                    <td>
                      <span
                        className="status-text"
                        style={{
                          color: app.status === 2 ? 'green' : 'red',
                          fontWeight:'bold', cursor:'pointer'
                        }}
                        onClick={()=>setSelectedJob(app)}
                      >
                        {app.status === 2 ? 'Accepted' : 'Rejected'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
          : <p>No approved or rejected applications available.</p>}
      </div>

      {/* ── detail popup ─────────────────────────── */}
      {selectedJob && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-content">
              <button className="close-button" onClick={()=>setSelectedJob(null)}>✕</button>

              <p><strong>Name:</strong> {selectedJob.studentName}</p>
              <p><strong>Email:</strong> {selectedJob.studentEmail}</p>
              <p><strong>Skills:</strong> {selectedJob.studentskills}</p>
              <p><strong>LinkedIn:</strong> <a href={selectedJob.studentlinkedin} target="_blank" rel="noreferrer">View</a></p>
              <p><strong>Github:</strong> <a href={selectedJob.studentgithub} target="_blank" rel="noreferrer">View</a></p>
              <p><strong>Resume:</strong> <a href={`${API}/get_resume_pdf/${selectedJob.job_id}`} target="_blank" rel="noreferrer">View</a></p>
              <p><strong>Status:</strong> {selectedJob.status === 2 ? 'Accepted' : 'Rejected'}</p>

              {/* Only recruiters can see these controls */}
              {designation === 'Recruiter' && (
                <>
                  <label>Feedback:</label>
                  <input
                    value={feedback}
                    onChange={e=>setFeedback(e.target.value)}
                    placeholder="Enter feedback"
                  />
                  <div className="popup-buttons">
                    <button className="decline-button" onClick={()=>handleDecline(selectedJob.job_id)}>Decline</button>
                    <button className="approve-button" onClick={()=>openApprovePopup(selectedJob.job_id)}>Approve</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── approval popup ────────────────────────── */}
      {designation === 'Recruiter' && showApprove && (
        <div className="approval-popup-overlay">
          <div className="approval-popup">
            <button className="close-button" onClick={()=>setShowApprove(false)}>✕</button>
            <div className="popup-content">
              <h4>Approval Form</h4>
              <label>Add Instructions</label>
              <input
                value={instruction}
                onChange={e=>setInstruction(e.target.value)}
                placeholder="Next step"
              />
              <button className="send-button" onClick={sendApproval}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
