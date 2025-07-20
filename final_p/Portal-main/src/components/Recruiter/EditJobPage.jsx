import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Style.css';

/** ---------------------------------------------------------------------
 *  Centralise the back‑end URL in ONE place so you only ever edit it here
 *  -------------------------------------------------------------------*/
const API_BASE = 'http://localhost:5000';   //  Flask‑+‑Mongo runs on :5000

export default function EditJobPage () {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { job }    = location.state;           //  job object passed from <SuccessPage/>

  /** -------------------------------------------------------------------
   *  Local component state
   *  -----------------------------------------------------------------*/
  const [formData, setFormData] = useState({
    ...job,
    // normalise ISO date ↦ yyyy‑mm‑dd to suit <input type="date">
    deadline: job.deadline ? job.deadline.split('T')[0] : ''
  });
  const [skills,      setSkills]      = useState(job.skills || []);
  const [skillInput,  setSkillInput]  = useState('');
  const [isValid,     setIsValid]     = useState(true);
  const [saving,      setSaving]      = useState(false);

  /** -------------------------------------------------------------------
   *  Re‑validate every time formData | skills change
   *  -----------------------------------------------------------------*/
  useEffect(() => {
    const ok =
      Object.values(formData).every(v =>
        typeof v === 'string' ? v.trim() !== '' : v !== ''
      ) && skills.length > 0;
    setIsValid(ok);
  }, [formData, skills]);

  /*───────────────────────────────────────────────────────────────────*/
  /*  Field handlers                                                   */
  /*───────────────────────────────────────────────────────────────────*/
  const handleChange = e => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput.trim())) {
      setSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = s => setSkills(prev => prev.filter(x => x !== s));

  /*───────────────────────────────────────────────────────────────────*/
  /*  Update Job                                                       */
  /*───────────────────────────────────────────────────────────────────*/
  const handleUpdateJob = async () => {
    if (!isValid || saving) return;
    setSaving(true);

    const payload = {
      ...formData,
      skills,
      email   : sessionStorage.getItem('email'),  // recruiter / staff e‑mail
      job_id  : job.job_id                        // keep id explicit in body
    };

    try {
      const res = await fetch(`${API_BASE}/updated/${job.job_id}`, {
        method : 'POST',                 // your Flask route expects POST
        headers: { 'Content‑Type': 'application/json' },
        body   : JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());
      navigate('/success');
    } catch (err) {
      console.error('Error updating job', err);
      alert('Could not update.  Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /*───────────────────────────────────────────────────────────────────*/
  /*  JSX                                                              */
  /*───────────────────────────────────────────────────────────────────*/
  return (
    <div className='containers'>
      <Sidebar />

      <div className='main-content'>
        <h1>Edit Job Details</h1>

        <div className='form-container'>
          {/* ─── Job basics ───────────────────────────────────────── */}
          <h4 className='side-heading'>Job Details</h4>

          <div className='form-group'>
            <div className='formn-new-change'>
              <input id='jobTitle'  value={formData.jobTitle}  onChange={handleChange} placeholder='Job Title'   required />
              <input id='company'   value={formData.company}   onChange={handleChange} placeholder='Company'     required />
              <input id='location'  value={formData.location}  onChange={handleChange} placeholder='Location'    required />
              <input id='jobtype'   value={formData.jobtype}   onChange={handleChange} placeholder='Job Type'    required />
              <input id='website'   value={formData.website}   onChange={handleChange} placeholder='Website'     required />
              <input id='ctc'       value={formData.ctc}       onChange={handleChange} placeholder='CTC' type='number' required />
            </div>
          </div>

          {/* ─── Descriptions ────────────────────────────────────── */}
          <textarea id='jobDescription'  rows='4' placeholder='Job Description'
                    value={formData.jobDescription}  onChange={handleChange} required />
          <h4 className='side-heading'>Job Responsibilities</h4>
          <textarea id='jobResponsibility' rows='4'
                    value={formData.jobResponsibility} onChange={handleChange} required />
          <h4 className='side-heading'>Job Requirements</h4>
          <textarea id='jobRequirement' rows='4'
                    value={formData.jobRequirement} onChange={handleChange} required />

          {/* ─── Skills ──────────────────────────────────────────── */}
          <h4 className='side-heading'>Skills</h4>
          <div className='skills-input-container'>
            <input
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              placeholder='Add a skill and click "Add"'
            />
            <button onClick={addSkill}>Add Skill</button>
          </div>

          <div className='skills-list'>
            {skills.map(s => (
              <div key={s} className='skill-item'>
                <span>{s}</span>
                <button onClick={() => removeSkill(s)}>Remove</button>
              </div>
            ))}
          </div>

          {/* ─── Deadline ────────────────────────────────────────── */}
          <h4 className='side-heading'>Deadline</h4>
          <input
            type='date'
            id='deadline'
            value={formData.deadline}
            onChange={handleChange}
            required
          />

          {/* ─── Submit button ───────────────────────────────────── */}
          <button className='post-button'
                  disabled={!isValid || saving}
                  onClick={handleUpdateJob}>
            {saving ? 'Saving…' : 'Update Job'}
          </button>
        </div>
      </div>
    </div>
  );
}
