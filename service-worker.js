const CACHE = 'fit-tracker-cache-v4';
const ASSETS = ['./','./index.html','./script.js','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(net => {
    const copy = net.clone();
    caches.open(CACHE).then(c=>c.put(e.request, copy)).catch(()=>{});
    return net;
  }).catch(()=>r)));
});