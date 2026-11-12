// ArchiGuesser service worker. Makes the app installable and usable offline
// for what was already seen. Deliberately small:
//
//   pages      network first, the cached app as a fallback when offline
//   /assets/   cache first (file names change with their content)
//   /data/     network first: a new day must never be hidden by an old copy
//   pictures   cache first, only the most recent ones are kept
//
// The version and the list of files to precache are filled in at build time.

const VERSION = "588dc9739e6b";
const SHELL = `shell-${VERSION}`;
const DATA = "data-v1";
const PICTURES = "pictures-v1";
const PRECACHE = ["/","/site.webmanifest","/android-chrome-192x192.png","/assets/AboutPage-BV_suCl6.css","/assets/AboutPage-qDMZmSyk.js","/assets/AccountPage-aWfBqv6v.js","/assets/AccountPage-nAKGu7ys.css","/assets/ArcadePage-COCZImxl.js","/assets/ArcadePage-E687b8ou.css","/assets/ChallengesPage-CDOzPWP6.css","/assets/ChallengesPage-DdMRiINY.js","/assets/ReplayPage-CV7Aklzj.css","/assets/ReplayPage-DGFS_ka-.js","/assets/ScorePage-BDeXxNXA.css","/assets/ScorePage-CBkVexd3.js","/assets/_plugin-vue_export-helper-31Zl7oIz.js","/assets/index-CxR3MJDL.js","/assets/index-sAMjqEBV.css","/assets/recommendations-BgIX9gjC.js","/assets/vue-vncJrRcx.js"];
const MAX_PICTURES = 120;
const NETWORK_TIMEOUT = 4000;
// Our files are the same for everyone: a Vary header (some servers send
// "Vary: Origin") must not hide a cached copy.
const SAME_FILE = { ignoreVary: true };

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith("shell-") && name !== SHELL)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const put = async (cacheName, request, response) => {
  if (response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }

  return response;
};

// Oldest entries first: Cache.keys() keeps the insertion order
const trim = async (cacheName, max) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(
    keys
      .slice(0, Math.max(0, keys.length - max))
      .map((key) => cache.delete(key)),
  );
};

const cacheFirst = async (cacheName, request) => {
  const cached = await caches.match(request, SAME_FILE);

  return cached || put(cacheName, request, await fetch(request));
};

const networkFirst = async (cacheName, request, fallback = request) => {
  const fromNetwork = fetch(request).then((response) =>
    cacheName ? put(cacheName, request, response) : response,
  );
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), NETWORK_TIMEOUT),
  );
  try {
    return await Promise.race([fromNetwork, timeout]);
  } catch (error) {
    const cached = await caches.match(fallback, SAME_FILE);
    if (cached) {
      return cached;
    }
    // nothing cached: a slow network is still better than nothing
    return fromNetwork.catch(() => {
      throw error;
    });
  }
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    // every page is the same app: "/" stands in for any of them offline
    event.respondWith(networkFirst(null, request, "/"));
  } else if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(SHELL, request));
  } else if (url.pathname.startsWith("/data/")) {
    event.respondWith(networkFirst(DATA, request));
  } else if (/^\/(\d+|categories|images)\//.test(url.pathname)) {
    event.respondWith(
      cacheFirst(PICTURES, request).then((response) => {
        event.waitUntil(trim(PICTURES, MAX_PICTURES));
        return response;
      }),
    );
  }
});
