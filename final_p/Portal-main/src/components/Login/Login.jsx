import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const API = 'http://localhost:5000';          

const Login = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const navigate = useNavigate();

  /* ------------------------------------------------------------ */
  const resetError = () => setError('');

  const onFieldChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) resetError();
  };

  /* ------------------------------------------------------------ */
  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail || !password) {
      setError('Please enter both e‑mail and password.');
      return;
    }

    setLoading(true);        // show spinner / disable button
    setError('');

    try {
      /* ---------- 1) login -------------------------------------------------- */
      const loginResp = await fetch(`${API}/login`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ email: cleanedEmail, password })
      });

      const loginJson = await loginResp.json();
      if (!loginResp.ok) throw new Error(loginJson.error || 'Invalid credentials');

      /* ---------- 2) get user‑type ----------------------------------------- */
      const typeResp = await fetch(
        `${API}/get-user-type?email=${encodeURIComponent(cleanedEmail)}`
      );
      const typeJson = await typeResp.json();
      if (!typeResp.ok || !typeJson.type) {
        throw new Error('Unable to determine user type.');
      }

      /* ---------- 3) persist + route -------------------------------------- */
      sessionStorage.setItem('email', cleanedEmail);

      switch (typeJson.type) {
        case 'Staff':     navigate('/staff');     break;
        case 'Recruiter': navigate('/recruiter'); break;
        case 'Student':   navigate('/student');   break;
        default:          throw new Error('Unknown user role.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------ */
  return (
    <div className="page-container">
      <div className="login-container">
        <div className="login-box">
          <h1>Login to your account</h1>
          <p>Enter your credentials</p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={onFieldChange(setEmail)}
                autoComplete="username"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={onFieldChange(setPassword)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="options">
              <Link to="/forgotpassword">Forgot password?</Link>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />   /* simple CSS spinner already in Login.css */
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
