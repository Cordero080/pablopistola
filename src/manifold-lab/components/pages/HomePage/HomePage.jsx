import React, { useEffect, useRef, useState } from 'react';

// Components
import ProgressBar from './components/ProgressBar';
import Scene from './components/Scene';
import QuantumNav from './components/QuantumNav';
import BackgroundLayers from './components/BackgroundLayers';
import HessianPolychoronAnimation from './components/HessianPolychoronAnimation';
import QuantumManifoldAnimation from './components/QuantumManifoldAnimation';
import ScrambleOnHover from './components/ScrambleOnHover';

// Styles
import styles from './HomeIndex.module.scss';

// Utilities
import quantumCollapse from '@ml/utils/quantumCollapse';
import { portalWorlds, glyphSets } from '@ml/data/portalWorlds';

// Custom Hooks
import useQuantumState from '@ml/hooks/useQuantumState';
import useParallax from '@ml/hooks/useParallax';

// External
import BeamScanButton from '@ml/components/ui/BeamScanButton/BeamScanButton';
import { Link, useNavigate } from 'react-router-dom';
import { GEOM_LAB_LINK_TEXT, SHOWCASE_LINK_TEXT } from '@ml/components/layout/NavBar/navLabels';
import { useAuth } from '@ml/features/auth/context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  // Custom Hooks
  const { portalState, handleQuantumCollapse } = useQuantumState();
  const { parallaxRef, fgRef, bgRef, layer1Ref, layer2Ref, layer3Ref, layer4Ref, layer5Ref } =
    useParallax();

  // Local state
  const [activeScene, setActiveScene] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);
  const [probabilityFlipped, setProbabilityFlipped] = useState(false);
  const [superpositionDisassembled, setSuperpositionDisassembled] = useState(false);
  const [monoMode, setMonoMode] = useState(false);

  // Mono mode: apply/remove class on <html> for grayscale override
  useEffect(() => {
    if (monoMode) {
      document.documentElement.classList.add('mono-mode');
    } else {
      document.documentElement.classList.remove('mono-mode');
    }
    return () => document.documentElement.classList.remove('mono-mode');
  }, [monoMode]);

  // Scene fade/scroll logic
  useEffect(() => {
    const handleScroll = () => {
      if (!parallaxRef.current) return;
      const container = parallaxRef.current;
      const scenes = Array.from(container.querySelectorAll('.quantum-scene'));
      const scrollY = window.scrollY;
      let found = 0;
      for (let i = 0; i < scenes.length; i++) {
        const rect = scenes[i].getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.33 && rect.bottom > window.innerHeight * 0.33) {
          found = i;
          break;
        }
      }
      setActiveScene(found);

      // Check if we've scrolled past the probability description text itself
      const probabilityDescription = document.querySelector('#probability .scene-description');
      if (probabilityDescription) {
        const descRect = probabilityDescription.getBoundingClientRect();
        // Flip when the description itself passes the middle of viewport
        setProbabilityFlipped(descRect.top < window.innerHeight / 3);
      }

      // Check if we've entered the superposition section
      const superpositionSection = document.querySelector('#superposition');
      if (superpositionSection) {
        const superRect = superpositionSection.getBoundingClientRect();
        // Disassemble when superposition section enters viewport
        setSuperpositionDisassembled(superRect.top < window.innerHeight * 0.1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const handleNavScroll = () => {
      if (window.scrollY > 50) {
        setNavScrolled(true);
      } else {
        setNavScrolled(false);
      }
    };
    window.addEventListener('scroll', handleNavScroll);
    handleNavScroll();
    return () => window.removeEventListener('scroll', handleNavScroll);
  }, []);

  return (
    <>
      {/* VINE-INSPIRED QUANTUM NAVIGATION - Only show when authenticated */}
      {isAuthenticated && (
        <QuantumNav
          portalState={portalState}
          navScrolled={navScrolled}
          isAuthenticated={isAuthenticated}
          logout={logout}
          user={user}
          currentPage="home"
        />
      )}

      {/* Mono mode toggle */}
      <button
        className={`${styles.monoToggle}${monoMode ? ` ${styles.monoToggleActive}` : ''}`}
        onClick={() => setMonoMode((m) => !m)}
        title={monoMode ? 'Switch to color mode' : 'Switch to monochrome mode'}
        aria-label={monoMode ? 'Color mode' : 'Monochrome mode'}
      >
        ◑
      </button>

      {/* Background Layers */}
      <BackgroundLayers portalState={portalState} bgRef={bgRef} fgRef={fgRef} />

      {/* Parallax Container */}
      <div
        className={`${styles.parallaxContainer}${!isAuthenticated ? ' no-nav' : ''}`}
        id="parallax-container"
        ref={parallaxRef}
      >
        {/* Scene 1: Reality Layer */}
        {/* Scene 1: Reality Layer */}
        <section
          className={`quantum-scene reality-scene-section${activeScene === 0 ? ' active' : ''}`}
          id="reality"
          data-scene="0"
        >
          <div className={`${styles.bgReality} bg-reality-position`} aria-hidden="true"></div>
          <div className="scene-content scene-content-wrapper">
            <div className="particles particles-wrapper">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
            <div className="terminal-header">
              <span className="manifold-label">φ-SPACE_MANIFOLD: 1.618033988749</span>
              {/* φ (Phi): The golden ratio constant (1.618...)
SPACE: Mathematical/geometric term for a set of points with structure
MANIFOLD: A mathematical surface or multi-dimensional space that can be curved or complex (like tesseracts constructed in Geom Lab - they're 4D manifolds projected into 3D) In plain English: "A dimension where everything follows the golden ratio's harmonic proportions" */}
              <span className="timestamp" id="timestamp"></span>
            </div>
            <div className="title-wrapper">
              <h1
                className={`quantum-title ${styles.quantumTitle} ${styles.scrambleTitle} quantum-title-h1`}
              >
                <span className="title-word title-word-span" data-word="MANIFOLD">
                  <ScrambleOnHover originalText="MANIFOLD" finalText="アトリエ" delay={1500} />
                </span>
              </h1>
            </div>
            {/* Show Enter Geom Lab only when logged in, Login/Signup when logged out */}
            {isAuthenticated ? (
              <div className="button-wrapper-auth">
                <BeamScanButton
                  onClick={(e) => {
                    navigate('/geom-lab');
                  }}
                  label={
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 28 28"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ display: 'block' }}
                    >
                      <polygon points="6,2 26,14 6,26" fill="currentColor" />
                    </svg>
                  }
                  className="enter-geom-lab-hero-btn"
                />
              </div>
            ) : (
              <div className="button-wrapper-no-auth">
                <BeamScanButton
                  onClick={(e) => {
                    navigate('/login');
                  }}
                  label={
                    <>
                      LOGI<span className="inverted-n-span">N</span>
                    </>
                  }
                />
                <BeamScanButton
                  onClick={(e) => {
                    navigate('/signup');
                  }}
                  label="SIGN UP"
                  delayedString={true}
                />
              </div>
            )}

            <div className="reality-particles"></div>
          </div>
        </section>

        {/* Scene 2: Object Matrix */}
        <section
          className={`quantum-scene${activeScene === 1 ? ' active' : ''}`}
          id="probability"
          data-scene="1"
        >
          <div className="scene-background bg-probability" aria-hidden="true"></div>
          <div className="scene-content">
            <div className="probability-waves"></div>
            <p className="scene-description">
              Sculpt four-dimensional geometry in real time.
              <br />
              Save your scenes. Unlock characters and animations.
            </p>
          </div>
        </section>

        {/* Scene 3: 4D Polytope Archive */}
        <section
          className={`quantum-scene${activeScene === 2 ? ' active' : ''}`}
          id="entanglement"
          data-scene="2"
        >
          <div className="scene-background bg-entanglement" aria-hidden="true"></div>
          <HessianPolychoronAnimation isActive={activeScene === 2} />
          <div className="scene-content entanglement-scene-content">
            <div className="entanglement-network"></div>
          </div>
        </section>

        <Scene
          id="superposition"
          isActive={activeScene === 3}
          backgroundClass="bg-superposition"
          animation={<QuantumManifoldAnimation isActive={activeScene === 3} />}
        >
          <div className="superposition-scene-div">
            <div className="superposition-field"></div>
          </div>
        </Scene>
      </div>

      <ProgressBar portalState={portalState} onQuantumCollapse={handleQuantumCollapse} />
    </>
  );
}
