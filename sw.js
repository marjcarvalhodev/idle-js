const CACHE = "idle-rpg-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.webmanifest",
  "./src/main.js",
  "./src/game.js",
  "./src/save.js",
  "./src/render.js",
  "./src/input.js",
  "./content/enemies.js",
  "./content/drops.js",
  "./content/items.js",
  "./content/mechanics.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
