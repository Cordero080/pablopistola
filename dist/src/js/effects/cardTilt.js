/**
 * cardTilt.js
 *
 * Single responsibility: 3D mouse-tilt on .project-card-link elements.
 *
 * WHY SEPARATE FROM projectParallax.js:
 *   Parallax is driven by scroll position (a global rAF loop).
 *   Tilt is driven by mouse position relative to each individual card.
 *   Different inputs, different event models — they belong apart.
 *
 * HOW IT WORKS:
 *   On mousemove: normalize cursor position to -0.5..0.5 within the card rect,
 *   then apply perspective + rotateY (left/right) + rotateX (up/down) as an
 *   inline style. Inline style beats the class-based entry transform once the
 *   card is visible, so they don't conflict.
 *
 *   On mouseleave: clear the inline style (class-based transform: translateX(0)
 *   from .project-row.visible takes effect again) with a slow ease-out.
 *
 *   The tilt only activates after the row gains .visible so it doesn't fight
 *   the entrance animation.
 */

export function initCardTilt() {
  const links = document.querySelectorAll(".project-card-link");

  for (const link of links) {
    link.addEventListener("mousemove", (e) => {
      const row = link.closest(".project-row");
      if (!row?.classList.contains("visible")) return;

      const r = link.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5; // -0.5 .. 0.5
      const y = (e.clientY - r.top) / r.height - 0.5;

      link.style.transition = "transform 0.08s ease, box-shadow 0.35s ease";
      link.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 5}deg)`;
    });

    link.addEventListener("mouseleave", () => {
      link.style.transition =
        "transform 0.7s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.35s ease";
      link.style.transform = "";
    });
  }
}
