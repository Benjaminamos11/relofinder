// Service Worker for ReloFinder - Performance Optimization
const CACHE_NAME = 'relofinder-v2';
const STATIC_CACHE_NAME = 'relofinder-static-v2';
const DYNAMIC_CACHE_NAME = 'relofinder-dynamic-v2';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/swiss-relocation-guide',
  '/assets/css/styles.css',
  '/fonts/inter-var.woff2',
  '/offline.html'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME && 
              cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) return;

  // Different strategies for different resource types
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.startsWith('/blog/')) {
    event.respondWith(handleBlogRequest(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Image caching strategy - Cache First with size limits
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse.status === 200) {
      // Clone before caching (stream can only be read once)
      const responseClone = networkResponse.clone();
      
      // Limit cache size for images
      limitCacheSize(DYNAMIC_CACHE_NAME, 50);
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Image fetch failed:', error);
    // Return placeholder image for failed image requests
    return new Response('', { status: 404 });
  }
}

// Blog posts - Stale While Revalidate
async function handleBlogRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Serve from cache immediately if available
    const responsePromise = fetch(request).then(response => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => cachedResponse);
    
    return cachedResponse || await responsePromise;
  } catch (error) {
    console.log('Blog fetch failed:', error);
    return caches.match('/offline.html');
  }
}

// API requests - Network First
async function handleApiRequest(request) {
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('API request failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response(
      JSON.stringify({ error: 'Offline' }), 
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Static assets - Cache First
async function handleStaticRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Static resource fetch failed:', error);
    return caches.match('/offline.html');
  }
}

// Utility function to limit cache size
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    // Remove oldest entries
    const oldestKeys = keys.slice(0, keys.length - maxSize);
    await Promise.all(oldestKeys.map(key => cache.delete(key)));
  }
}

// Background sync for form submissions (if supported)
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'contact-form') {
      event.waitUntil(syncContactForm());
    }
  });
}

async function syncContactForm() {
  // Handle background sync for contact forms
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const pendingRequests = await cache.match('/pending-forms');
    
    if (pendingRequests) {
      const forms = await pendingRequests.json();
      
      for (const form of forms) {
        try {
          await fetch('/api/contact', {
            method: 'POST',
            body: JSON.stringify(form),
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.log('Form sync failed:', error);
        }
      }
      
      // Clear pending forms after successful sync
      await cache.delete('/pending-forms');
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Push notification handling (if implemented)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New update from ReloFinder',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      data: data.url || '/',
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/action-view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/action-dismiss.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'ReloFinder', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

console.log('ReloFinder Service Worker loaded successfully'); 