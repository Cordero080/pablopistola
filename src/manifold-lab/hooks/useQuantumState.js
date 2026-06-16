import { useState, useEffect } from 'react';
import quantumCollapse from '../utils/quantumCollapse';
import { portalWorlds, glyphSets } from '../data/portalWorlds';

/**
 * Custom hook for managing quantum state (portal colors and glyphs)
 * Collapses state on scroll or click events
 */
export default function useQuantumState() {
  const [portalState, setPortalState] = useState(() => quantumCollapse(portalWorlds));
  const [glyphState, setGlyphState] = useState(() => quantumCollapse(glyphSets));

  // Collapse state on scroll, click, or interval
  useEffect(() => {
    const handle = () => {
      setPortalState(quantumCollapse(portalWorlds));
      setGlyphState(quantumCollapse(glyphSets));
    };
    window.addEventListener('scroll', handle);
    window.addEventListener('click', handle);

    // Auto-collapse every 3 seconds for continuous visual effect
    const interval = setInterval(handle, 3000);

    return () => {
      window.removeEventListener('scroll', handle);
      window.removeEventListener('click', handle);
      clearInterval(interval);
    };
  }, []);

  // Manual collapse handler
  function handleQuantumCollapse() {
    setPortalState(quantumCollapse(portalWorlds));
    setGlyphState(quantumCollapse(glyphSets));
  }

  return { portalState, glyphState, handleQuantumCollapse };
}
