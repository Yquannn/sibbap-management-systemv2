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

// ✅ Register function for React
const register = () => {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("/serviceWorker.js") // Match the actual filename
                .then((registration) => {
                    console.log("✅ Service Worker registered:", registration);
                })
                .catch((error) => {
                    console.log("❌ Service Worker registration failed:", error);
                });
        });
    }
};

// ✅ Unregister function
const unregister = () => {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.unregister();
        });
    }
};

