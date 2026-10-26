// Page loader dismiss logic
window.addEventListener("load", () => {
  const loader = document.getElementById("pageLoader");
  if (loader) {
    // Was an 800ms hold unless sessionStorage said the visitor came through
    // the landing page. The landing is switched off at the route now (see
    // LANDING-PAGE-DISABLED.md), so that flag is never set and every visitor
    // paid the 800ms. window.load already waits for images; no extra hold.
    loader.classList.add("hidden");
  }
});
