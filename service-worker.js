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
  console.log("Service Worker: Installazione in corso...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching files...");
      return cache.addAll(urlsToCache);
    }).catch((error) => {
      console.error("Service Worker: Errore durante il caching:", error);
    })
  );
});

// Intercettazione delle richieste
self.addEventListener("fetch", (event) => {
  console.log("Service Worker: Intercettazione richiesta per", event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch((error) => {
      console.error("Service Worker: Errore durante il fetch:", error);
    })
  );
});