import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@ml/features/auth/context/AuthContext';
import BeamScanButton from '@ml/components/ui/BeamScanButton/BeamScanButton';
import { useAuthPageEffects } from '@ml/features/auth/hooks/useAuthPageEffects';
import './LoginPage.css';
import '@components/layout/NavBar/nav.scss';
import homeStyles from '@ml/components/pages/HomePage/HomeIndex.module.scss';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { portalState, navScrolled, bgRef, fgRef } = useAuthPageEffects();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '', submit: '' });
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors.submit) setErrors((prev) => ({ ...prev, submit: '' }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError, submit: '' });
      return;
    }
    setIsLoading(true);
    setErrors({ email: '', password: '', submit: '' });
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      setErrors({ submit: error.message || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={homeStyles.baseDark}></div>
      <div
        className={homeStyles.quantumPortalLayer}
        style={{
          background: `
            radial-gradient(circle at 30% 120%,
              ${portalState.colors[0]} 0%,
              ${portalState.colors[1]} 30%,
              ${portalState.colors[2]} 60%,
              transparent 80%
            ),
            radial-gradient(circle at 70% 130%,
              ${portalState.colors[1]} 0%,
              ${portalState.colors[2]} 40%,
              ${portalState.colors[0]} 70%,
              transparent 90%
            )
          `,
        }}
      />
      <div className={homeStyles.quantumVeil}></div>
      <div className={homeStyles.darkTopVeil}></div>
      <div
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: -3, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1920 1080"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            pointerEvents: 'none',
            background: `linear-gradient(120deg, ${portalState.colors[0]} 0%, ${portalState.colors[1]} 60%, ${portalState.colors[2]} 100%)`,
            transition: 'background 1.2s cubic-bezier(0.4,0,0.2,1)',
            filter: 'brightness(1.3) saturate(1.8)',
          }}
        >
          <defs>
            <linearGradient id="login-portal-glow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={portalState.colors[0]} stopOpacity="0.6" />
              <stop offset="50%" stopColor={portalState.colors[1]} stopOpacity="0.4" />
              <stop offset="100%" stopColor={portalState.colors[2]} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="1920" height="1080" fill="url(#login-portal-glow)" />
        </svg>
      </div>
      <div className="bg-gallery-layer bg-gallery-reality" aria-hidden="true"></div>
      <div ref={bgRef} className="parallax-bg-layer" aria-hidden="true">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1920 400"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '40vh',
            pointerEvents: 'none',
            background: `linear-gradient(120deg, ${portalState.colors[0]} 0%, ${portalState.colors[1]} 60%, ${portalState.colors[2]} 100%)`,
            transition: 'background 3s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <defs>
            <linearGradient id="login-bg-grad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={portalState.colors[0]} stopOpacity="0.18" />
              <stop offset="100%" stopColor={portalState.colors[1]} stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <polygon points="0,0 1920,0 1600,400 0,300" fill="url(#login-bg-grad1)" />
          <ellipse cx="1600" cy="80" rx="220" ry="60" fill={portalState.colors[2] + '22'} />
        </svg>
      </div>
      <div ref={fgRef} className="parallax-fg-layer" aria-hidden="true">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1920 400"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '40vh', pointerEvents: 'none' }}
        >
          <defs>
            <linearGradient id="login-fg-grad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.22" />
            </linearGradient>
          </defs>
          <polygon points="1920,0 1920,400 400,400 0,200" fill="url(#login-fg-grad1)" />
          <ellipse cx="320" cy="120" rx="180" ry="40" fill="#ffffff22" />
        </svg>
      </div>
      <div className="cursor" id="cursor"></div>
      <div className="login-page">
        <nav className={`quantum-nav ${navScrolled ? 'scrolled' : ''}`}>
          <div className="nav-logo">
            <Link to="/" className="logo-text" data-text="N3XUS_GEOM">N3XUS_GEOM</Link>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link nav-link--home" data-dimension="0">// HOME</Link>
            <Link to="/signup" className="nav-link" data-dimension="1">// SIGN UP</Link>
          </div>
        </nav>
        <div className="login-container">
          <div className="login-header">
            <h1 className="login-title">
              <span className="title-glow title-word-left" data-word="VCCESS">
                <span className="title-inverted-v">V</span>CCESS
              </span>
              <span className="title-separator">//</span>
              <span className="title-glow title-word-right" data-word="PORTVL">
                PORT<span className="title-inverted-v">V</span>L
              </span>
            </h1>
            <p className="login-subtitle"> ENTER THE LAB</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">EMAIL</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''} ${formData.email ? 'has-value' : ''}`}
                placeholder="Enter email..."
                autoComplete="email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">PASSWORD</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'error' : ''} ${formData.password ? 'has-value' : ''}`}
                  placeholder="Enter password..."
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            {errors.submit && <div className="submit-error">{errors.submit}</div>}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <BeamScanButton
                onClick={handleSubmit}
                label={isLoading ? 'ACCESSING...' : 'LOGIN'}
                disabled={isLoading}
              />
            </div>
            <div className="form-footer">
              <p className="footer-text" style={{ fontSize: '18px' }}>
                Don't have an account?{' '}
                <Link to="/signup" className="footer-link" style={{ fontSize: '18px' }}>Sign Up</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
