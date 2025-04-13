const CACHE_NAME = 'journal-cache-v1';

const urlsToCache = [
  '/',             // homepage
  '/index.html',
  '/homepage.css',  
  '/homepage.js',       
  '/pwa/web-app-manifest-192x192.png',
  '/pwa/web-app-manifest-512x512.png'
];

// Install event — cache everything listed
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event — serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
