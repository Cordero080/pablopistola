/**
 * cinematicScroll.js
 *
 * Entry reveal: IntersectionObserver adds .cinematic-visible when each row
 * enters the viewport. CSS handles the transition (no GSAP scrub fighting itself).
 *
 * Hover recede: pure CSS :has() — when the user hovers the NEXT card, the
 * PREVIOUS card fades and shrinks. Handled entirely in bento.css.
 */
export function initCinematicScroll() {
  const rows = document.querySelectorAll(".project-row");
  if (!rows.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    rows.forEach((row) => row.classList.add("cinematic-visible"));
    return;
  }

  // Entry reveal — fires once per row as it scrolls into view
  const entryObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("cinematic-visible");
          entryObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );

  rows.forEach((row) => {
    const rect = row.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      row.classList.add("cinematic-visible");
    } else {
      entryObserver.observe(row);
    }
  });

  // Mobile: scroll-based recede — `:hover` doesn't persist on touch,
  // so track which row is entering the upper half and mark it scroll-active.
  // CSS: .cinematic-visible:has(+ .scroll-active) recedes the previous card.
  if (window.matchMedia("(max-width: 768px)").matches) {
    const recedeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("scroll-active", entry.isIntersecting);
        });
      },
      { rootMargin: "0px 0px -50% 0px", threshold: 0 },
    );
    rows.forEach((row) => recedeObserver.observe(row));
  }
}
