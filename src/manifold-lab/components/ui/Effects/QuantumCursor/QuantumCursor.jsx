import React, { useEffect, useRef } from 'react';
import QuantumCursorUniverse from './QuantumCursorUniverse';
import styles from './QuantumCursor.module.scss';

/**
 * QuantumCursor component creates an interactive, particle-based cursor
 * that follows the mouse movement with quantum-inspired effects
 */
export default function QuantumCursor() {
  const universeRef = useRef(null);

  useEffect(() => {
    // Ensure proper body classes for homepage cursor styling
    document.body.classList.remove('geom-lab-page');

    // Force cursor to be hidden with !important
    document.documentElement.style.setProperty('cursor', 'none', 'important');
    document.body.style.setProperty('cursor', 'none', 'important');

    // Initialize the quantum cursor system after mount
    const universe = new QuantumCursorUniverse();
    universeRef.current = universe;

    return () => {
      universeRef.current?.destroy();
      document.documentElement.style.removeProperty('cursor');
      document.body.style.removeProperty('cursor');
    };
  }, []);

  return (
    <div className="quantum-cursor-container">
      <div id="cursor" className={styles.cursor}></div>
      <div id="gravity-field" className={styles.gravityField}></div>
      <div id="wormhole" className={styles.quantumParticle}></div>
      <div id="dimensional-rift" className={styles.dimensionalRift}></div>
    </div>
  );
}
