// src/pages/AccountStudent.jsx
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
           // optional styling

const API = 'http://localhost:5000';

const FIELDS = [
  { key: 'name',        label: 'Name' },
  { key: 'roll_number', label: 'Roll No' },
  { key: 'department',  label: 'Department' },
  { key: 'batch',       label: 'Batch' },
  { key: 'dob',         label: 'Date of Birth',   type: 'date' },
  { key: 'phone',       label: 'Phone' },
  { key: 'github',      label: 'GitHub URL' },
  { key: 'linkedin',    label: 'LinkedIn URL' }
  // add more if you store them in Mongo
];

export default function AccountStudent () {
  const [data,        setData]        = useState(null);
  const [editable,    setEditable]    = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  /* ─────────── Fetch once on mount ─────────── */
  useEffect(() => {
    const email = sessionStorage.getItem('email');
    if (!email) {
      setError('Email missing in sessionStorage. Log in again.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res  = await fetch(`${API}/student?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        let   json = await res.json();

        // normalise shape --------------------------------------------------
        //  1.  { student:{…} }
        if (json && json.student)       json = json.student;
        //  2.  [ {…} ]
        if (Array.isArray(json))        json = json[0] ?? null;

        if (!json) {
          setError('No student record found.');
        } else {
          // assure yyyy‑mm‑dd for <input type="date">
          if (json.dob) {
            const d = new Date(json.dob);
            json.dob = d.toISOString().split('T')[0];
          }
          setData(json);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ─────────── Handlers ─────────── */
  const onChange = e =>
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onSave = async () => {
    const email = sessionStorage.getItem('email');
    try {
      const res = await fetch(
        `${API}/student_update?email=${encodeURIComponent(email)}`,
        {
          method : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify(data)
        }
      );
      if (!res.ok) throw new Error(`Save failed ${res.status}`);
      const saved = await res.json();
      if (saved.dob) {
        const d = new Date(saved.dob);
        saved.dob = d.toISOString().split('T')[0];
      }
      setData(saved);
      setEditable(false);
      alert('Profile updated ✔');
    } catch (err) {
      console.error(err);
      alert('Could not save profile. Try again.');
    }
  };

  /* ─────────── Render ─────────── */
  if (loading) return (
    <div className="containers"><Sidebar/><p className="center">Loading…</p></div>
  );
  if (error)   return (
    <div className="containers"><Sidebar/><p className="error center">{error}</p></div>
  );

  return (
    <div className="containers">
      <Sidebar />

      <div className="profile-wrapper">
        <h1>Student Profile</h1>

        {FIELDS.map(({ key, label, type }) => (
          <div className="field-row" key={key}>
            <label>{label}</label>
            <input
              name={key}
              type={type ?? 'text'}
              value={data[key] ?? ''}
              readOnly={!editable}
              onChange={onChange}
            />
          </div>
        ))}

        <button
          className="primary-btn"
          onClick={editable ? onSave : () => setEditable(true)}
        >
          {editable ? 'Save' : 'Edit'}
        </button>
      </div>
    </div>
  );
}
