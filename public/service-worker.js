// <<< 変更点: キャッシュのバージョンを更新 >>>
const CACHE_NAME = 'ivy-task-cache-v17-memo-cropper';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/icon-192.png',
  '/icon-512.png',
  '/trash-icon.png',
  '/happy-hacking.png',
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js',
  // <<< 変更点: 壁紙画像をすべてキャッシュ対象に追加 >>>
  '/images/wallpaper-pastel.jpg',
  '/images/wallpaper-okinawa.jpg',
  '/images/wallpaper-jungle.jpg',
  '/images/wallpaper-dolphins.jpg',
  '/images/wallpaper-sunny.jpg',
  '/images/wallpaper-happy-hacking.jpg',
  '/images/wallpaper-skycastle.jpg'
  , '/images/wallpaper-lunar.jpg'
];

// 1. インストール処理
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and adding new files');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. 新しいバージョンが有効になったら、古いキャッシュを削除
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. ファイルのリクエスト時に、キャッシュから返す
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにあればそれを返し、なければネットワークから取得する
        return response || fetch(event.request);
      })
  );
});
