const VERSION = "noxtech-pwa-v1";
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const STATIC_ASSETS = ["/", "/manifest.webmanifest", "/pwa-192.png", "/pwa-512.png", "/brand-mark.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isAssetRequest =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/uploads/") ||
    /\.(?:png|jpg|jpeg|webp|gif|svg|ico|woff2?|css|js)$/.test(url.pathname);

  if (isAssetRequest) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response || response.status !== 200) return response;
          const cloned = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, cloned)).catch(() => null);
          return response;
        });
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const cloned = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, cloned)).catch(() => null);
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match("/");
        }),
    );
  }
});
