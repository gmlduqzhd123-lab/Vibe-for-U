// 뚝딱 바이브 공작소 오프라인 캐시 — 같은 주소의 다른 엽쌤 앱과 캐시 저장소를 같이 쓰므로 내 접두어 캐시만 지운다
// 아래 캐시 이름 꼬리와 CORE 목록은 빌드 때 scripts/precache.mjs 가 dist 내용의 해시와 파일 목록으로 채운다.
const CACHE_PREFIX = 'vibe-for-u-v';
const CACHE = CACHE_PREFIX + '__CACHE_VERSION__';
const CORE = __PRECACHE__; // eslint-disable-line no-undef -- 빌드 때 목록으로 바뀐다
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; })
    .catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
