import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';         // shared styles

const API = 'http://localhost:5000'; //  ← single line to edit if your back‑end URL changes

const ForgotPassword = () => {
  const [email,    setEmail]    = useState('');
  const [otp,      setOtp]      = useState('');
  const [password, setPassword] = useState('');
  const [step,     setStep]     = useState(1);          // 1 = enter email, 2 = enter otp+pass
  const [message,  setMessage]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const navigate = useNavigate();

  /* -------------------------- helpers -------------------------- */
  const showMessage = (text, isError = false) => {
    setMessage(text);
    if (isError) {
      setTimeout(() => setMessage(''), 4000);
    }
  };

  /* -------------------------- handlers ------------------------- */
  const requestOtp = async e => {
    e.preventDefault();
    if (!email) return showMessage('Please enter your email', true);

    setLoading(true);
    try {
      const res = await fetch(`${API}/forget`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(await res.text());
      showMessage('OTP sent! Check your inbox.');
      setStep(2);
    } catch (err) {
      showMessage('Failed to send email. Try again.', true);
      console.error(err);
    } finally { setLoading(false); }
  };

  const resetPassword = async () => {
    if (!otp || !password)
      return showMessage('Enter both OTP and new password', true);

    setLoading(true);
    try {
      const res = await fetch(`${API}/reset_password`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid OTP');
      }
      showMessage('Password reset successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      showMessage(err.message || 'Reset failed', true);
    } finally { setLoading(false); }
  };

  /* -------------------------- UI ------------------------------- */
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Forgot Password?</h1>
        <p>{ step === 1 ? 'Enter your registered email' : 'Enter OTP & new password' }</p>

        {step === 1 ? (
          <form onSubmit={requestOtp}>
            <div className="input-group-1">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Sending…' : 'Confirm Email'}
            </button>
          </form>
        ) : (
          <>
            <div className="input-group-1">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
              />
            </div>
            <div className="input-group-1">
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              className="auth-button"
              onClick={resetPassword}
              disabled={loading}
            >
              {loading ? 'Updating…' : 'Done'}
            </button>
          </>
        )}

        {message && (
          <p
            className={`response-message ${
              message.toLowerCase().includes('fail') ||
              message.toLowerCase().includes('error') ||
              message.toLowerCase().includes('invalid')
                ? 'error-message'
                : ''
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
