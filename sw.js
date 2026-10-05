const CACHE_NAME = 'cogniflow-cache-v4.1.0';
const ASSETS = [ 
    '/', 
    'index.html', 
    'app.js', 
    'materials.js',
    'CogniFlow.svg',
    'manifest.json',
    'test_deret.json',
    'test_silogisme.json',
    'latihan_deret.json',
    'latihan_silogisme.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const resClone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
