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

  // Hero title click to toggle comp mode
  const heroTitle = document.getElementById("heroTitle");
  if (heroTitle) {
    heroTitle.style.cursor = "pointer";
    heroTitle.addEventListener("click", () => {
      if (typeof window.toggleComplementaryColors === "function") {
        window.toggleComplementaryColors();
        console.log("Comp mode toggled via hero title");
      }
    });
  }
});

function updateWaveColors(isComplementary) {
  if (window.waveGen && window.waveGen.ctx) {
    const gradient = window.waveGen.ctx.createLinearGradient(
      0,
      0,
      window.waveGen.width,
      0,
    );

    if (isComplementary) {
      // Complementary colors
      gradient.addColorStop(0, "#00ff7f"); // Complement of pink
      gradient.addColorStop(0.2, "#00ff80"); // Complement of magenta
      gradient.addColorStop(0.5, "#ffaa00"); // Complement of blue
      gradient.addColorStop(1, "#ff4500"); // Complement of turquoise
    } else {
      // Original colors
      gradient.addColorStop(0, "pink");
      gradient.addColorStop(0.2, "magenta");
      gradient.addColorStop(0.5, "blue");
      gradient.addColorStop(1, "turquoise");
    }

    window.waveGen.waves.forEach((w) => (w.strokeStyle = gradient));
  }
}

function setEtherealWaveComplexity(isEthereal) {
  if (window.waveGen) {
    if (isEthereal) {
      window.waveGen.speed = 0.7; // Slow, fabric-like
      window.waveGen.waves = [
        {
          timeModifier: 1,
          lineWidth: 5.4,
          amplitude: 264,
          wavelength: 480,
          segmentLength: 16,
        },
        {
          timeModifier: 0.8,
          lineWidth: 3,
          amplitude: 244,
          wavelength: 220,
          segmentLength: 12,
        },
        {
          timeModifier: 1.5,
          lineWidth: 2,
          amplitude: 96,
          wavelength: 80,
          segmentLength: 6,
        },
        {
          timeModifier: 2.3,
          lineWidth: 1,
          amplitude: 48,
          wavelength: 40,
          segmentLength: 3,
        },
        {
          timeModifier: 0.6,
          lineWidth: 0.7,
          amplitude: 36,
          wavelength: 720,
          segmentLength: 24,
        },
      ];
      window.waveGen.resizeEvent();
    } else {
      window.waveGen.speed = 4;
      window.waveGen.waves = [
        {
          timeModifier: 1,
          lineWidth: 3,
          amplitude: 150,
          wavelength: 200,
          segmentLength: 20,
        },
        { timeModifier: 1, lineWidth: 2, amplitude: 150, wavelength: 100 },
        {
          timeModifier: 1,
          lineWidth: 1,
          amplitude: -150,
          wavelength: 50,
          segmentLength: 10,
        },
        {
          timeModifier: 1,
          lineWidth: 0.5,
          amplitude: -100,
          wavelength: 100,
          segmentLength: 10,
        },
        {
          timeModifier: 1,
          lineWidth: 0.5,
          amplitude: -50,
          wavelength: 50,
          segmentLength: 20,
        },
      ];
      window.waveGen.resizeEvent();
    }
  }
}

// Patch sinewave animation to attract to cursor in both X and Y
let cursorY = window.innerHeight / 2;
let cursorX = window.innerWidth / 2;
window.addEventListener("mousemove", function (e) {
  cursorX = e.clientX;
  cursorY = e.clientY;
});

if (window.waveGen) {
  const originalDraw = window.waveGen.draw;
  window.waveGen.draw = function () {
    const canvas = document.getElementById("waves");
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    window.waveGen.waves.forEach((wave, i) => {
      // Track both X and Y offset for each wave
      if (!wave._offsetY) wave._offsetY = canvas.height / 2;
      if (!wave._offsetX) wave._offsetX = canvas.width / 2;
      // Calculate distance from wave to cursor
      let distY = Math.abs(wave._offsetY - cursorY);
      let distX = Math.abs(wave._offsetX - cursorX);
      // Pull strength decreases as distance increases
      let strengthY = Math.max(0.04, 0.18 - (distY / canvas.height) * 0.16);
      let strengthX = Math.max(0.04, 0.18 - (distX / canvas.width) * 0.16);
      wave._offsetY += (cursorY - wave._offsetY) * strengthY;
      wave._offsetX += (cursorX - wave._offsetX) * strengthX;
      wave.offsetY = wave._offsetY;
      wave.offsetX = wave._offsetX;
    });
    if (originalDraw) originalDraw.call(window.waveGen);
  };
}
