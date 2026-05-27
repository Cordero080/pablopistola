// Home page orchestrator — loaded last, after all other home scripts
// Script load order in home.html:
//   1. src/js/effects/sineWave.js
//   2. src/js/effects/easterEggSineWave.js
//   3. src/js/effects/feathers.js
//   4. src/js/components/waveColors.js
//   5. src/js/effects/orb.js
//   6. src/js/utils/compMode.js
//   7. src/js/effects/magnetic.js
//   8. src/js/effects/konami.js
//   9. src/js/utils/serviceWorker.js
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

// ── Title letter flip + alternate theme activation ──
// Desktop: hover triggers gradient fade → letters mirror one by one → theme activates
// Mobile:  tap triggers the same sequence
// Unflip (+ theme toggle back) happens on mouse-leave / second tap.
(function () {
  const title = document.getElementById("heroTitle");
  if (!title) return;

  const isMobile = () => window.matchMedia("(hover: none)").matches;

  const spanStyle = [
    "display:inline-block",
    "background:linear-gradient(to bottom,var(--ht-a) 0%,var(--ht-b) 25%,var(--ht-c) 50%,var(--ht-d) 75%,var(--ht-e) 100%)",
    "-webkit-background-clip:text",
    "background-clip:text",
    "-webkit-text-fill-color:transparent",
    "transition:transform 0.35s cubic-bezier(0.4,0,0.2,1)",
  ].join(";");

  function ensureSpans() {
    if (title.querySelector(".flip-ltr")) return;
    const text = title.textContent;
    title.innerHTML = text
      .split("")
      .map((ch) =>
        ch === " "
          ? `<span style="display:inline-block;width:0.35em"> </span>`
          : `<span class="flip-ltr" style="${spanStyle}">${ch}</span>`
      )
      .join("");
    title.style.webkitTextFillColor = "unset";
    title.style.backgroundClip = "unset";
    title.style.webkitBackgroundClip = "unset";
    title.style.background = "none";
  }

  let flipTimeout = null;
  let flipped = false;

  function flipIn() {
    clearTimeout(flipTimeout);
    // Wait for CSS gradient transition to settle, then flip letters
    flipTimeout = setTimeout(() => {
      ensureSpans();
      const spans = Array.from(title.querySelectorAll(".flip-ltr"));
      spans.forEach((span, i) => {
        setTimeout(() => {
          span.style.transform = "scaleX(-1)";
        }, i * 55);
      });
      // Activate theme once last letter finishes flipping
      const totalDelay = (spans.length - 1) * 55 + 350;
      setTimeout(() => {
        if (typeof window.toggleComplementaryColors === "function") {
          window.toggleComplementaryColors();
        }
        flipped = true;
      }, totalDelay);
    }, isMobile() ? 0 : 500); // no gradient settle delay on mobile
  }

  function flipOut() {
    clearTimeout(flipTimeout);
    const spans = Array.from(title.querySelectorAll(".flip-ltr"));
    spans.slice().reverse().forEach((span, i) => {
      setTimeout(() => {
        span.style.transform = "scaleX(1)";
      }, i * 40);
    });
    // Toggle theme back once unflip finishes
    const totalDelay = (spans.length - 1) * 40 + 350;
    setTimeout(() => {
      if (flipped && typeof window.toggleComplementaryColors === "function") {
        window.toggleComplementaryColors();
      }
      flipped = false;
    }, totalDelay);
  }

  // Desktop: hover
  title.addEventListener("mouseenter", () => { if (!isMobile()) flipIn(); });
  title.addEventListener("mouseleave", () => { if (!isMobile()) flipOut(); });

  // Mobile: tap toggles
  title.addEventListener("click", () => {
    if (!isMobile()) return;
    flipped ? flipOut() : flipIn();
  });
})();
