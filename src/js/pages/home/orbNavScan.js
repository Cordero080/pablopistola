// ─────────────────────────────────────────────────────────────────────────────
// NAV SCAN
// Sweeps .orb-highlight across nav icons top→bottom. CSS handles fade in/out.
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  const DELAY_MS  = 10000; // when the sequence first triggers
  const STEP_MS   = 450;   // delay between each icon
  const HOLD_MS   = 700;   // how long each icon stays highlighted
  const REPEAT_MS = 50000; // repeat interval (0 = once only)

  const links = Array.from(document.querySelectorAll(".side-nav-link"));
  if (!links.length) return;

  function runScan() {
    links.forEach((link, i) => {
      setTimeout(() => link.classList.add("orb-highlight"),    i * STEP_MS);
      setTimeout(() => link.classList.remove("orb-highlight"), i * STEP_MS + HOLD_MS);
    });
  }

  setTimeout(function schedule() {
    runScan();
    if (REPEAT_MS > 0) setTimeout(schedule, REPEAT_MS);
  }, DELAY_MS);
})();

