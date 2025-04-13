const CACHE_NAME = 'journal-cache-v5';

const STATIC_ASSETS = [
  '/cmps271-frontend/',
  '/cmps271-frontend/index.html',
  '/cmps271-frontend/homepage.css',
  '/cmps271-frontend/homepage.js',
  '/cmps271-frontend/pwa/web-app-manifest-192x192.png',
  '/cmps271-frontend/pwa/web-app-manifest-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

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

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Handle API requests for events/articles
  if (request.url.includes('/api/events') || request.url.includes('/api/articles')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(request)) // Serve cached API response if offline
    );
  } else {
    // Handle static assets
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => cachedResponse || fetch(request))
    );
  }
});
