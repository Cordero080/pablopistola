/**
 * scrollProgress.js
 *
 * Single responsibility: track how far the user has scrolled as a
 * normalized value from 0 (top) to 1 (bottom).
 *
 * Two ways to consume this:
 *   - getProgress()        → pull the current value any time (e.g. inside a rAF loop)
 *   - onProgress(callback) → push — get called whenever progress changes
 *
 * The module starts its own rAF loop the moment it is imported. Nothing
 * outside needs to start or stop it.
 */

let _progress = 0;
const _listeners = [];

function tick() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const next =
    docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;

  // Only notify listeners when the value meaningfully changes.
  // 0.0005 filters sub-pixel jitter without losing any visible motion.
  if (Math.abs(_progress - next) > 0.0005) {
    _progress = next;
    for (const fn of _listeners) fn(_progress);
  }

  requestAnimationFrame(tick);
}

// Start immediately on import. No init() call needed by consumers.
requestAnimationFrame(tick);

/**
 * Returns the current scroll progress (0..1).
 * Use this inside your own rAF loop so you always have the latest value.
 */
export function getProgress() {
  return _progress;
}

/**
 * Registers a callback that fires whenever scroll progress changes.
 * Returns an unsubscribe function — call it to stop listening.
 *
 * Example:
 *   const unsub = onProgress(p => console.log(p));
 *   unsub(); // stop
 */
export function onProgress(callback) {
  _listeners.push(callback);
  return function unsubscribe() {
    const i = _listeners.indexOf(callback);
    if (i > -1) _listeners.splice(i, 1);
  };
}
