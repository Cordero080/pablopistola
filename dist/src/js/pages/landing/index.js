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
  window.location.replace("/home.html");
}

// Zen mode: reposition button and change text
if (stayMode) {
  document.body.classList.add("zen-mode");
  document.querySelector("#enterBtn span").textContent = "back";
}

// Show enter button after 1.5s
setTimeout(() => {
  document.getElementById("enterBtn").classList.add("visible");
}, 1500);

// Handle enter click - dissolve then navigate
document.getElementById("enterBtn").addEventListener("click", (e) => {
  e.preventDefault();
  sessionStorage.setItem("skippedLanding", "true");

  document.getElementById("enterBtn").classList.remove("visible");
  document.querySelector(".landing-container").classList.add("dissolving");
  document.getElementById("waves").classList.add("dissolving");
  document.querySelector(".enter-identity")?.classList.add("dissolving");

  setTimeout(() => {
    window.location.href = "/home.html";
  }, 1000);
});
