/**
 * projectParallax.js
 *
 * Single responsibility: image parallax inside each .project-card-media.
 *
 * HOW IT WORKS:
 *   The card image is scaled to 1.14 (slightly larger than its container).
 *   That 14% overflow is the "travel budget" — the image can drift up to
 *   ~7% of its height in either direction before the edge is exposed.
 *
 *   Each frame we compute how far the card's center is from the viewport
 *   center, multiply by 0.08, and store it as the CSS custom property --py
 *   on the .project-card-media element. bento.css reads --py and composes
 *   it into the img's transform alongside the scale and hover translate.
 *
 *   Keeping the value in a CSS custom property means bento.css's hover
 *   states (which also set transform) can include --py without conflicting.
 */

export function initProjectParallax() {
  const rows = document.querySelectorAll(".project-row");
  if (!rows.length) return;

  // Collect {row, media} pairs once on init.
  const cards = Array.from(rows)
    .map((row) => ({
      row,
      media: row.querySelector(".project-card-media"),
    }))
    .filter((c) => c.media);

  function tick() {
    const viewCy = window.innerHeight / 2;

    for (const { media } of cards) {
      const rect = media.getBoundingClientRect();
      // Skip cards entirely outside the viewport + a generous buffer.
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;

      const cardCy = rect.top + rect.height / 2;
      // Positive offset when card is below center → image drifts down (reveals top)
      // Negative offset when card is above center → image drifts up (reveals bottom)
      const offset = (cardCy - viewCy) * 0.08;
      media.style.setProperty("--py", `${offset.toFixed(2)}px`);
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
