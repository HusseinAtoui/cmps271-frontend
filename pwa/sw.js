const CACHE_NAME = 'journal-cache-v4';

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
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => cachedResponse || fetch(event.request))
  );
});
