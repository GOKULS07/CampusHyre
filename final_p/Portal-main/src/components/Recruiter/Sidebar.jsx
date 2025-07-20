import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaClipboardList, FaBullhorn, FaInfoCircle } from 'react-icons/fa';

export default function Sidebar () {
  const active = ({ isActive }) => (isActive ? 'active-link' : '');

  return (
    <aside className="sidebar">
      <div className="logo">
        <img src="logo.png" alt="ATS Portal logo" />
      </div>

      <nav className="sections-side">
        <NavLink to="/recruiter"            end   className={active}><FaHome />           Home</NavLink>
        <NavLink to="/jobpost"                    className={active}><FaBullhorn />       Post Jobs</NavLink>
        <NavLink to="/recruiterApplication"       className={active}><FaClipboardList />  Applications</NavLink>

        {/* external link */}
        <a href="https://www.bitsathy.ac.in" target="_blank" rel="noopener noreferrer">
          <FaInfoCircle /> About
        </a>
      </nav>
    </aside>
  );
}
