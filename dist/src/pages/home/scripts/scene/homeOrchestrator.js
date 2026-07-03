/**
 * homeOrchestrator.js
 *
 * The single entry point for home.html's interactive layer.
 * Its only job: import each effect module and wire them together.
 *
 * WHAT AN ORCHESTRATOR IS:
 *   Each effect file (waveScene, sectionColorTracker, etc.) knows how to do
 *   ONE thing well, but knows nothing about the page structure. This file
 *   knows the page structure (DOM IDs, CSS selectors) and nothing about how
 *   effects work internally. That separation means you can swap any effect
 *   without touching the others.
 *
 * HOW THIS FILE GROWS:
 *   Step 2 (now): just the wave scene
 *   Step 5: + sectionColorTracker → scene.setAccentColor()
 *   Step 6: + projectParallax
 *   Each addition is one import + one or two lines below.
 */

import WaveScene from "./homeSineWave.js";
import { initProjectParallax } from "./projectParallax.js";
import { initSectionColorTracker } from "./sectionColorTracker.js";
import { initCinematicScroll } from "./cinematicScroll.js";
import { initVelocityTilt } from "./velocityTilt.js";
import { initCardDepth } from "./cardDepth.js";

// type="module" scripts are deferred by default (they run after HTML is parsed),
// so document.getElementById will always find the canvas. The DOMContentLoaded
// guard is here as explicit documentation of that intent.
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("waves");
  if (!canvas) return;

  // Create the scene. The constructor starts its own rAF loop — nothing else
  // needs to call .start() or .update(). Assign to window only for debugging
  // convenience (lets you inspect window.waveScene in DevTools).
  window.waveScene = new WaveScene(canvas);

  initProjectParallax();
  initSectionColorTracker();
  initCinematicScroll();
  initVelocityTilt();
  initCardDepth();
});
