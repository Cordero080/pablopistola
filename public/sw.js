// Self-healing service worker.
//
// The browser fetches THIS file fresh (bypassing any active worker's cache)
// whenever it checks for a service-worker update — which is what lets a new
// version replace a stuck one. So this version is written to break the exact
// deadlock that made an old worker keep serving stale files on localhost:
//   • on localhost: wipe every cache, unregister itself, reload the page —
//     the dev server then serves everything fresh with no worker in the way;
//   • on production: network-first (always try the network, fall back to
//     cache only when offline) and wipe stale caches on activate, so a new
//     deploy is never masked by an old cached bundle.
//
// CACHE_NAME keeps the "pablo-pistola-" prefix so scripts/bump-sw-version.js
// still rewrites it on build.
const CACHE_NAME = "pablo-pistola-selfheal-1";

const isLocalhost =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Wipe ALL caches — not just old-named ones — so no stale build survives.
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));

      if (isLocalhost) {
        // Remove the worker entirely and reload every controlled tab so dev
        // serves fresh files with nothing intercepting.
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: "window" });
        clients.forEach((c) => c.navigate(c.url));
        return;
      }

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  // Never intercept on localhost — the dev server is the single source of truth.
  if (isLocalhost) return;
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Network-first: always try fresh; fall back to cache only when offline.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
