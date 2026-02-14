const CACHE_VERSION = 1;
const CACHE_NAME = "qr-generator-v" + CACHE_VERSION;
const SHARE_CACHE = "share-data";

const APP_SHELL = [
  "/qr/",
  "/qr/index.html",
  "/qr/style.css",
  "/qr/script.js",
  "/qr/ce.js",
  "/qr/qrcode.js",
  "/qr/manifest.json",
  "/qr/icons/icon-192.png",
  "/qr/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== SHARE_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Share target POST handler
  if (url.pathname === "/qr/share-target" && event.request.method === "POST") {
    event.respondWith(handleShareTarget(event.request));
    return;
  }

  // Shared data retrieval endpoint
  if (url.pathname === "/qr/get-shared-data") {
    event.respondWith(handleGetSharedData());
    return;
  }

  // Cache-first, network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok && url.origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/qr/index.html");
          }
        });
    })
  );
});

async function handleShareTarget(request) {
  const formData = await request.formData();
  const data = {
    title: formData.get("title") || "",
    text: formData.get("text") || "",
    url: formData.get("url") || ""
  };

  const files = formData.getAll("files");
  for (const file of files) {
    if (file instanceof File && file.size > 0) {
      data.fileContent = await file.text();
      data.fileName = file.name;
      data.fileType = file.type;
    }
  }

  const cache = await caches.open(SHARE_CACHE);
  await cache.put("/shared-data", new Response(JSON.stringify(data)));

  return Response.redirect("/qr/?shared=1", 303);
}

async function handleGetSharedData() {
  try {
    const cache = await caches.open(SHARE_CACHE);
    const response = await cache.match("/shared-data");
    if (response) {
      const data = await response.text();
      await cache.delete("/shared-data");
      return new Response(data, {
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (e) {
    // ignore
  }
  return new Response("null", {
    headers: { "Content-Type": "application/json" }
  });
}
