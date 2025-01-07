const cacheName = "cache-v1";

// Install Event
self.addEventListener("install", (event) => {
    console.log("Install event triggered.");
    event.waitUntil(
        (async () => {
            const cache = await caches.open(cacheName);
            console.log("Caching assets during installation.");
            try {
                await cache.addAll([
                    "/",
                    "/index.html",
                    "/pages/contact.html",
                    "/js/scripts.js",
                    "/pages/menu.html",
                    "/pages/gallery.html",
                    "/pages/about.html",
                    "/manifest.json",
                    "/icons/manifest-icon-192.maskable.png",
                ]);
                console.log("All assets cached successfully.");
            } catch (error) {
                console.error("Failed to cache assets:", error);
            }
        })()
    );
    self.skipWaiting();
});


// Activate Event
self.addEventListener("activate", (event) => {
    console.log("Activate event triggered.");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== cacheName) {
                        console.log("[Service Worker] Deleting old cache:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
    console.log("Activation complete.");
});

// Fetch Event
self.addEventListener("fetch", (event) => {
    console.log(`Fetch event for: ${event.request.url}`);
    if (event.request.url.startsWith("http")) {
        event.respondWith(
            caches.open(cacheName).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        if (networkResponse.ok) {
                            console.log("Updating cache with fresh response:", event.request.url);
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                    return cachedResponse || fetchPromise;
                });
            })
        );
    }
});

// Push Event
self.addEventListener("push", (event) => {
    console.log("Push event received:", event);
    const data = event.data ? event.data.json() : {};
    const title = data.title || "New Notification";
    const options = {
        body: data.body || "You have a new message.",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-96x96.png",
    };
    event.waitUntil(self.registration.showNotification(title, options));
});
