// Service Worker Registration (production only — skip on localhost to avoid stale cache during dev)
if (
  "serviceWorker" in navigator &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("SW registered"))
      .catch((err) => console.log("SW registration failed:", err));
  });
}
