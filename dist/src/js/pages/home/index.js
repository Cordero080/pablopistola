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
