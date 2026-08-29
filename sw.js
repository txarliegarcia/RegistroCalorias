/* Service worker: la app funciona sin cobertura. Los datos se sincronizan aparte. */
const CACHE = "comidas-2026.08.27-4";
const ARCHIVOS = ["./", "./index.html", "./manifest.webmanifest",
  "./favicon.ico", "./favicon-32.png", "./favicon-16.png", "./apple-touch-icon.png",
  "./icono-192.png", "./icono-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  const url = new URL(e.request.url);
  // las llamadas al backend nunca se cachean
  if (e.request.method !== "GET" || url.hostname.indexOf("script.google.com") >= 0) return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      const copia = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
      return res;
    }).catch(function () { return caches.match(e.request); })
  );
});
