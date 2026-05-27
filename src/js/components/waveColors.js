// Minimal parallax for geometric overlay
// (home page sets window.homeParallaxActive to take over this transform)
function updateMinimalParallaxOverlay() {
  if (window.homeParallaxActive) return;
  const overlay = document.querySelector(".parallax-bg-overlay");
  if (!overlay) return;
  const scrollY = window.scrollY;
  overlay.style.transform = `translateY(${scrollY * 0.25}px)`;
}
window.addEventListener("scroll", updateMinimalParallaxOverlay);
document.addEventListener("DOMContentLoaded", updateMinimalParallaxOverlay);

function updateBentoCards() {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const rawProgress = Math.min(scrollY / maxScroll, 1);
  const cardHue = rawProgress * 180;

  // Sinewave hue shift only — project cards are not affected
  const sineWaveCanvas = document.getElementById("waves");
  if (sineWaveCanvas) {
    sineWaveCanvas.style.filter = `hue-rotate(${cardHue}deg)`;
  }
}

window.addEventListener("scroll", updateBentoCards);
document.addEventListener("DOMContentLoaded", updateBentoCards);

document.addEventListener("keydown", (e) => {
  if (e.key === "r" && window.waveGen) {
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    waveGen.direction *= -1; // Reverse animation direction
  }
});

// Complementary Color Effect for PABLOPISTOLA hover
document.addEventListener("DOMContentLoaded", function () {
  // Ensure toggleComplementaryColors is accessible FIRST
  window.toggleComplementaryColors =
    window.toggleComplementaryColors ||
    function () {
      if (typeof window.isComplementaryMode === "undefined") {
        window.isComplementaryMode = false;
      }
      window.isComplementaryMode = !window.isComplementaryMode;
      if (window.isComplementaryMode) {
        document.body.classList.add("complementary-colors");
        // Use easter egg colors from easterEggSineWave.js
        if (window.initEasterEggColors) window.initEasterEggColors();
        if (window.startFeatherEffect) window.startFeatherEffect();
      } else {
        document.body.classList.remove("complementary-colors");
        // Reset to main colors from easterEggSineWave.js
        if (window.resetMainColors) window.resetMainColors();
        if (window.stopFeatherEffect) window.stopFeatherEffect();
      }
    };

});
