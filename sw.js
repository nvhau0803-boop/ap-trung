self.addEventListener('install', (e) => {
  console.log('[Service Worker] Installed');
});

self.addEventListener('fetch', (e) => {
  // Cho phép app tải các tài nguyên bình thường
  e.respondWith(fetch(e.request));
});