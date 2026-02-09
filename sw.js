const CACHE_NAME = "pablo-pistola-v8";
const ASSETS_TO_CACHE = [
  "/",
  "/home",
  "/app.js",
  "/Css/style.css",
  "/Css/landing.css",
  "/Css/feathers.css",
  "/Css/compMode.css",
  "/js/sineWave.js",
  "/js/landing.js",
  "/js/feathers.js",
  "/js/orb.js",
  "/js/compMode.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request, { redirect: 'follow' }).then((response) => {
        // Don't cache non-successful responses, redirects, or non-GET requests
        if (
          !response ||
          response.status !== 200 ||
          response.type === 'opaqueredirect' ||
          event.request.method !== "GET"
        ) {
          return response;
        }
        // Clone and cache the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }),
  );
});
