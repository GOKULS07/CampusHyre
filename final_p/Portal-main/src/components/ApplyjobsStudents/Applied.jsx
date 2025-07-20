import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImBlocked } from "react-icons/im";
import './Style.css';

const Applied = () => {
  const navigate = useNavigate();
  const REDIRECT_DELAY = 5000;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/student');
    }, REDIRECT_DELAY);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="application-failed">
      <div className="message-box" aria-live="polite" aria-atomic="true">
        <ImBlocked className="icon-failed" />
        <h1>Submission Blocked</h1>
        <p>You have already submitted your application.</p>
        <p>Redirecting to Home Page...</p>
        <button onClick={() => navigate('/student')}>Go to Home Now</button>
      </div>
    </div>
  );
};

export default Applied;
