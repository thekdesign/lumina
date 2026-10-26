// Lumina service worker — 讓 app 可安裝、離線可用、更新自動流入。
// 策略同 selene / kairo：同源導覽走 network-first（有網拿最新、離線回退快取的 index）；
// 同源靜態資產（JS / CSS / 字體 / 圖示）走 stale-while-revalidate。所有內容都打包在 JS 裡，
// 開過一次之後整個 App 都能離線用。跨域請求不攔。
const VERSION = 'lumina-v1';
const APP_SHELL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.add(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const {request} = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          caches.open(VERSION).then((cache) => cache.put(APP_SHELL, res.clone()));
          return res;
        })
        .catch(() => caches.match(APP_SHELL).then((r) => r || Response.error())),
    );
    return;
  }

  event.respondWith(
    caches.open(VERSION).then((cache) =>
      cache.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    ),
  );
});
