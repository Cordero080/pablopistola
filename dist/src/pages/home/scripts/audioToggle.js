// Audio autoplay + manual toggle
const audio = document.getElementById("site-audio");
const audioToggle = document.getElementById("audio-toggle");

if (audio) {
  audio.volume = 0.08;
}

// Autoplay on first user interaction (browsers block autoplay without it)
let audioStarted = false;
function tryAutoplay() {
  if (audioStarted || !audio) return;
  audioStarted = true;
  audio
    .play()
    .then(() => {
      // Successfully playing — update button state to show "playing"
      if (audioToggle) {
        audioToggle.classList.remove("muted");
        audioToggle.setAttribute("aria-label", "Pause music");
      }
    })
    .catch(() => {
      // Autoplay blocked — stay muted, user can click button manually
      audioStarted = false;
    });
  // Remove listeners after first successful attempt
  ["click", "keydown", "mousemove"].forEach((evt) =>
    document.removeEventListener(evt, tryAutoplay),
  );
}
["click", "keydown", "mousemove"].forEach((evt) =>
  document.addEventListener(evt, tryAutoplay, { once: false, passive: true }),
);

// Manual toggle — play/pause
if (audio && audioToggle) {
  audioToggle.addEventListener("click", (e) => {
    e.stopPropagation(); // don't trigger tryAutoplay as well
    if (audio.paused) {
      audio
        .play()
        .then(() => {
          audioStarted = true;
          audioToggle.classList.remove("muted");
          audioToggle.setAttribute("aria-label", "Pause music");
        })
        .catch(() => {});
    } else {
      audio.pause();
      audioToggle.classList.add("muted");
      audioToggle.setAttribute("aria-label", "Play music");
    }
  });
}
