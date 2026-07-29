// Service Worker registration.
//
// On localhost we must do more than skip registration: a worker that was
// installed on localhost at some earlier point (e.g. from serving the
// production build) stays installed and keeps intercepting requests with its
// cache-first handler, serving stale files even after a hard reload. So on
// localhost we actively UNREGISTER every worker and DELETE every cache, which
// is the only thing that evicts it.
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "";

if ("serviceWorker" in navigator) {
  if (isLocalhost) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
    if (window.caches && caches.keys) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }
  } else {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW registration failed:", err));
    });
  }
}
