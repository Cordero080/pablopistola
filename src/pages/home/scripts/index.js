// Home page orchestrator — loaded last, after all other home scripts
// Script load order in home.html:
//   1. src/js/effects/sineWave.js
//   2. src/js/effects/easterEggSineWave.js
//   3. src/js/effects/feathers.js
//   4. src/js/components/waveColors.js
//   5. src/js/effects/orb.js
//   6. src/js/utils/compMode.js
//   7. src/js/effects/magnetic.js
//   8. src/js/utils/serviceWorker.js
//  10. src/js/pages/home/parallax.js
//  11. src/js/pages/home/loader.js
//  12. src/js/pages/home/lazyImages.js
//  13. src/js/pages/home/mobileMenu.js
//  14. src/js/components/cursor.js
//  15. src/js/components/nameScramble.js
//  16. src/js/components/bentoCards.js
//  17. src/js/utils/analytics.js
//  18. src/js/pages/home/index.js  ← this file

// ── Hero underline — matches width to the subtitle element ──
(function () {
  const subtitle = document.querySelector(".hero-subtitle");
  const underline = document.getElementById("heroUnderline");
  if (!subtitle || !underline) return;
  function syncWidth() {
    underline.style.width = subtitle.getBoundingClientRect().width + "px";
  }
  syncWidth();
  window.addEventListener("resize", syncWidth);
})();

// ── Contact section — subtle parallax on each link ──
(function () {
  const section = document.getElementById("contact");
  const links = document.querySelectorAll("#contactLinks .contact-link");
  const speeds = [0.04, 0.07, 0.1];
  function onScroll() {
    const rect = section.getBoundingClientRect();
    const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
    links.forEach((el, i) => {
      el.style.transform = `translateY(${centerOffset * -speeds[i]}px)`;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
})();

// ── Hero title: wrap letters + click → glitch → compMode toggle ──
(function () {
  const title = document.getElementById("heroTitle");
  if (!title) return;

  const TITLE_TEXT = "PVBLO C0RDERO";
  const PHI = (1 + Math.sqrt(5)) / 2;
  const colorVariants = [
    "magenta",
    "cyan",
    "aqua",
    "purple",
    "blue",
    "orange",
    "pink",
    "green",
  ];

  // Wrap each character in a .title-letter span (same structure as landing glitch.js)
  title.textContent = "";
  TITLE_TEXT.split("").forEach((letter, index) => {
    const span = document.createElement("span");
    const isSpace = letter === " ";
    const isFlipped = index === 0 || index === TITLE_TEXT.length - 1;
    const colorVariant = colorVariants[index % colorVariants.length];

    if (isSpace) {
      span.className = "title-letter title-letter--space";
    } else {
      const classes = ["title-letter", `title-letter--${colorVariant}`];
      if (isFlipped) classes.push("title-letter--flip");
      // Preserve title-inverted-v on V for compMode.css targeting
      if (index === 1) classes.push("title-inverted-v");
      span.className = classes.join(" ");
      span.setAttribute("data-letter", letter);
    }

    span.textContent = letter;
    title.appendChild(span);
  });

  // Inline styles beat any cached CSS (service worker) — prevent wrapping
  title.style.display = "block";
  title.style.width = "100%";
  title.style.whiteSpace = "nowrap";
  title.style.textAlign = "center";
  title.style.overflow = "visible";
  title.classList.add("home-title-ready");

  // Click → glitch → compMode toggle
  let animating = false;
  title.addEventListener("click", () => {
    if (animating) return;
    animating = true;

    // Phase 1: instantly hide all letters
    title.classList.add("landing-title--reset");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Phase 2: fire glitch animations with Weyl-sequence stagger
        title.classList.remove("landing-title--reset");
        title.classList.add("landing-title--replay");

        const letterSpans = title.querySelectorAll(
          ".title-letter:not(.title-letter--space)",
        );
        letterSpans.forEach((span, i) => {
          const weyl = ((i + 1) * PHI) % 1;
          span.style.animationDelay = `${weyl * 0.3}s`;
        });

        // Toggle compMode once glitch visually completes (~650ms)
        setTimeout(() => {
          if (typeof window.toggleComplementaryColors === "function") {
            window.toggleComplementaryColors();
          }
        }, 650);

        // Cleanup: restore visible state, unlock for next click (after 3.5s anim + max stagger)
        setTimeout(() => {
          title.classList.remove("landing-title--replay");
          letterSpans.forEach((span) => {
            span.style.animationDelay = "";
          });
          animating = false;
        }, 3900);
      });
    });
  });
})();
