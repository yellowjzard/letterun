const CACHE_NAME = "letterun-cache-v1";
const urlsToCache = [
  "/letterun/",
  "/letterun/index.html",
  "/letterun/styles/style.css",
  "/letterun/scripts/main.js",
  "/letterun/images/icon.png",
  "/letterun/manifest.json"
];

// Installazione del Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Intercettazione delle richieste
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});