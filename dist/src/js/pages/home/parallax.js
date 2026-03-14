// Parallax Effect: scroll + mouse (desktop) / gyroscope (mobile)
document.addEventListener("DOMContentLoaded", () => {
  // Take ownership of overlay transform on this page
  window.homeParallaxActive = true;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const heroContent = document.querySelector(".hero-content");
  const heroGlow = document.querySelector(".hero-bg-glow");
  const overlay = document.querySelector(".parallax-bg-overlay");

  let scrollY = 0;
  // Normalized pointer offset: -1 to 1 from viewport center
  let targetX = 0,
    targetY = 0;
  let currentX = 0,
    currentY = 0;

  // === DESKTOP: mouse-move parallax ===
  if (!isMobile) {
    window.addEventListener(
      "mousemove",
      (e) => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true },
    );
  }

  // === MOBILE: gyroscope parallax ===
  if (isMobile) {
    const enableGyro = () => {
      window.addEventListener(
        "deviceorientation",
        (e) => {
          const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
          // gamma = left/right tilt, beta = front/back (offset by natural hold angle ~30°)
          targetX = clamp((e.gamma || 0) / 20, -1, 1);
          targetY = clamp(((e.beta || 0) - 30) / 20, -1, 1);
        },
        { passive: true },
      );
    };

    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      // iOS 13+ requires explicit permission — request on first touch
      window.addEventListener(
        "touchstart",
        () => {
          DeviceOrientationEvent.requestPermission()
            .then((state) => {
              if (state === "granted") enableGyro();
            })
            .catch(() => {});
        },
        { once: true, passive: true },
      );
    } else {
      enableGyro();
    }
  }

  // Scroll listener
  window.addEventListener(
    "scroll",
    () => {
      scrollY = window.scrollY;
    },
    { passive: true },
  );

  // === Letter decomposition setup ===
  const heroTitleEl = document.getElementById("heroTitle");
  const originalTitleHTML = heroTitleEl ? heroTitleEl.innerHTML : "";
  const accentColors = ["#00d4ff", "#ff00cc", "#8338ec", "#00fff7", "#ff006e"];
  let decomposed = false;
  let letterSpans = [];
  let letterVectors = [];

  // Scroll velocity tracking
  let lastScrollForVelocity = 0;
  let scrollVelocity = 0;
  window.addEventListener(
    "scroll",
    () => {
      scrollVelocity = Math.abs(window.scrollY - lastScrollForVelocity);
      lastScrollForVelocity = window.scrollY;
    },
    { passive: true },
  );

  function buildDecomposition() {
    if (decomposed || !heroTitleEl) return;
    decomposed = true;
    const chars = originalTitleHTML.split("");
    let vecIdx = 0;
    heroTitleEl.innerHTML = chars
      .map((char) => {
        if (char === " ")
          return `<span style="display:inline-block;width:0.35em"> </span>`;
        const angle = Math.random() * Math.PI * 2;
        const dist = 70 + Math.random() * 130;
        const color = accentColors[vecIdx % accentColors.length];
        // Each letter gets its own stagger threshold offset (0–0.18 range)
        const staggerOffset =
          (vecIdx / chars.filter((c) => c !== " ").length) *
          0.18 *
          Math.random();
        letterVectors.push({
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist * 0.6 - Math.random() * 40,
          r: (Math.random() - 0.5) * 55,
          color,
          staggerOffset,
        });
        vecIdx++;
        return `<span class="d-ltr" style="display:inline-block;-webkit-text-fill-color:${color};color:${color}">${char}</span>`;
      })
      .join("");
    letterSpans = Array.from(heroTitleEl.querySelectorAll(".d-ltr"));
  }

  function resetDecomposition() {
    if (!decomposed || !heroTitleEl) return;
    decomposed = false;
    letterSpans = [];
    letterVectors = [];
    heroTitleEl.innerHTML = originalTitleHTML;
    heroTitleEl.style.textShadow = "";
  }

  // === Unified RAF loop — three depth layers + decomposition ===
  function loop() {
    const lerpFactor = isMobile ? 0.04 : 0.07;
    currentX += (targetX - currentX) * lerpFactor;
    currentY += (targetY - currentY) * lerpFactor;

    const scrollProgress = Math.min(scrollY / (window.innerHeight * 0.5), 1);

    // Layer 1: overlay ellipse — slowest, deepest background
    if (overlay) {
      const ox = currentX * 14;
      const oy = currentY * 9 + scrollY * 0.25;
      overlay.style.transform = `translateX(${ox}px) translateY(${oy}px)`;
    }

    // Layer 2: hero glow — mid depth
    if (heroGlow) {
      const gx = currentX * 24;
      const gy = currentY * 16 + scrollY * 0.3;
      heroGlow.style.transform = `translateX(${gx}px) translateY(${gy}px) scale(${1 + scrollProgress * 0.2})`;
      heroGlow.style.opacity = 1 - scrollProgress * 0.5;
    }

    // Layer 3: hero content — foreground
    if (heroContent) {
      const hx = currentX * 16;
      const hy = currentY * 10;
      if (!isMobile) {
        const translateY = scrollY * 0.7;
        const scale = 1 - scrollProgress * 0.15;
        const rotateX = scrollProgress * 8;
        const blur = scrollProgress * 4;
        const opacity = Math.max(0, 1 - scrollProgress * 1.2);
        heroContent.style.transform = `
          perspective(1000px)
          translateX(${hx}px)
          translateY(${translateY + hy}px)
          scale(${scale})
          rotateX(${rotateX}deg)
        `;
        heroContent.style.opacity = opacity;
        heroContent.style.filter = `blur(${blur}px)`;
      } else {
        // Mobile: gyro offset only, no scroll transforms (prevents jank)
        heroContent.style.transform = `translateX(${hx}px) translateY(${hy}px)`;
      }
    }

    // === Letter decomposition — triggers as title scrolls behind content ===
    const GLITCH_START = 0.18;
    const glitchRaw = Math.max(
      0,
      (scrollProgress - GLITCH_START) / (1 - GLITCH_START),
    );
    const glitchEased = glitchRaw * glitchRaw; // quadratic — slow start, accelerates

    // Velocity multiplier: fast scroll = more violent effect (capped at 3x)
    const velocityMult = Math.min(1 + scrollVelocity * 0.04, 3);

    if (glitchRaw > 0.02) {
      buildDecomposition();

      // Chromatic aberration — scales with velocity
      const ab = glitchEased * 9 * velocityMult;
      heroTitleEl.style.textShadow = `${ab}px 0 #ff00cc80, ${-ab}px 0 #00d4ff80`;

      const jitterActive = glitchRaw > 0.2 && glitchRaw < 0.8;

      letterSpans.forEach((span, i) => {
        const v = letterVectors[i];
        if (!v) return;

        // Stagger: each letter has its own effective progress
        const letterProgress = Math.max(0, glitchRaw - v.staggerOffset);
        const letterEased = letterProgress * letterProgress;

        // Color flash: cycle accent colors rapidly during jitter phase
        if (jitterActive && Math.random() < glitchEased * 0.4) {
          const flashColor =
            accentColors[Math.floor(Math.random() * accentColors.length)];
          span.style.webkitTextFillColor = flashColor;
          span.style.color = flashColor;
        }

        // Scale pop: briefly enlarges as letter starts ejecting
        const popScale = letterProgress < 0.15 ? 1 + letterProgress * 2 : 1;

        // Jitter amplified by velocity
        const jMag = glitchEased * 12 * velocityMult;
        const jx = jitterActive ? (Math.random() - 0.5) * jMag : 0;
        const jy = jitterActive ? (Math.random() - 0.5) * jMag : 0;

        span.style.transform = `translateX(${v.x * letterEased + jx}px) translateY(${v.y * letterEased + jy}px) rotate(${v.r * letterEased}deg) scale(${popScale})`;
        span.style.opacity = Math.max(0, 1 - letterEased * 1.6);

        // Blur only on desktop — too expensive per-letter on mobile
        if (!isMobile) {
          span.style.filter = `blur(${letterEased * 5}px)`;
        }
      });
    } else {
      resetDecomposition();
    }

    requestAnimationFrame(loop);
  }

  loop();
});
