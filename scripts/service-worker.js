/* Generated with a content-addressed manifest at build time. No student data. */
const PACKAGE = /* LAB_PACKAGE */;
const BASE = PACKAGE.base ?? '/';
const PREFIX = 'esp32-micropython-lab-app-' + (BASE === '/' ? '' : encodeURIComponent(BASE) + '-');
const CACHE = PREFIX + PACKAGE.build;
const MARKER = BASE + '.lab-offline-ready';
const urls = new Set(PACKAGE.files.map(file => file.url));
const origin = self.location.origin;
const key = path => new URL(path, origin).href;

async function report(type, detail = {}) {
  // A diagnostic failure must never make a verified installation fail.
  try {
    for (const client of await self.clients.matchAll({ type: 'window', includeUncontrolled: true })) {
      if (client.url && new URL(client.url).pathname.startsWith(BASE)) client.postMessage?.({ type, build: PACKAGE.build, version: PACKAGE.version, ...detail });
    }
  } catch { /* The page may already have closed. */ }
}
async function verifiedResponse(file) {
  let failure;
  for (let attempt = 0; attempt < 2; attempt++) {
    const url = new URL(key(file.url));
    // An explicit content key on retry avoids a stale intermediary response.
    // The bytes are still verified and stored under the canonical offline URL.
    if (attempt) url.searchParams.set('lab-sha256', file.sha256);
    try {
      const response = await fetch(url.href, { cache: 'reload', credentials: 'same-origin', redirect: 'error' });
      if (!response.ok || response.redirected || (response.url && response.url !== url.href)) throw Error('Datoteka nije dostupna (HTTP ' + response.status + ').');
      const bytes = await response.clone().arrayBuffer();
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
      if (hash !== file.sha256 || bytes.byteLength !== file.bytes) throw Error('Sadržaj ne odgovara očekivanoj verziji.');
      return response;
    } catch (error) { failure = error; }
  }
  throw Error(file.url + ': ' + String(failure?.message ?? failure));
}
let preparation;
async function prepare() {
  if (preparation) return preparation;
  preparation = preparePackage().finally(() => { preparation = undefined; });
  return preparation;
}
async function preparePackage() {
  // Verify every byte before making the package eligible for offline use.
  // Redirects to an authentication page or an HTML fallback never become code.
  const responses = new Array(PACKAGE.files.length);
  let next = 0, completed = 0, failure;
  await report('LAB_PACKAGE_PROGRESS', { completed, total: PACKAGE.files.length });
  // Bounded concurrency shortens a large package install on high-latency links.
  // Drain every request before reporting failure; no partial package is ready.
  await Promise.all(Array.from({ length: Math.min(4, PACKAGE.files.length) }, async () => {
    while (!failure && next < PACKAGE.files.length) {
      const index = next++, file = PACKAGE.files[index];
      try {
        responses[index] = [file.url, await verifiedResponse(file)];
        completed++;
        if (completed % 8 === 0 || completed === PACKAGE.files.length) await report('LAB_PACKAGE_PROGRESS', { completed, total: PACKAGE.files.length });
      } catch (error) { failure ??= error; }
    }
  }));
  if (failure) {
    await report('LAB_PACKAGE_ERROR', { message: failure.message });
    throw failure;
  }
  try {
    const cache = await caches.open(CACHE);
    for (const [path, response] of responses) await cache.put(key(path), response);
    await cache.put(key(MARKER), new Response(JSON.stringify({ build: PACKAGE.build }), { headers: { 'Content-Type': 'application/json' } }));
    await report('LAB_PACKAGE_READY');
  } catch (error) {
    await caches.delete(CACHE).catch(() => {});
    await report('LAB_PACKAGE_ERROR', { message: 'Paket nije spremljen u preglednik: ' + String(error?.message ?? error) });
    throw error;
  }
}
self.addEventListener('install', event => {
  event.waitUntil(prepare());
  // Updates wait. Only an explicit, safely saved one-tab request skips waiting.
});
self.addEventListener('activate', event => {
  // Previous packages are retained. They can still serve an older tab's
  // content-addressed URLs; no user project or IndexedDB store is touched.
  event.waitUntil(self.clients.claim());
});
async function status() {
  const cache = await caches.open(CACHE);
  const keys = new Set((await cache.keys()).map(request => new URL(request.url).pathname));
  const ready = keys.has(MARKER) && PACKAGE.files.every(file => keys.has(file.url));
  return { ready, build: PACKAGE.build, version: PACKAGE.version, count: PACKAGE.files.length, bytes: PACKAGE.files.reduce((sum, file) => sum + file.bytes, 0) };
}
self.addEventListener('message', event => {
  const reply = value => event.ports[0]?.postMessage(value);
  if (event.data?.type === 'LAB_STATUS') event.waitUntil(status().then(reply).catch(error => reply({ error: String(error) })));
  if (event.data?.type === 'LAB_REPAIR') event.waitUntil(prepare().then(status).then(reply).catch(error => reply({ error: 'Paket nije ponovno preuzet. ' + String(error) })));
  if (event.data?.type === 'LAB_ACTIVATE') event.waitUntil((async () => {
    const windows = (await self.clients.matchAll({ type: 'window', includeUncontrolled: true })).filter(client => !client.url || new URL(client.url).pathname.startsWith(BASE));
    if (windows.length > 1) { reply({ error: 'Zatvori druge kartice ovog laboratorija pa ponovi ažuriranje.' }); return; }
    reply({ accepted: true });
    await self.skipWaiting();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== origin || url.search) return;
  const path = url.pathname === BASE ? BASE + 'index.html' : url.pathname;
  const versioned = path.startsWith(BASE + 'app/') || path.startsWith(BASE + 'assets/');
  if (!urls.has(path) && !versioned) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(key(path));
    if (cached) return cached;
    if (versioned) {
      for (const name of await caches.keys()) {
        if (!name.startsWith(PREFIX) || name === CACHE) continue;
        const previous = await (await caches.open(name)).match(key(path));
        if (previous) return previous;
      }
    }
    return fetch(request);
  })());
});
