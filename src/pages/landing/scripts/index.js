// Landing page: session check + enter button logic

// Check for ?stay param - if present, stay on landing (zen mode)
const urlParams = new URLSearchParams(window.location.search);
const stayMode = urlParams.has("stay");

// In PWA standalone mode, always show the landing — sessionStorage persists across launches on iOS
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

// If user previously skipped and this isn't zen mode or standalone, go straight to home
if (!stayMode && !isStandalone && sessionStorage.getItem("skippedLanding")) {
  window.location.replace("/home");
}

// Zen mode: reposition button and change text
if (stayMode) {
  document.body.classList.add("zen-mode");
  document.querySelector("#enterBtn span").innerHTML =
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style="display:block;margin:0 auto;"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6 8.5 6V6l-8.5 6z"/></svg>`;
}

// Fade in subtitle as name is forming (~2.8s)
setTimeout(() => {
  const subtitle = document.querySelector(".enter-identity-subtitle");
  if (subtitle) subtitle.style.opacity = "1";
}, 2800);

// Fade in sine wave as title starts animating (~2.2s)
setTimeout(() => {
  const waves = document.getElementById("waves");
  if (!waves) return;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      waves.style.opacity = "0.38";
    }),
  );
}, 2200);

// Show enter button after full sequence (~5s)
setTimeout(() => {
  document.getElementById("enterBtn").classList.add("visible");
}, 4000);

// Handle enter click - scanline collapse then navigate
document.getElementById("enterBtn").addEventListener("click", (e) => {
  e.preventDefault();
  sessionStorage.setItem("skippedLanding", "true");

  const btn = document.getElementById("enterBtn");
  btn.classList.add("collapsing");
  window.__stopRubix = true;

  // Prefetch home immediately so it loads during the animation
  const prefetch = document.createElement("link");
  prefetch.rel = "prefetch";
  prefetch.href = "/home";
  document.head.appendChild(prefetch);

  setTimeout(() => {
    document.querySelector(".landing-container").classList.add("dissolving");
    document.getElementById("waves").classList.add("dissolving");
    document.querySelector(".enter-identity")?.classList.add("dissolving");
  }, 250);

  setTimeout(() => {
    window.location.href = "/home";
  }, 600);
});
