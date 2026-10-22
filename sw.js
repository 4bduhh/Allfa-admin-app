const CACHE = "allfa-admin-v3";
const SHELL = ["./","index.html","admin.css","admin.js","admin-manifest.json","admin-icon-192.png","admin-icon-512.png","allfa-logo.png","admin-favicon.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith("http")) return;
  if (req.url.includes(".supabase.co")) return; // never cache cloud data

  // Pages: network first (always fresh when online), cache when offline
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match("./")))
    );
    return;
  }

  // Same-site files (html/css/js/images): network first, so every push shows up right away.
  // The cache is only the offline fallback.
  if (new URL(req.url).origin === self.location.origin) {
    e.respondWith(
      fetch(req, { cache: "no-cache" }).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Third-party (fonts, icon library): cache first, refresh in background

  e.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req).then(res => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});