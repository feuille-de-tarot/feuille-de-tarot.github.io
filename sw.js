const CACHE = 'tarot-v3';
// La page n'est pas passée par ce fichier à la première visite : on la garde dès l'installation.
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(['.', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'])).then(() => self.skipWaiting())
));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(cles => Promise.all(cles.filter(c => c !== CACHE).map(c => caches.delete(c)))).then(() => self.clients.claim())
));
// On sert la copie gardée pour marcher sans réseau, et on la met à jour en arrière-plan.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const copie = await c.match(e.request);
    const reseau = fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; });
    if (copie) { reseau.catch(() => {}); return copie; }
    return reseau;
  }));
});
