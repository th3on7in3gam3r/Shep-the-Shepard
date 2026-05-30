const CACHE = "shepherd-v2";
const SHELL_ROUTES = ["/", "/chat", "/bible", "/devotions", "/journal", "/profile"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL_ROUTES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isDailyPack = url.pathname === "/api/daily-pack";

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (
            response.ok &&
            event.request.url.startsWith(self.location.origin) &&
            (isDailyPack || url.pathname.startsWith("/api/bible"))
          ) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, clone));
          } else if (
            response.ok &&
            event.request.url.startsWith(self.location.origin)
          ) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      if (isDailyPack && cached) {
        return cached;
      }

      return cached || fetchPromise;
    }),
  );
});
