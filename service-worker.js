// Service Worker para Organizate PWA
const CACHE_NAME = 'organizate-v3'; // 🔧 Calendarios corregidos con días exactos
const urlsToCache = [
    './',
    './index.html',
    './01_enero/enero.html',
    './02_febrero/febrero.html',
    './03_marzo/marzo.html',
    './04_abril/abril.html',
    './05_mayo/mayo.html',
    './06_junio/junio.html',
    './07_julio/julio.html',
    './08_agosto/agosto.html',
    './09_septiembre/septiembre.html',
    './10_octubre/octubre.html',
    './11_noviembre/noviembre.html',
    './12_diciembre/diciembre.html',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// Instalación: cachear archivos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Activación: limpiar cachés antiguos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch: estrategia cache-first (offline first)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - retornar respuesta cacheada
                if (response) {
                    return response;
                }

                // Clone request porque solo se puede usar una vez
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Verificar respuesta válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone response porque solo se puede usar una vez
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch(() => {
                    // Si falla el fetch y no hay cache, mostrar página offline mínima
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});
