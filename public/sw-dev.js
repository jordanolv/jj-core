// Service Worker simplifié pour le développement
// Gère uniquement les notifications push

self.addEventListener('install', (event) => {
  console.log('[SW Dev] Installation...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW Dev] Activation...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('[SW Dev] Push reçu:', event);

  let data = { title: 'Notification', body: 'Message par défaut' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('[SW Dev] Erreur parsing push data:', e);
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
  console.log('[SW Dev] Notification cliquée');
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
  console.log('[SW Dev] Notification fermée');
});

console.log('[SW Dev] Service Worker chargé');
