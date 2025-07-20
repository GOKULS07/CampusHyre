import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaSuitcase, FaFileAlt, FaQuestionCircle, FaUserCircle } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/logo.png" alt="Logo" />
      </div>
      <div className="sections-side">
        <p>
          <NavLink to="/student" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            <FaTachometerAlt /> Dashboard
          </NavLink>
        </p>
        <p>
          <NavLink to="/applyjobs" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            <FaSuitcase /> Apply Jobs
          </NavLink>
        </p>
        <p>
          <NavLink to="/resume" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            <FaFileAlt /> Resume
          </NavLink>
        </p>
        <p>
          <NavLink to="/faq" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            <FaQuestionCircle /> FAQ
          </NavLink>
        </p>
        <p>
          <NavLink to="/studentaccount" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            <FaUserCircle /> Account
          </NavLink>
        </p>
        
      </div>
    </div>
  );
};

export default Sidebar;
