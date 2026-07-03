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

// Fade title out 2s after button appears — edges inward toward center
setTimeout(() => {
  const title = document.getElementById("landingTitle");
  if (!title) return;
  const letters = title.querySelectorAll(".title-letter");
  const center = (letters.length - 1) / 2;

  // Step 1: lock current opacity so killing the entry animation doesn't snap to 0
  letters.forEach((span) => {
    span.style.animation = "none";
    span.style.opacity = "1";
  });

  // Step 2: next frame, apply staggered transition to opacity 0
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      letters.forEach((span, i) => {
        const distFromCenter = Math.abs(i - center);
        const delay = (center - distFromCenter) * 0.05;
        span.style.transition = `opacity 0.35s ease-in ${delay.toFixed(3)}s`;
        span.style.opacity = "0";
      });
    });
  });
}, 6000);

// Brighten subtitle and slide it up to where the title was
setTimeout(() => {
  const subtitle = document.querySelector(".enter-identity-subtitle");
  const title = document.getElementById("landingTitle");
  if (!subtitle || !title) return;

  subtitle.classList.add("subtitle--bright");

  const titleRect = title.getBoundingClientRect();
  const subtitleRect = subtitle.getBoundingClientRect();
  const titleCenterY = titleRect.top + titleRect.height / 2;
  const subtitleCenterY = subtitleRect.top + subtitleRect.height / 2;
  subtitle.style.transform = `translateY(${titleCenterY - subtitleCenterY}px)`;
}, 6500);

// Show enter button after full sequence (~5s)
setTimeout(() => {
  document.getElementById("enterBtn").classList.add("visible");
}, 4000);

// Prefetch home early — nearly every visitor navigates there
const prefetch = document.createElement("link");
prefetch.rel = "prefetch";
prefetch.href = "/home";
document.head.appendChild(prefetch);

// Handle enter click - scanline collapse then navigate
document.getElementById("enterBtn").addEventListener("click", (e) => {
  e.preventDefault();
  sessionStorage.setItem("skippedLanding", "true");

  const btn = document.getElementById("enterBtn");
  btn.classList.add("collapsing");
  window.__stopRubix = true;

  setTimeout(() => {
    document.querySelector(".landing-container").classList.add("dissolving");
    document.getElementById("waves").classList.add("dissolving");
    document.querySelector(".enter-identity")?.classList.add("dissolving");
  }, 250);

  setTimeout(() => {
    window.location.href = "/home";
  }, 600);
});
