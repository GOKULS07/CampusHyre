// src/pages/Jobposting.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar        from './Sidebar';
import './Style.css';

const API = 'http://localhost:5000';          // change once if the port/host moves

export default function Jobposting () {
  const nav = useNavigate();

  const [skills, setSkills] = useState([]);
  const [skillInp, setSkillInp] = useState('');

  const [form, setForm] = useState({
    company           : '',
    jobTitle          : '',
    location          : '',
    jobtype           : '',
    website           : '',
    ctc               : '',   // store only the lakh value
    jobResponsibility : '',
    jobRequirement    : '',
    jobDescription    : '',
    deadline          : ''
  });

  const [valid, setValid] = useState(false);

  /*──────────────────────────────────────────────────*/
  /*  Validate form whenever values change            */
  /*──────────────────────────────────────────────────*/
  useEffect(() => {
    const ok = Object.values(form).every(v => String(v).trim() !== '') && skills.length;
    setValid(ok);
  }, [form, skills]);

  /*──────────────────────────────────────────────────*/
  /*  Handlers                                        */
  /*──────────────────────────────────────────────────*/
  const addSkill    = () => {
    if (skillInp && !skills.includes(skillInp)) {
      setSkills([...skills, skillInp]);
      setSkillInp('');
    }
  };
  const removeSkill = s => setSkills(skills.filter(x => x !== s));

  const onChange = e => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  const postJob = async () => {
    const email = sessionStorage.getItem('email');
    if (!email) return alert('Session expired. Please log‑in again.');

    const payload = {
      ...form,
      ctc   : Number(form.ctc) * 100000,   // convert “5” → 500000
      skills,
      email
    };

    try {
      const r   = await fetch(`${API}/post_job`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(payload)
      });
      const res = await r.json();

      if (!r.ok) throw new Error(res.error || 'Server error');

      alert('Job posted successfully!');
      nav('/success', { state:{ jobData:res.jobData }});

    } catch (err) {
      console.error(err);
      alert(`Error posting job: ${err.message}`);
    }
  };

  /*──────────────────────────────────────────────────*/
  /*  Render                                          */
  /*──────────────────────────────────────────────────*/
  return (
    <div className="containers">
      <Sidebar />

      <div className="main-content">
        <div className="other-jobs">
          <h1>Post Job</h1>
          <a href="/success">All Posted Jobs</a>
        </div>

        <div className="form-container">
          <h4 className="side-heading">Job Detail</h4>

          <div className="form-group">
            <div className="formn-new-change">
              {['jobTitle','company','location','jobtype','website'].map(id => (
                <input key={id} id={id} value={form[id]} onChange={onChange} placeholder={id.replace(/^\w/,c=>c.toUpperCase())}/>
              ))}
              <input type="number" id="ctc" value={form.ctc} onChange={onChange} placeholder="CTC (in lakhs)"/>
            </div>
          </div>

          <textarea id="jobDescription" rows="4" placeholder="Job Description" value={form.jobDescription} onChange={onChange}/>
          <h4 className="side-heading">Job Responsibilities</h4>
          <textarea id="jobResponsibility" rows="4" value={form.jobResponsibility} onChange={onChange}/>
          <h4 className="side-heading">Job Requirements</h4>
          <textarea id="jobRequirement" rows="4" value={form.jobRequirement} onChange={onChange}/>

          <h4 className="side-heading">Skills</h4>
          <div className="skills-input-container">
            <input value={skillInp} onChange={e=>setSkillInp(e.target.value)} placeholder="Enter skill"/>
            <button onClick={addSkill}>Add Skill</button>
          </div>
          <div className="skills-list">
            {skills.map(s=>(
              <div key={s} className="skill-item">
                <span>{s}</span><button onClick={()=>removeSkill(s)}>Remove</button>
              </div>
            ))}
          </div>

          <h4 className="side-heading">Deadline</h4>
          <input type="date" id="deadline" value={form.deadline} onChange={onChange}/>

          <button className="post-button" disabled={!valid} onClick={postJob}>
            Post Job
          </button>
        </div>
      </div>
    </div>
  );
}
