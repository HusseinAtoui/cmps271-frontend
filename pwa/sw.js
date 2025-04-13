const CACHE_NAME = 'journal-cache-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/homepage.css',
  '/homepage.js',
  '/pwa/web-app-manifest-192x192.png',
  '/pwa/web-app-manifest-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
});

// Dynamic caching for API responses
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.url.includes('/api/')) {
    // Cache API responses
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => caches.match(request)) // Offline fallback
    );
  } else {
    // Serve static assets from cache first
    event.respondWith(
      caches.match(request)
        .then(cached => cached || fetch(request))
    );
  }
});
