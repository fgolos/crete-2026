'use strict';

const CACHE_VERSION = 'crete-2026-v9';
const SHELL_URL = new URL('./index.html', self.registration.scope).href;
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './parking-ui.css',
  './itinerary-data.js',
  './itinerary-transport.js',
  './parking-data.js',
  './parking-ui.js',
  './stories-data.js',
  './app.js',
  './manifest.webmanifest',
  './icon.svg'
];
const OPTIONAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=PT+Serif:wght@700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css',
  'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Vai_R01.jpg?width=1600'
];
const STATIC_HOSTS = new Set([
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com',
  'commons.wikimedia.org',
  'upload.wikimedia.org'
]);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(CORE_ASSETS);
    await Promise.allSettled(OPTIONAL_ASSETS.map(async asset => {
      const response = await fetch(asset,{ mode:'no-cors' });
      if (response.ok || response.type === 'opaque') await cache.put(asset,response);
    }));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name !== CACHE_VERSION).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(SHELL_URL,response.clone());
    return response;
  } catch {
    return await cache.match(SHELL_URL) || Response.error();
  }
}

async function networkFirstAsset(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request,response.clone());
    return response;
  } catch {
    return await cache.match(request,{ ignoreSearch:true }) || Response.error();
  }
}

async function cacheFirstAsset(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request,{ ignoreSearch:true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') await cache.put(request,response.clone());
  return response;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
  } else if (url.origin === self.location.origin) {
    event.respondWith(networkFirstAsset(request));
  } else if (STATIC_HOSTS.has(url.hostname)) {
    event.respondWith(cacheFirstAsset(request));
  }
});
