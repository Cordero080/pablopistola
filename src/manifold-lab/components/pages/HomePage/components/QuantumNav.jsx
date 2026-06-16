import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ScrambleLink from '@ml/components/ui/ScrambleLink/ScrambleLink';
import { GEOM_LAB_LINK_TEXT, SHOWCASE_LINK_TEXT } from '@ml/components/layout/NavBar/navLabels';
import '@components/layout/NavBar/nav.scss';

export default function QuantumNav({
  portalState,
  navScrolled,
  isAuthenticated,
  logout,
  user,
  currentPage,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav
        className="quantum-nav"
        id="quantum-nav"
        style={{
          '--nav-background': navScrolled
            ? `linear-gradient(135deg, ${portalState.colors[0]}15, ${portalState.colors[1]}10, rgba(0,0,0,0.9))`
            : `linear-gradient(135deg, ${portalState.colors[0]}25, ${portalState.colors[1]}20, rgba(0,0,0,0.85))`,
          '--nav-backdrop-filter': navScrolled ? 'blur(20px)' : 'blur(30px)',
          '--nav-border-bottom': `2px solid ${portalState.colors[1]}44`,
          '--nav-box-shadow': `0 2px 24px ${portalState.colors[1]}22`,
        }}
      >
        <div className="nav-logo">
          <Link to="/" className="logo-text" data-text={user?.username || 'N3XUS_GEOM'}>
            {user?.username || 'N3XUS_GEOM'}
          </Link>
        </div>

        {/* Hamburger — mobile only */}
        <button
          className={`nav-hamburger ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {isAuthenticated && (
            <>
              {currentPage !== 'home' && (
                <Link
                  to="/"
                  className="nav-link nav-link--home"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  HOME
                </Link>
              )}
              {currentPage !== 'scenes' && (
                <Link to="/scenes" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  SCENES
                </Link>
              )}
              {currentPage !== 'showcase' && (
                <Link to="/showcase" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  {SHOWCASE_LINK_TEXT}
                </Link>
              )}
              {currentPage !== 'geom-lab' && (
                <ScrambleLink
                  to="/geom-lab"
                  className="nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {GEOM_LAB_LINK_TEXT}
                </ScrambleLink>
              )}
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
            </>
          )}
        </div>
      </nav>

      {/* Overlay to close menu when tapping outside */}
      {mobileMenuOpen && (
        <div className="nav-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}
    </>
  );
}
