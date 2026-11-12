const CACHE_NAME = 'campo-hostel-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/campo-logos/icon-192.png',
  '/campo-logos/icon-512.png'
];

// Install event - cache resources safely
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('Opened cache');
        await Promise.allSettled(
          urlsToCache.map(url => cache.add(url).catch(err => {
            console.warn('ServiceWorker: skipped resource', url, err);
          }))
        );
      })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Campo Hostel Digital',
    icon: '/campo-logos/icon-192.png',
    badge: '/campo-logos/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/campo-logos/favicon-32x32.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/campo-logos/favicon-32x32.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Campo Hostel Digital', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 