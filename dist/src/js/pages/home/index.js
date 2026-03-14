// Home page orchestrator — loaded last, after all other home scripts
// This file intentionally thin: all logic is in the other home/ files.
// Script load order in home.html:
//   1. src/js/effects/sineWave.js
//   2. src/js/effects/easterEggSineWave.js
//   3. src/js/effects/feathers.js
//   4. src/js/components/waveColors.js  (patches window.waveGen.draw, must run after sineWave.js)
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
//  15. src/js/components/audioToggle.js
//  16. src/js/components/nameScramble.js
//  17. src/js/components/bentoCards.js
//  18. src/js/utils/analytics.js
//  19. src/js/pages/home/index.js  (this file — orchestrator, loaded last)
