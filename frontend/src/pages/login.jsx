import { useState } from 'react';
import bgImage from '../assets/bg.jpeg';
import './Login.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const validEmail = 'admin@casefusion.ai';
      const validPassword = 'casefusion123';

      if (
        email.trim().toLowerCase() !== validEmail ||
        password !== validPassword
      ) {
        setError(
          'Invalid credentials. Please check your email and password.'
        );
        setLoading(false);
        return;
      }

      const session = {
        email: validEmail,
        name: 'Investigator',
        role: 'Intelligence Analyst',
      };

      if (rememberMe) {
        localStorage.setItem('casefusion_user', JSON.stringify(session));
      } else {
        sessionStorage.setItem('casefusion_user', JSON.stringify(session));
      }

      onLogin(session);
      setLoading(false);
    }, 650);
  }

  return (
    <div className="login-page">
      <div className="login-stage">

        {/* ================= LEFT BACKGROUND ================= */}
        <div className="login-left">
          <img
            src={bgImage}
            alt="CASE-FUSION Investigation"
            className="login-background-image"
          />
        </div>

        {/* ================= RIGHT LOGIN (sits in the empty panel of bg.jpeg) ================= */}
        <div className="login-right">

          <div className="login-content">

            {/* BOX 1 — Heading */}
            <div className="login-heading-card">
              <p className="section-label">SECURE ACCESS</p>
              <h2>Welcome back</h2>
              <p>Sign in to access your investigation workspace.</p>
            </div>

            {/* BOX 2 — Form */}
            <div className="login-form-card">

              {error && (
                <div className="login-error">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* EMAIL */}
                <label className="login-field">
                  <span>Email address</span>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon">@</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError('');
                      }}
                      placeholder="admin@casefusion.ai"
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                </label>

                {/* PASSWORD */}
                <label className="login-field">
                  <span>Password</span>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon">•</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError('');
                      }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((previous) => !previous)}
                      disabled={loading}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>

                {/* OPTIONS */}
                <div className="login-options">
                  <label className="remember-option">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      disabled={loading}
                    />
                    <span>Remember me</span>
                  </label>
                  <span className="login-security">Protected workspace</span>
                </div>

                {/* LOGIN BUTTON */}
                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="login-spinner" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <span>→</span>
                    </>
                  )}
                </button>

              </form>

              {/* DEMO */}
              <div className="login-demo">
                <div className="demo-title">
                  <span className="demo-dot" />
                  Demo environment
                </div>
                <p>Email: <strong>admin@casefusion.ai</strong></p>
                <p>Password: <strong>casefusion123</strong></p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;