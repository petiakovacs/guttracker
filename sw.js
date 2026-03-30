// GutTracker Service Worker — cache-first with update on reload
const CACHE_VERSION = 'gt-v1.1';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network-first strategy: try network, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Clone and cache the fresh response
        const clone = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
