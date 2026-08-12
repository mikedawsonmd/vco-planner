/* VCO Planner service worker
   Strategy:
   - index.html: network first, cache fallback → schedule edits you push
     reach people quickly, but the app still opens with zero signal.
   - fonts and other assets: cache first → instant repeat loads.
   Bump VERSION whenever you change the schedule or the app so old
   caches are cleared. */

const VERSION = 'vco-planner-v10';
const SHELL = ['./', './index.html', './manifest.webmanifest', './images/map.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const isNavigation = req.mode === 'navigate' || (req.destination === 'document');

  if (isNavigation) {
    // Network first, bypassing the browser's own HTTP cache too — schedule
    // edits should never wait on a stale disk-cached copy. Cache fallback
    // only kicks in offline.
    e.respondWith(
      fetch(req, { cache: 'reload' })
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match('./index.html')))
    );
    return;
  }

  // Fonts and everything else: cache first, then network, then give up quietly.
  // Google's font CSS (fonts.googleapis.com) and the icon/font files it pulls
  // in (fonts.gstatic.com) are fetched cross-origin in no-cors mode, so they
  // come back as opaque responses (type 'opaque', status 0). We cache those
  // too — otherwise the Material Symbols icons vanish offline.
  const url = new URL(req.url);
  const isGoogleFont =
    url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const cacheable =
          (res.status === 200 && (res.type === 'basic' || res.type === 'cors')) ||
          (isGoogleFont && res.type === 'opaque');
        if (res && cacheable) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
