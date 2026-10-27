// Nova keeps its own files on the device so it opens fast and works as an installed app.
// Answers and pictures always come fresh from the internet.
const CACHE = "nova-v27";
const FILES = ["./", "index.html", "config.js", "manifest.webmanifest", "wp-space.jpg", "wp-space-light.jpg", "wp-space-wide.jpg", "wp-space-light-wide.jpg", "wp-sky.jpg","wp-sky-wide.jpg",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/favicon.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // Gemini and pictures: straight to the internet
  // the app page itself: newest version first, saved copy when offline
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});

// tapping a reminder notification opens Nova (or brings it to the front)
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    const open = list.find((c) => c.url.includes("/app/"));
    return open ? open.focus() : self.clients.openWindow("./");
  }));
});
