// Minimal service worker: caches only the static app shell (pages, /_next/static, icons, manifest).
// Never caches API responses, questions, answers or score. Bump CACHE_NAME on every change to this file.
const CACHE_NAME = "hidonchik-shell-v1";
const CACHE_PREFIX = "hidonchik-";

const SHELL_URLS = [
  "/",
  "/about",
  "/questions",
  "/manifest.webmanifest",
  "/icon/192",
  "/icon/512",
  "/icon/maskable",
  "/apple-icon",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon/") ||
    url.pathname === "/apple-icon" ||
    url.pathname === "/manifest.webmanifest"
  );
}

function isCacheable(response) {
  return response && response.ok && response.type === "basic";
}

// Network-first for page navigations, falling back to the cached shell when offline
async function handleNavigation(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (isCacheable(response)) cache.put(new URL(request.url).pathname, response.clone());
    return response;
  } catch (err) {
    const cached = (await cache.match(new URL(request.url).pathname)) || (await cache.match("/"));
    if (cached) return cached;
    throw err;
  }
}

// Cache-first for hashed static assets and icons
async function handleStatic(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (isCacheable(response)) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  // Next.js RSC payloads for client navigation are never cached. When a navigation payload can't be
  // fetched (offline), a non-OK response makes the router fall back to a full page load, which is
  // then served from the cached shell above instead of the framework's generic error page.
  if (request.headers.has("RSC") || url.searchParams.has("_rsc")) {
    if (!request.headers.has("Next-Router-Prefetch")) {
      event.respondWith(fetch(request).catch(() => new Response(null, { status: 503 })));
    }
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(handleStatic(request));
  }
});
