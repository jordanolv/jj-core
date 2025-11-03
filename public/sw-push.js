// Service Worker pour gérer les notifications push
// Ce fichier sera importé dans le service worker principal

// Écouter les événements push
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received", event);

  let notificationData = {
    title: "Nouvelle notification",
    body: "Vous avez reçu une notification",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    url: "/",
  };

  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (error) {
    console.error("[Service Worker] Error parsing push data:", error);
  }

  const { title, body, icon, badge, url, data } = notificationData;

  const options = {
    body,
    icon: icon || "/icon-192x192.png",
    badge: badge || "/icon-192x192.png",
    vibrate: [200, 100, 200],
    data: {
      url: url || "/",
      dateOfArrival: Date.now(),
      ...data,
    },
    actions: [
      {
        action: "open",
        title: "Ouvrir",
      },
      {
        action: "close",
        title: "Fermer",
      },
    ],
    tag: "jj-notification",
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Écouter les clics sur les notifications
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification click received", event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  if (event.action === "close") {
    // L'utilisateur a cliqué sur "Fermer", ne rien faire
    return;
  }

  // Ouvrir l'URL dans une fenêtre/onglet
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Si une fenêtre est déjà ouverte, la mettre au premier plan
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Écouter la fermeture des notifications
self.addEventListener("notificationclose", (event) => {
  console.log("[Service Worker] Notification closed", event);
});

console.log("[Service Worker] Push handler loaded");
