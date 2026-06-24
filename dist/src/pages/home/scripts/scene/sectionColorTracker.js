/**
 * sectionColorTracker.js
 *
 * Single responsibility: watch which .project-row is dominant in the viewport
 * and call window.waveScene.setAccentColor() with its --card-accent value.
 *
 * HOW IT WORKS:
 *   An IntersectionObserver fires whenever a .project-row enters or leaves
 *   the viewport (threshold: 20% visible). We maintain a Set of currently
 *   visible rows, then pick the one whose center is closest to the viewport
 *   center. That row's --card-accent CSS custom property becomes the wave tint.
 *
 *   When no rows are visible (top of page, or below all cards), we pass null
 *   to setAccentColor() which resets the tint to neutral white.
 *
 * WHY NOT JUST USE THE FIRST INTERSECTING ENTRY:
 *   IntersectionObserver fires for all threshold crossings in a batch. If two
 *   rows enter simultaneously (fast scroll), picking the first arbitrarily
 *   produces a flicker. Picking the closest-to-center is stable.
 */

export function initSectionColorTracker() {
  const rows = document.querySelectorAll(".project-row");
  if (!rows.length) return;

  const visibleRows = new Set();

  function updateAccent() {
    if (visibleRows.size === 0) {
      window.waveScene?.setAccentColor(null);
      return;
    }

    // Pick the visible row whose vertical center is closest to the viewport center.
    const viewCy = window.innerHeight / 2;
    let best = null;
    let bestDist = Infinity;

    for (const row of visibleRows) {
      const rect = row.getBoundingClientRect();
      const dist = Math.abs(rect.top + rect.height / 2 - viewCy);
      if (dist < bestDist) {
        bestDist = dist;
        best = row;
      }
    }

    if (best) {
      const accent = getComputedStyle(best)
        .getPropertyValue("--card-accent")
        .trim();
      window.waveScene?.setAccentColor(accent || null);
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visibleRows.add(entry.target);
        } else {
          visibleRows.delete(entry.target);
        }
      }
      updateAccent();
    },
    { threshold: 0.2 },
  );

  for (const row of rows) observer.observe(row);
}
