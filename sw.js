// Service Worker for 智心同检知识库 - v3 force-reload
const CACHE_NAME = 'zhixin-knowledge-v3';
const ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: pre-cache static assets only (NOT HTML), skip waiting immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: delete ALL old caches, claim all clients, force reload
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => caches.delete(key)));
    }).then(() => {
      return caches.open(CACHE_NAME); // re-open new cache
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      return self.clients.matchAll().then(clients => {
        clients.forEach(function(client) {
          client.navigate(client.url);
        });
      });
    })
  );
});

// Fetch: HTML always network-only, assets cache-first
self.addEventListener('fetch', event => {
  var url = new URL(event.request.url);
  if (event.request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
        return response;
      });
    })
  );
});
