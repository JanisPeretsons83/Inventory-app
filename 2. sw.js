
const CACHE_NAME = "inventory-app-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/dardu_map1.jpeg",
  "/dardu_map2.jpeg",
  "/cecilu_map.jpeg",
  "/icons/worklog-192.png"
];

// ✅ install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ✅ fetch (offline)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
