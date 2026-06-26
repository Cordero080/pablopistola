/**
 * cardDepth.js
 *
 * On mousemove over each project row, lerps --depth-x and --depth-y onto
 * the row element. bento.css uses different multipliers per layer:
 *   title       ×1.0  (nearest the viewer)
 *   description ×0.6
 *   actions     ×0.3  (furthest)
 *
 * Desktop only — no touch equivalent needed since the effect relies on
 * continuous cursor position.
 */
export function initCardDepth() {
  if (window.matchMedia("(max-width: 768px)").matches) return;

  document.querySelectorAll(".project-row").forEach((row) => {
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0;
    let rafId = null;
    const RANGE = 8; // px maximum drift at edge of card

    function step() {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;

      row.style.setProperty("--depth-x", `${cx.toFixed(2)}px`);
      row.style.setProperty("--depth-y", `${cy.toFixed(2)}px`);

      rafId =
        Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01
          ? requestAnimationFrame(step)
          : null;
    }

    row.addEventListener("mousemove", (e) => {
      const r = row.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * RANGE;
      ty = ((e.clientY - r.top) / r.height - 0.5) * RANGE;
      if (!rafId) rafId = requestAnimationFrame(step);
    });

    row.addEventListener("mouseleave", () => {
      tx = 0;
      ty = 0;
      if (!rafId) rafId = requestAnimationFrame(step);
    });
  });
}
