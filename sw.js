// NEMY PWA Service Worker - Offline Support & Push Notifications
const CACHE_NAME = "nemy-v1.0.0";
const STATIC_CACHE = "nemy-static-v1";
const DYNAMIC_CACHE = "nemy-dynamic-v1";

const STATIC_FILES = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/offline.html",
];

// Install event - cache static files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting()),
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      return fetch(event.request)
        .then((fetchResponse) => {
          if (!fetchResponse || fetchResponse.status !== 200) {
            return fetchResponse;
          }

          const responseClone = fetchResponse.clone();
          caches
            .open(DYNAMIC_CACHE)
            .then((cache) => cache.put(event.request, responseClone));

          return fetchResponse;
        })
        .catch(() => {
          if (event.request.destination === "document") {
            return caches.match("/offline.html");
          }
        });
    }),
  );
});

// Push notification event
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Nueva notificación de NEMY",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Ver pedido",
        icon: "/icons/checkmark.png",
      },
      {
        action: "close",
        title: "Cerrar",
        icon: "/icons/xmark.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("NEMY Delivery", options));
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/orders"));
  }
});

// Background sync for offline orders
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();

    for (const request of requests) {
      if (request.url.includes("/api/orders") && request.method === "POST") {
        try {
          await fetch(request);
          await cache.delete(request);
        } catch (error) {
          console.log("Sync failed for:", request.url);
        }
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}
