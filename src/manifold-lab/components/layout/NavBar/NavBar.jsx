import React, { useState, useEffect } from 'react';
import './nav.scss';
import sharedStyles from '@ml/styles/shared.module.scss';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@ml/features/auth/context/AuthContext';
import ScrambleLink from '@ml/components/ui/ScrambleLink/ScrambleLink';
import { GEOM_LAB_LINK_TEXT, SHOWCASE_LINK_TEXT } from './navLabels';

export default function NavBar({ portalColors = null, navScrolled = false }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isShowcaseViewer, setIsShowcaseViewer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if showcase viewer is active
  useEffect(() => {
    const checkViewerActive = () => {
      setIsShowcaseViewer(document.body.classList.contains('showcase-viewer-active'));
    };

    checkViewerActive();

    const observer = new MutationObserver(checkViewerActive);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Check if we're on geom lab routes or showcase viewer
  const isGeomLab = location.pathname === '/geom-lab' || location.pathname === '/geometry-lab';
  const shouldUseClearNav = isGeomLab || isShowcaseViewer;

  // Apply quantum reactive colors if provided
  const quantumStyle = portalColors
    ? {
        background: navScrolled
          ? `linear-gradient(135deg, ${portalColors[0]}15, ${portalColors[1]}10, rgba(0,0,0,0.9))`
          : `linear-gradient(135deg, ${portalColors[0]}25, ${portalColors[1]}20, rgba(0,0,0,0.85))`,
        backdropFilter: navScrolled ? 'blur(20px)' : 'blur(30px)',
        borderBottom: `2px solid ${portalColors[1]}44`,
        boxShadow: `0 2px 24px ${portalColors[1]}22`,
        transition: 'background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
      }
    : {};

  return (
    <>
      <nav
        className={`quantum-nav${shouldUseClearNav ? ' showcase-viewer-navbar' : ''}`}
        style={quantumStyle}
      >
        {/* Logo/Username */}
        <div className="nav-logo">
          <Link to="/" className="logo-text" data-text={user?.username || 'N3XUS_GEOM'}>
            {user?.username || 'N3XUS_GEOM'}
          </Link>
        </div>

        {/* Hamburger button - mobile only */}
        <button
          className={`nav-hamburger ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {location.pathname !== '/' && (
            <Link to="/" className="nav-link nav-link--home">
              HOME
            </Link>
          )}
          {location.pathname !== '/scenes' && (
            <Link to="/scenes" className="nav-link">
              SCENES
            </Link>
          )}
          {location.pathname !== '/showcase' && (
            <Link to="/showcase" className="nav-link">
              {SHOWCASE_LINK_TEXT}
            </Link>
          )}
          {location.pathname !== '/geometry-lab' && location.pathname !== '/geom-lab' && (
            <ScrambleLink to="/geometry-lab" className="nav-link">
              {GEOM_LAB_LINK_TEXT}
            </ScrambleLink>
          )}
          {isAuthenticated ? (
            <div className="nav-terminal">
              <button onClick={logout} className="terminal-cursor" title="Logout">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              {location.pathname !== '/signup' && (
                <Link to="/signup" className="nav-link">
                  SIGN UP
                </Link>
              )}
              {location.pathname !== '/login' && (
                <Link to="/login" className="nav-link">
                  LOGIN
                </Link>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Overlay rendered outside <nav> so it lives in root stacking context,
          below the nav (z-index 9999 < nav's 10000) — dropdown stays clickable */}
      {mobileMenuOpen && (
        <div className="nav-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}
    </>
  );
}
