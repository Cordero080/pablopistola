/**
 * velocityTilt.js
 *
 * Tracks scroll velocity each rAF tick and writes --scroll-tilt to every
 * .cinematic-visible project row. bento.css applies it as a perspective
 * rotateX on the row, so the cards physically lean into fast scrolls.
 *
 * No transition is set on `transform` in the visible state so the tilt
 * responds in real-time without fighting the 0.75s entry animation.
 * Entry/recede use `translate` and `scale` (individual CSS properties)
 * which compose with — and don't interfere with — the `transform` tilt.
 */
export function initVelocityTilt() {
  let lastY = window.scrollY;
  let vel = 0;
  let tilt = 0;
  const MAX_TILT = 4; // degrees
  const VEL_SCALE = 0.18;

  function tick() {
    const y = window.scrollY;
    // Lerp velocity toward the raw per-frame delta
    vel += (y - lastY - vel) * 0.28;
    lastY = y;

    // Clamp and decay
    const target = Math.max(-MAX_TILT, Math.min(MAX_TILT, vel * VEL_SCALE));
    tilt += (target - tilt) * 0.16;

    const rows = document.querySelectorAll(".project-row.cinematic-visible");
    if (Math.abs(tilt) > 0.02) {
      const val = `${tilt.toFixed(3)}deg`;
      rows.forEach((r) => r.style.setProperty("--scroll-tilt", val));
    } else {
      tilt = 0;
      rows.forEach((r) => r.style.removeProperty("--scroll-tilt"));
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
