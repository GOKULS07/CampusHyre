import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaCalendarAlt } from 'react-icons/fa'; // Calendar icon
import { IoLocationSharp } from "react-icons/io5";
import './Style.css';

// Job Application Component
const ReceivedJobs = ({ job, deleteJob }) => {
  const skillsList = Array.isArray(job.skills) ? job.skills : job.skills.split(',');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <div className="job-details-card">
      <div className="job-card">
        <h2>{job.company} - {job.jobTitle}</h2>
        <p className='rupee'> <strong>₹ {job.ctc}</strong></p>
        <p> <IoLocationSharp /> {job.location}</p>

        <div className="skills-deadline">
          <div className="skills">
            {skillsList.map((skill, index) => (
              <span key={index}>{skill}</span>
            ))}
          </div>
          <div className="deadline">
            <FaCalendarAlt className="calendar-icon-new" />
            <p>Deadline: </p>
            <span>{formatDate(job.deadline)}</span>
          </div>
        </div>
        <p><strong>Description:</strong> {job.jobDescription}</p>

        <div className="staff-job">
          <button onClick={() => deleteJob(job.job_id)} className="delete-btn">
            Delete Job
          </button>
          <Link to={`/staff/${job.job_id}`}>View</Link>
        </div>

      </div>
    </div>
  );
};

// Job Application List Component
const Applications = () => {
  const [jobApplications, setJobApplications] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ jobTitle: '', skill: '', location: '' });

  useEffect(() => {
    const email = sessionStorage.getItem('email');
  
    fetch('http://localhost:5000/jobs_pro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Unauthorized access') {
          alert('Unauthorized access. Please log in again.');
        } else {
          setJobApplications(data);
          setFilteredJobs(data); // Initialize filteredJobs with all job data
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, [name]: value };
      applyFilters(updatedFilters); // Apply filters when any filter changes
      return updatedFilters;
    });
  };

  const applyFilters = (filters) => {
    let filtered = jobApplications;

    if (filters.jobTitle) {
      filtered = filtered.filter(job =>
        job.jobTitle?.toLowerCase().includes(filters.jobTitle.toLowerCase())
      );
    }

    if (filters.skill) {
      filtered = filtered.filter(job => {
        const skills = Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || '';
        return skills.toLowerCase().includes(filters.skill.toLowerCase());
      });
    }

    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredJobs(filtered); // Set the filtered jobs
  };

  // Function to handle delete job (only removes from frontend and stores in deleted jobs list)

  const deleteJob = (job_id) => {
  if (window.confirm('Are you sure you want to delete this job?')) {
    console.log("Deleting job with ID:", job_id); // Debug log

    fetch('http://localhost:5000/delete', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id,
        email: sessionStorage.getItem('email') // Include email in request body
      })
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to delete job.');
        return response.json();
      })
      .then((data) => {
        console.log(data.message);
        setJobApplications(prevJobs => prevJobs.filter(job => job.job_id !== job_id));
        setFilteredJobs(prevJobs => prevJobs.filter(job => job.job_id !== job_id));      })
      .catch((error) => {
        console.error('Error deleting job:', error);
      });
  }
};


  return (
    <div className="containers">
      <Sidebar />
      <div className="whole-job-des">
        <h1>New Job Posts</h1>
        <div className="content-wrapper">
          {/* Job Application Cards */}
          <div className="job-cards">
            {loading ? (
              <div className="loading-indicator">Loading...</div>
            ) : (
              filteredJobs.length === 0 ? (
                <h4>No jobs available</h4>
              ) : (
                filteredJobs.map((job) => (
                  <ReceivedJobs key={job.job_id} job={job} deleteJob={deleteJob} />
                ))
              )
            )}
          </div>

          {/* Filters Section */}
          <div className="filters-app">
            <h2>Filters</h2>

            <h4>Positions</h4>
            <input
              type="text"
              name="jobTitle"
              placeholder="Filter by Role"
              value={filters.jobTitle}
              onChange={handleFilterChange}
            />

            <h4>Skills</h4>
            <input
              type="text"
              name="skill"
              placeholder="Filter by Skill"
              value={filters.skill}
              onChange={handleFilterChange}
            />

            <h4>Location</h4>
            <input
              type="text"
              name="location"
              placeholder="Filter by Location"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applications;
