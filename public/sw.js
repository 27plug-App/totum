const CACHE_NAME = 'totum-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).catch(error => {
      console.error('Failed to cache static assets during install:', error);
    })
  );
});

// Activate service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).catch(error => {
      console.error('Failed to delete old caches during activate:', error);
    })
  );
});

// Fetch event handler
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        }).catch(error => {
          console.error('Failed to cache response during fetch:', error);
        });

        return response;
      }).catch(error => {
        console.error('Fetch failed:', error);
        throw error;
      });
    }).catch(error => {
      console.error('Cache match failed:', error);
      throw error;
    })
  );
});