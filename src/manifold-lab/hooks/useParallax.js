import { useRef, useEffect } from 'react';

/**
 //Creates multi-layered 3D parallax scrolling effects on the HomePage by transforming background layers, scenes, and text elements based on scroll position and mouse movement.
 
 * Custom hook for parallax scrolling effects.
 * Drives bg/fg layers, quantum scenes, title, and floating-code text.
 * @returns {{ parallaxRef, fgRef, bgRef }}
 */
export default function useParallax() {
  // Create refs for parallax elements
  const parallaxRef = useRef(null);
  const fgRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    let mx = 0;
    let my = 0;

    const handleParallax = () => {
      const scrollY = window.scrollY;
      const wh = window.innerHeight;
      const progress = Math.min(scrollY / wh, 1);
      const motionDampen = Math.max(0, 1 - progress * 2);

      // Layer 1 (Slowest): Background - 0.2x scroll speed
      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${
          mx * 30 * motionDampen
        }px, ${-scrollY * 0.2 + my * 20 * motionDampen}px, 0)`;
        bgRef.current.style.opacity = String(1 - progress * 0.4);
      }

      // Foreground layer: 0.18x scroll speed, ±80px horizontal, ±40px vertical
      if (fgRef.current) {
        fgRef.current.style.transform = `translate3d(${
          mx * 80 * motionDampen
        }px, ${-scrollY * 0.18 + my * 40 * motionDampen}px, 0)`;
        fgRef.current.style.opacity = String(0.9 - progress * 0.6);
      }

      // Layer 3 (Fast): Apply depth to quantum scenes
      const scenes = document.querySelectorAll('.quantum-scene');
      scenes.forEach((scene, index) => {
        if (!scene) return;

        const rect = scene.getBoundingClientRect();
        const sceneCenter = rect.top + rect.height / 2;
        const viewportCenter = wh / 2;
        const distFromCenter = sceneCenter - viewportCenter;
        const normalizedDist = Math.min(1, Math.abs(distFromCenter) / (wh / 2));

        // Scene depth layering (different scenes at different depths)
        const sceneDepth = index * 100 + progress * 200;
        const sceneScale = 1 - normalizedDist * 0.08;
        const sceneTilt = -(distFromCenter / viewportCenter) * 1.5; // Reduced from 5 to 1.5 and inverted

        // Apply 3D transforms to scenes - Skip for entanglement (scene 2) and superposition (scene 3)
        if (index !== 2 && index !== 3) {
          scene.style.transform = `
            perspective(1500px) 
            translateZ(${sceneDepth}px) 
            scale(${sceneScale})
            rotateX(${sceneTilt}deg)
          `;
          scene.style.opacity = String(1 - normalizedDist * 0.3);
        } else {
          // Keep entanglement and superposition scenes flat to show parallax layers
          scene.style.transform = 'none';
          scene.style.opacity = '1';
        }
      });

      // Layer 4 (Fastest): N3XUS Title Enhancement
      const titleElement = document.querySelector('.n3xus-title, .scramble-title');
      if (titleElement) {
        const titleDepth = 300 - scrollY * 0.5;
        const titleGlow = Math.max(0, 1 - progress * 2);
        const titleScale = 1 + progress * 0.2;

        titleElement.style.transform = `
          perspective(1000px)
          translateZ(${titleDepth}px)
          scale(${titleScale})
          rotateY(${mx * 8}deg)
        `;

        // Add holographic glow that responds to scroll
        titleElement.style.textShadow = `
          0 0 ${20 + progress * 40}px rgba(0, 255, 247, ${titleGlow}),
          0 0 ${40 + progress * 80}px rgba(255, 0, 204, ${titleGlow * 0.7}),
          0 0 4px #fff
        `;
      }

      // Layer 5: Ensure "Be the defiance" is always visible
      const defianceText = document.querySelector('.floating-code');
      if (defianceText) {
        // Ensure it stays on top and visible
        defianceText.style.zIndex = '100';
        defianceText.style.position = 'relative';

        // Add slight parallax but keep it visible
        const defianceGlow = Math.max(0.5, 1 - progress * 0.5);
        defianceText.style.textShadow = `
          0 0 ${30}px rgba(0, 255, 247, ${defianceGlow}),
          0 0 ${50}px rgba(255, 0, 204, ${defianceGlow * 0.8}),
          0 0 8px #fff
        `;
      }
    };

    const handleMouseMove = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('scroll', handleParallax);
    window.addEventListener('mousemove', handleMouseMove);
    handleParallax();

    return () => {
      window.removeEventListener('scroll', handleParallax);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return { parallaxRef, fgRef, bgRef };
}
