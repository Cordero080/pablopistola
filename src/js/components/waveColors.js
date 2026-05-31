// ── Background overlay parallax ─────────────────────────────────────────────
// Moves the geometric background overlay as the user scrolls.
// Speed controlled by the 0.25 multiplier — increase to move faster.
function updateMinimalParallaxOverlay() {
  if (window.homeParallaxActive) return;
  const overlay = document.querySelector(".parallax-bg-overlay");
  if (!overlay) return;
  overlay.style.transform = `translateY(${window.scrollY * 0.25}px)`;
}
window.addEventListener("scroll", updateMinimalParallaxOverlay);
document.addEventListener("DOMContentLoaded", updateMinimalParallaxOverlay);

// ── Scroll-based hue rotation on the sine wave canvas ───────────────────────
// As the user scrolls from top to bottom the wave hue shifts 0→180°.
// Edit the 180 multiplier to widen or narrow the hue sweep.
function updateBentoCards() {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const hue = Math.min(scrollY / maxScroll, 1) * 180;
  const canvas = document.getElementById("waves");
  if (canvas) canvas.style.filter = `hue-rotate(${hue}deg)`;
}
window.addEventListener("scroll", updateBentoCards);
document.addEventListener("DOMContentLoaded", updateBentoCards);

// ── R key — reverse wave direction ──────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  if (e.key === "r" && window.waveGen) {
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    waveGen.direction *= -1;
  }
});

// ── Comp mode toggle ─────────────────────────────────────────────────────────
// Triggered by the C key (compMode.js) or title hover (home/index.js).
// Adds/removes .complementary-colors on <body>, swaps wave colors,
// and starts/stops the feather particle effect.
document.addEventListener("DOMContentLoaded", function () {
  window.toggleComplementaryColors =
    window.toggleComplementaryColors ||
    function () {
      if (typeof window.isComplementaryMode === "undefined") {
        window.isComplementaryMode = false;
      }
      window.isComplementaryMode = !window.isComplementaryMode;
      if (window.isComplementaryMode) {
        document.body.classList.add("complementary-colors");
        if (window.initEasterEggColors) window.initEasterEggColors(); // → easterEggSineWave.js
        if (window.startFeatherEffect) window.startFeatherEffect(); // → feathers.js
      } else {
        document.body.classList.remove("complementary-colors");
        if (window.resetMainColors) window.resetMainColors(); // → easterEggSineWave.js
        if (window.stopFeatherEffect) window.stopFeatherEffect(); // → feathers.js
      }
    };
});
