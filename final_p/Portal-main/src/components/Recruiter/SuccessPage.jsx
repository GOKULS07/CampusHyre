import React, { useEffect, useState } from 'react';
import './Style.css';
import { IoLocationSharp } from 'react-icons/io5'; // Location icon
import { FaCalendarAlt } from 'react-icons/fa';     // Calendar icon
import { useNavigate } from 'react-router-dom';

function SuccessPage() {
  const navigate = useNavigate();
  const [allJobs, setAllJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Format date (DD/MM/YYYY)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid date";
    const day   = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year  = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fetch jobs on mount
  useEffect(() => {
    const email = sessionStorage.getItem('email');
    if (!email) {
      console.error('No email found in sessionStorage.');
      return;
    }

    fetch('http://localhost:5000/jobs_rec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch jobs');
        return response.json();
      })
      .then((data) => {
        console.log('Fetched jobs:', data);
        setAllJobs(data);
      })
      .catch((error) => {
        console.error('Error fetching jobs:', error);
      });
  }, []);

  // Filter and sort jobs
  const filteredJobs = allJobs
    .filter((job) =>
      job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));

  // Delete job (calls your Flask route)
  const handleDelete = (job_id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    fetch('http://localhost:5000/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to delete job');
        return response.json();
      })
      .then(() => {
        setAllJobs(allJobs.filter((job) => job.job_id !== job_id));
      })
      .catch((error) => {
        console.error('Error deleting job:', error);
      });
  };

  return (
    <div className="success-container1">
      <button className="back-arrow-button" onClick={() => navigate('/jobpost')}>
        ᐸ <span>Back to Jobs</span>
      </button>

      <h1 className="success-title">All Posted Jobs</h1>

      {/* Search bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Job Title"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Jobs listing */}
      {filteredJobs.length === 0 ? (
        <p className="empty-state">No jobs posted yet.</p>
      ) : (
        filteredJobs.map((job, index) => (
          <div key={index} className="job-details-card">
            <div className="job-card">
              <h2>{job.company} - {job.jobTitle}</h2>
              <p className="rupee"><strong>₹ {job.ctc}</strong></p>
              <p className="company-website">
                URL:
                <a href={job.website} target="_blank" rel="noopener noreferrer">
                  {job.website}
                </a>
              </p>
              <p><IoLocationSharp /> {job.location}</p>

              <div className="skills-deadline">
                <div className="skills">
                  {job.skills && job.skills.map((skill, idx) => (
                    <span key={idx} className="skill-item">{skill}</span>
                  ))}
                </div>
                <div className="deadline">
                  <FaCalendarAlt className="calendar-icon-new" />
                  <p>Deadline:</p>
                  <span>{formatDate(job.deadline)}</span>
                </div>
              </div>

              <div className="detail-style-change">
                <p><strong><span>Description:</span></strong> {job.jobDescription}</p>
                <p><strong><span>Responsibility:</span></strong> {job.jobResponsibility}</p>
                <p><strong><span>Requirement:</span></strong> {job.jobRequirement}</p>
              </div>

              {/* Uncomment if you want edit and delete buttons here */}
              <div className="other-jobs-btns">
                {/* <Link to="/edit-job" state={{ job }}><button>Edit</button></Link> */}
                <button className="job-dele" onClick={() => handleDelete(job.job_id)}>Delete</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default SuccessPage;
