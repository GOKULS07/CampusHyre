import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Student/Sidebar';
import studentData from './profileData.json';
import './Style.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const csvToArray = (input = '') =>
  input
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB');
};

const JobDetail = () => {
  const { job_id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [file, setFile] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsText, setAtsText] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const [isApplied, setIsApplied] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/jobs`);
        if (!r.ok) throw new Error('Failed to fetch jobs');
        const all = await r.json();

        const found = all.find(j => Number(j.job_id) === Number(job_id));
        if (!found) throw new Error('Job not found');

        setJob(found);

        const email = sessionStorage.getItem('email') || studentData.email;
        if (email) {
          const res = await fetch(`${API}/check_application_status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ job_id: found.job_id, email }),
          });
          if (res.ok) {
            const { isApplied } = await res.json();
            setIsApplied(Boolean(isApplied));
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [job_id]);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const onFilePicked = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      alert('Please upload a PDF resume');
      return;
    }
    setFile(f);
    setAtsText(null);
    setDownloadUrl(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    onFilePicked(e.dataTransfer.files[0]);
  };

  const runAts = async () => {
    if (!file) return alert('Upload a resume first');
    try {
      setAtsLoading(true);

      const fd = new FormData();
      fd.append('resume', file);
      fd.append('jobDescription', job.jobDescription);
      fd.append('jobRequirement', job.jobRequirement);
      fd.append('jobResponsibility', job.jobResponsibility);
      fd.append('jobSkills', Array.isArray(job.skills) ? job.skills.join(', ') : job.skills);
      fd.append('jobTitle', job.jobTitle);

      const res = await fetch(`${API}/ats_check`, { method: 'POST', body: fd });

      const txt = await res.text();
      setAtsText(txt);

      const blob = new Blob([txt], { type: 'text/plain' });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert('ATS check failed, try again later');
    } finally {
      setAtsLoading(false);
    }
  };

  const applyNow = async () => {
    if (isApplied) return navigate('/application-applied');
    if (!file) return alert('Upload your resume first');

    setApplyLoading(true);

    try {
      const email = sessionStorage.getItem('email') || studentData.email;

      const fd = new FormData();
      fd.append('job_id', job.job_id);
      fd.append('company', job.company);
      fd.append('role', job.jobTitle);
      fd.append('email', email);
      fd.append('resume', file);

      fd.append('studentName', studentData.name);
      fd.append('studentlinkedin', studentData.linkedin || '');
      fd.append('studentgithub', studentData.github || '');
      fd.append('studentskills', studentData.skills || '');

      const res = await fetch(`${API}/applyjobs`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());

      setIsApplied(true);
      navigate('/application-success');
    } catch (err) {
      console.error(err);
      alert(`Apply failed: ${err.message}`);
    } finally {
      setApplyLoading(false);
    }
  };

  const handleBack = () => {
    if (file && !window.confirm('You have selected a file. Are you sure you want to leave?')) {
      return;
    }
    navigate(-1);
  };

  if (loading) return <div className="loading-indicator">Loading job details...</div>;
  if (error)
    return (
      <div className="error-message">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );

  const skillsArr = Array.isArray(job.skills) ? job.skills : csvToArray(job.skills);

  return (
    <div className="containers">
      <Sidebar />

      <div className="job-detail-page">
        <button className="back-arrow-button" onClick={handleBack}>
          ᐸ <span>Back</span>
        </button>

        <h2>
          {job.company} – {job.jobTitle}
        </h2>

        {!!job.ctc && <p className="ctc">₹ {job.ctc}</p>}

        {job.website && (
          <p className="company-website">
            <a href={job.website} target="_blank" rel="noopener noreferrer">
              {job.website}
            </a>
          </p>
        )}

        <div className="skills">
          {skillsArr.map((s, i) => (
            <span key={i} className="skill">
              {s}
            </span>
          ))}
        </div>

        <div className="job-details">
          <h4>Job Description</h4>
          <p>{job.jobDescription}</p>

          {job.jobRequirement && (
            <>
              <h4>Requirements</h4>
              <ul>
                {job.jobRequirement.split('.').map(
                  (t, i) => t.trim() && <li key={i}>{t.trim()}.</li>
                )}
              </ul>
            </>
          )}

          {job.jobResponsibility && (
            <>
              <h4>Responsibilities</h4>
              <p>{job.jobResponsibility}</p>
            </>
          )}

          <p>
            <strong>Type:</strong> {job.jobtype}
          </p>
          <p>
            <strong>Location:</strong> {job.location}
          </p>
          <p>
            <strong>Deadline:</strong> {formatDate(job.deadline)}
          </p>
        </div>

        <h4>Upload your Resume (PDF)</h4>
        <div
          className="file-upload"
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? `Selected: ${file.name}` : 'Drag & drop or click to select'}
        </div>
        <input
          id="file-input"
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={e => onFilePicked(e.target.files[0])}
          style={{ display: 'none' }}
        />

        <div className="ats-section">
          <button className="ats-button" onClick={runAts} disabled={atsLoading}>
            {atsLoading ? 'Checking…' : 'Check ATS score'}
          </button>
        </div>

        {atsText && (
          <div className="ats-results">
            <h4>ATS Report:</h4>
            <textarea readOnly value={atsText} className="ats-textarea" />
            {downloadUrl && (
              <button
                className="download-report-button"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = downloadUrl;
                  a.download = `ATS_Report_${job.company}_${job.jobTitle}.txt`;
                  a.click();
                }}
              >
                Download report
              </button>
            )}
          </div>
        )}

        <div className="job-apply-student">
          <button
            className="apply-button"
            onClick={applyNow}
            disabled={applyLoading || !file || isApplied}
            title={!file ? 'Upload your resume first' : isApplied ? 'Already applied' : 'Apply now'}
          >
            {applyLoading ? 'Applying…' : isApplied ? 'Already Applied' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
