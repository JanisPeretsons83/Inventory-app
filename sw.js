
const CACHE_NAME = "inventory-app-v1-22"; // 🔥 MAINI ŠO katru update!

const BASE = "/Inventory-app";
const urlsToCache = [
`${BASE}/`,
`${BASE}/index.html`,
`${BASE}/style.css`,
`${BASE}/app.js`,
`${BASE}/dardu_map1.jpeg`,
`${BASE}/dardu_map2.jpeg`,
`${BASE}/cecilu_map.jpeg`,
`${BASE}/icons/worklog-192.png`
];

// ✅ INSTALL (kešo failus)
self.addEventListener("install", event => {
  self.skipWaiting(); // ✅ uzreiz aktivizējas

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ✅ ACTIVATE (dzēš veco cache!)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // ✅ DZĒŠ VECO
          }
        })
      );
    })
  );
});

// ✅ FETCH
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
