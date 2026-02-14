// v2 — install prompt support
const CACHE_NAME = "qr-generator";
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
    ).then(() => self.clients.claim())
  );
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

  // Only handle same-origin GET requests
  if (url.origin !== self.location.origin || event.request.method !== "GET") return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        const cachedForCompare = cached?.clone();

        const revalidate = fetch(event.request)
          .then(async (response) => {
            if (!response.ok) return response;

            // For text assets, detect content changes before updating cache
            if (cachedForCompare && isTextAsset(url.pathname)) {
              const [freshText, oldText] = await Promise.all([
                response.clone().text(),
                cachedForCompare.text()
              ]);
              if (freshText !== oldText) {
                await cache.put(event.request, response.clone());
                notifyClients();
              }
              return response;
            }

            // Binary assets or first-time cache: just update
            await cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => null);

        if (cached) {
          // Stale: return cached immediately, revalidate in background
          event.waitUntil(revalidate);
          return cached;
        }

        // No cache — wait for network
        return revalidate.then((response) => {
          if (response) return response;
          // Offline fallback for navigation
          if (event.request.mode === "navigate") {
            return cache.match("/qr/index.html");
          }
          return new Response("Offline", { status: 503 });
        });
      })
    )
  );
});

function isTextAsset(pathname) {
  return /\.(html|css|js|json)$/.test(pathname) || pathname.endsWith("/");
}

async function notifyClients() {
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((client) => client.postMessage({ type: "UPDATE_AVAILABLE" }));
}

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
