const CACHE_NAME = "letterun-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./styles/style.css",
  "./scripts/main.js",
  "./images/icon.png",
  "./manifest.json"
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