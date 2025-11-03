// Service Worker personnalisé qui étend next-pwa avec support des notifications push
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { RangeRequestsPlugin } from 'workbox-range-requests';

// Forcer l'activation immédiate
clientsClaim();
self.skipWaiting();

// Nettoyer les anciens caches
cleanupOutdatedCaches();

// Pré-cacher les assets - __WB_MANIFEST est injecté par Workbox
// TEMPORAIREMENT DÉSACTIVÉ pour déboguer le problème d'installation
// precacheAndRoute(self.__WB_MANIFEST || []);
console.log('[SW] Precaching désactivé, manifest size:', (self.__WB_MANIFEST || []).length);

// === ROUTES DE CACHE (reprises de next.config.mjs) ===

// Polices Google
registerRoute(
  /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 4,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      }),
    ],
  }),
  'GET'
);

// Fichiers de polices
registerRoute(
  /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
  new StaleWhileRevalidate({
    cacheName: 'static-font-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 4,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  }),
  'GET'
);

// Images
registerRoute(
  /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
  new StaleWhileRevalidate({
    cacheName: 'static-image-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
  'GET'
);

// Next.js images optimisées
registerRoute(
  /\/_next\/image\?url=.+$/i,
  new StaleWhileRevalidate({
    cacheName: 'next-image',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
  'GET'
);

// Audio
registerRoute(
  /\.(?:mp3|wav|ogg)$/i,
  new CacheFirst({
    cacheName: 'static-audio-assets',
    plugins: [
      new RangeRequestsPlugin(),
      new ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
  'GET'
);

// Vidéo
registerRoute(
  /\.(?:mp4|webm)$/i,
  new CacheFirst({
    cacheName: 'static-video-assets',
    plugins: [
      new RangeRequestsPlugin(),
      new ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
  'GET'
);

// JavaScript
registerRoute(
  /\.(?:js)$/i,
  new StaleWhileRevalidate({
    cacheName: 'static-js-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
  'GET'
);

// CSS
registerRoute(
  /\.(?:css|less)$/i,
  new StaleWhileRevalidate({
    cacheName: 'static-style-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
  'GET'
);

// Next.js data
registerRoute(
  /\/_next\/data\/.+\/.+\.json$/i,
  new StaleWhileRevalidate({
    cacheName: 'next-data',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
  'GET'
);

// API routes
registerRoute(
  /\/api\/.*$/i,
  new NetworkFirst({
    cacheName: 'apis',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 16,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
  'GET'
);

// Page de démarrage
registerRoute(
  '/',
  new NetworkFirst({
    cacheName: 'start-url',
    plugins: [
      {
        cacheWillUpdate: async ({ request, response, event, state }) => {
          if (response && response.type === 'opaqueredirect') {
            return new Response(response.body, {
              status: 200,
              statusText: 'OK',
              headers: response.headers,
            });
          }
          return response;
        },
      },
    ],
  }),
  'GET'
);

// Tout le reste
registerRoute(
  /.*/i,
  new NetworkFirst({
    cacheName: 'others',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
  'GET'
);

// === GESTION DES NOTIFICATIONS PUSH ===

self.addEventListener('push', (event) => {
  console.log('[SW] Push reçu:', event);

  let data = { title: 'Notification', body: 'Message par défaut' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('[SW] Erreur parsing push data:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    data: data.data || {},
    tag: data.tag || 'default',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification cliquée');
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si une fenêtre est déjà ouverte, la focus
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification fermée');
});

console.log('[SW] Service Worker chargé avec support push notifications');
