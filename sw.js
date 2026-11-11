const CACHE = 'serbiz-v3.0.0';
const PRECACHE = ['./', './index.html', './manifest.json'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) return;
  e.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
    if (!res || res.status !== 200 || res.type !== 'basic') return res;
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy));
    return res;
  }).catch(() => req.mode === 'navigate' ? caches.match('./index.html') : new Response('', { status: 503 }))));
});
