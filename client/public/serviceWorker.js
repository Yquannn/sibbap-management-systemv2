/* eslint-disable no-restricted-globals */

const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = ["/", "/index.html", "/logo192.png", "/manifest.json"];

// Install event - Cache files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate worker immediately
});

// Fetch event - Serve cached files
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Activate event - Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim(); // Take control of open pages
});

// Push event listener for push notifications
self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.title || "New Notification";
  const options = {
    body: data.body || "You have a new message.",
    icon: data.icon || "/logo192.png",
    badge: data.badge || "/logo192.png",
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Optional: Handle notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow("/");
    })
  );
});

// Register function for React
const register = () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js") // Ensure the filename matches your service worker file
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration);
        })
        .catch((error) => {
          console.log("❌ Service Worker registration failed:", error);
        });
    });
  }
};

// Unregister function
const unregister = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
};


self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = data.notification;
    
    event.waitUntil(
      self.registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icon.png',
        badge: options.badge || '/badge.png',
        vibrate: options.vibrate || [100, 50, 100],
        data: options.data || {}
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then(function(clientList) {
      const notificationData = event.notification.data;
      const url = notificationData.url || '/notifications';
      
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});