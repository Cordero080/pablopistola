// Self-healing service worker — fast on repeat visits, never stale after a deploy.
//
// The browser always fetches THIS file from the network when it checks for a
// worker update, which is what lets a new version replace a stuck one.
//
// Routing is split three ways, because the build emits three kinds of file:
//   1. NAVIGATIONS (the HTML)        -> network-first. Always the newest page,
//      and it is this request that triggers the worker update check.
//   2. IMMUTABLE assets              -> cache-first. Vite's /assets/*-[hash].*
//      bundles plus images/audio/icons/fonts. A hashed URL can never point at
//      different bytes, and media effectively never changes in place, so going
//      to the network for them is pure latency.
//   3. EVERYTHING ELSE same-origin   -> stale-while-revalidate. The 44 unhashed
//      /src/** scripts copied by copyJsPlugin keep stable URLs across deploys,
//      so they are served instantly from cache AND refetched in the background;
//      the next load gets the new code.
//
// Freshness safety net: scripts/bump-sw-version.js rewrites CACHE_NAME on every
// build, and `activate` deletes every cache. So a deploy empties the cache once,
// that first load refetches everything, and every load after it is instant again.
//
// CACHE_NAME keeps the "pablo-pistola-" prefix so bump-sw-version.js still
// rewrites it on build — do not change the shape of this declaration.

// ---------- CONFIG ----------

const CACHE_NAME = "pablo-pistola-1795651870749";

const isLocalhost =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1";

// Paths whose bytes can't change under a stable URL: hashed bundles, and media
// we replace by adding a new file rather than overwriting an old one.
const IMMUTABLE_PATHS = [/^\/assets\//, /^\/images\//, /^\/icons\//, /^\/music\//];

// Same idea by extension, for anything living outside those folders.
const IMMUTABLE_EXTENSIONS =
  /\.(?:png|jpe?g|webp|avif|gif|svg|ico|mp3|wav|ogg|m4a|woff2?|ttf|otf|glb|gltf|hdr)$/i;

// ---------- HELPERS ----------

// A page load (address bar, link click, reload) rather than a sub-resource.
function isNavigation(request) {
  return request.mode === "navigate";
}

function isImmutable(url) {
  return (
    IMMUTABLE_PATHS.some((pattern) => pattern.test(url.pathname)) ||
    IMMUTABLE_EXTENSIONS.test(url.pathname)
  );
}

// Store a copy only if the response is actually usable. `.clone()` is required
// because a Response body can be read once, and the browser needs the original.
async function putInCache(request, response) {
  if (!response || response.status !== 200 || response.type === "opaque") return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

// Tier 1 — freshness wins. Network, falling back to cache only when offline.
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    await putInCache(request, response);
    return response;
  } catch {
    const cached = await caches.match(request);
    // A failed navigation with nothing cached still has to return something.
    return cached || Response.error();
  }
}

// Tier 2 — speed wins. Cache if present (zero network), otherwise fetch once.
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  await putInCache(request, response);
  return response;
}

// Tier 3 — both. Return the cached copy immediately, refresh it in the
// background so the NEXT load is current. No await on the refetch: that is what
// keeps this as fast as cache-first.
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      putInCache(request, response);
      return response;
    })
    .catch(() => cached);
  return cached || networkFetch;
}

// ---------- MAIN ----------

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Wipe ALL caches — not just old-named ones — so no stale build survives.
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));

      if (isLocalhost) {
        // Remove the worker entirely and reload every controlled tab so dev
        // serves fresh files with nothing intercepting.
        await self.registration.unregister();
        const windows = await self.clients.matchAll({ type: "window" });
        windows.forEach((window) => window.navigate(window.url));
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

  const url = new URL(event.request.url);

  if (isNavigation(event.request)) {
    event.respondWith(networkFirst(event.request));
  } else if (isImmutable(url)) {
    event.respondWith(cacheFirst(event.request));
  } else {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});
