/* Service worker do RD Studio do Sono.
   Guarda o app no celular para abrir rápido. Os dados (lançamentos) sempre vêm da planilha, pela internet.
   Sempre que publicar uma versão nova do app, troque o número abaixo (v1 → v2 → v3...). */
const VERSAO = 'rd-studio-v8';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // planilha: sempre pela internet
  // Página: tenta a internet primeiro (pega a versão nova); sem internet, usa a cópia guardada
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((r) => { const copia = r.clone(); caches.open(VERSAO).then((c) => c.put('./index.html', copia)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
