import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCheckmarkCircle } from 'react-icons/io5'; // Tick icon
import './Style.css';

const Resumeuploaded = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/student');
    }, 2000); // Redirect after 2 seconds

    return () => clearTimeout(timer); // Cleanup
  }, [navigate]);

  return (
    <div className="application-success">
      <div className="success-message">
        <IoCheckmarkCircle className="tick-icon" />
        <h1>Submitted Successfully!</h1>
        <p>Your application has been submitted.</p>
        <p>Redirecting to Home Page...</p>
      </div>
    </div>
  );
};

export default Resumeuploaded;
