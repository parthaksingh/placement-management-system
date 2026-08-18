import React, { useState } from 'react';
import { api } from '../api.js';

export default function Login({ onLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isCurrentAdmin = identifier === 'admin@placesmart.edu' || identifier === 'ADMIN001';
  const isCurrentStudent = identifier === 'aarav.sharma@college.edu' || identifier === 'PS2022001';

  async function performLogin(loginIdentifier, loginPassword) {
    setLoading(true);
    setError('');
    try {
      const d = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: loginIdentifier || identifier,
          password: loginPassword || password
        })
      });
      localStorage.setItem('placesmart_token', d.token);
      onLogin(d.user);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  }

  async function submit(e) {
    e.preventDefault();
    await performLogin(identifier, password);
  }

  return (
    <main className="login">
      <section>
        <p className="eyebrow">PLACEMENT MANAGEMENT SYSTEM</p>
        <h1>Your next great opportunity starts here.</h1>
        <p>A unified portal connecting students with campus placement drives and placement cell administration.</p>

        <div className="demo-container">
          <div className="demo-header">
            <span>⚡ Quick Demo Switcher</span>
            <small style={{ color: '#94a3b8', fontSize: '11px' }}>Click to select & sign in</small>
          </div>

          <div className="demo-cards">
            {/* Admin Demo Card */}
            <div
              className={`demo-card ${isCurrentAdmin ? 'active' : ''}`}
              onClick={() => {
                setIdentifier('ADMIN001');
                setPassword('Password123!');
              }}
              role="button"
              tabIndex={0}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="demo-badge admin">🛡️</div>
                <div>
                  <h4 className="demo-card-title">Administrator</h4>
                  <p className="demo-card-role">Placement Cell Operations</p>
                </div>
              </div>
              <div className="demo-credentials">
                <span><b>ID</b> ADMIN001</span>
                <span><b>Password</b> Password123!</span>
              </div>
              <button
                type="button"
                className="demo-card-btn admin"
                onClick={(e) => {
                  e.stopPropagation();
                  setIdentifier('ADMIN001');
                  setPassword('Password123!');
                  performLogin('ADMIN001', 'Password123!');
                }}
                disabled={loading}
              >
                Sign in as Admin →
              </button>
            </div>

            {/* Student Demo Card */}
            <div
              className={`demo-card ${isCurrentStudent ? 'active' : ''}`}
              onClick={() => {
                setIdentifier('PS2022001');
                setPassword('Password123!');
              }}
              role="button"
              tabIndex={0}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="demo-badge student">🎓</div>
                <div>
                  <h4 className="demo-card-title">Student Portal</h4>
                  <p className="demo-card-role">Campus Placements & Drives</p>
                </div>
              </div>
              <div className="demo-credentials">
                <span><b>ID</b> PS2022001</span>
                <span><b>Password</b> Password123!</span>
              </div>
              <button
                type="button"
                className="demo-card-btn student"
                onClick={(e) => {
                  e.stopPropagation();
                  setIdentifier('PS2022001');
                  setPassword('Password123!');
                  performLogin('PS2022001', 'Password123!');
                }}
                disabled={loading}
              >
                Sign in as Student →
              </button>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={submit}>
        <div className="login-brand">place<span>SMART</span></div>
        <small>PLACEMENT PORTAL</small>
        <h1>Welcome back</h1>
        <p>Sign in with your Email or Registration Number.</p>

        {error && <p className="error-msg">{error}</p>}

        <label>
          Email or Registration / ID No.
          <input
            id="login-identifier"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            type="text"
            placeholder="e.g. name@college.edu or PS2022001"
            required
            autoCapitalize="none"
            autoCorrect="off"
          />
        </label>

        <label>
          Password
          <div className="password-input-wrap">
            <input
              id="login-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(prev => !prev)}
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </label>

        <button type="submit" id="login-submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>
    </main>
  );
}
