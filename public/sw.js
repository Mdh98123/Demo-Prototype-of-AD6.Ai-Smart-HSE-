// AD6 HSE Enterprise AI Platform - Service Worker (v2.0.0)
// High-Reliability Offline Caching & Background Sync Engine

const CACHE_NAME = 'ad6-hse-pwa-v2';
const RUNTIME_ASSETS_CACHE = 'ad6-hse-runtime-v2';
const FONTS_CACHE = 'ad6-hse-fonts-v2';

// In development environments (AI Studio dev previews, localhost, run.app), disable SW caching to prevent stale module chunks
const isDev = self.location.hostname.includes('ais-dev-') || 
              self.location.hostname.includes('ais-pre-') || 
              self.location.hostname.includes('run.app') || 
              self.location.hostname.includes('localhost') || 
              self.location.port === '3000' ||
              self.location.port === '8080';

if (isDev) {
  caches.keys().then((keys) => {
    return Promise.all(keys.map((k) => caches.delete(k)));
  }).finally(() => {
    self.registration.unregister().catch(() => {});
  });
}

// Core Critical Pre-Cache Manifest (production only)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico'
];

// External CDN asset patterns to cache on first use
const CACHEABLE_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net',
  'https://images.unsplash.com'
];

// 1. Service Worker Installation
self.addEventListener('install', (event) => {
  if (isDev) {
    self.skipWaiting();
    return;
  }
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachePromises = PRECACHE_URLS.map(async (url) => {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (res.ok) {
            await cache.put(url, res);
          }
        } catch (err) {
          console.warn(`[AD6 ServiceWorker] Precache failed for ${url}:`, err);
        }
      });
      await Promise.all(cachePromises);
    }).then(() => self.skipWaiting())
  );
});

// 2. Service Worker Activation & Purge All Legacy Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (isDev || (name !== CACHE_NAME && name !== RUNTIME_ASSETS_CACHE && name !== FONTS_CACHE)) {
            console.log(`[AD6 ServiceWorker] Purging legacy cache: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Intelligent Fetch Handler with Fallbacks
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // In dev mode, or for non-GET requests, completely bypass service worker caching
  if (isDev || request.method !== 'GET') {
    return;
  }

  // Never intercept or cache API requests, Vite dev routes, node_modules, source files, or query-versioned bundles
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/healthz') ||
    url.pathname.startsWith('/@') ||
    url.pathname.includes('/node_modules/') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/components/') ||
    url.pathname.startsWith('/contexts/') ||
    url.pathname.startsWith('/services/') ||
    url.searchParams.has('v') ||
    url.searchParams.has('t')
  ) {
    return;
  }

  // A. Navigation Requests (HTML / Page Routes): Network-First with SPA Shell Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          
          const indexResponse = await caches.match('/index.html') || await caches.match('/');
          if (indexResponse) return indexResponse;

          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>AD6 HSE Offline</title></head><body style="background:#0F172A;color:white;font-family:sans-serif;padding:2rem;text-align:center;"><h2>Offline Field Mode Active</h2><p>AD6 HSE Platform is operating from cached storage.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // B. Google Fonts & CDN Assets: Cache-First Strategy
  if (CACHEABLE_ORIGINS.some(origin => request.url.startsWith(origin))) {
    event.respondWith(
      caches.open(FONTS_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (e) {
          return cachedResponse || new Response('', { status: 408 });
        }
      })
    );
    return;
  }

  // C. Local Static Production Assets (/assets/*): Stale-While-Revalidate
  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(RUNTIME_ASSETS_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: Network with Cache Fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).catch(() => new Response('', { status: 408 }));
    })
  );
});

// 4. Background Sync API Integration
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-hse-offline-queue') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'PROCESS_OFFLINE_SYNC' });
        });
      })
    );
  }
});
