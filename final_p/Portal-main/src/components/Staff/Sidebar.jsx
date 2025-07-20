import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaBriefcase, FaClipboardList, FaUserCircle } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/logo.png" alt="Logo" />
      </div>
      <div className="sections-side">
        <p>
          <NavLink to="/staff" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            <FaHome /> Home
          </NavLink>
        </p>
        <p>
          <NavLink to="/receivedjobs" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            <FaBriefcase /> All Jobs
          </NavLink>
        </p>
        <p>
          <NavLink to="/studentApplicationStaff" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            <FaClipboardList /> Applications
          </NavLink>
        </p>
        <p>
          <NavLink to="/useraccount" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            <FaUserCircle /> Account
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
