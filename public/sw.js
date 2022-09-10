const staticCacheName = 'site-static-v7'
const dynamicCacheName = 'site-dynamic-v11'
const assets = [
  '/public/', // home page
  '/public/index.html',
  '/public/pages/fallback.html',
  '/public/js/app.js',
  '/public/js/main.js',
  '/public/js/materialize.min.js',
  '/public/css/reset.css',
  '/public/css/style.css',
  '/public/css/materialize.min.css',
  '/public/img/dish.png', // TODO change image
  'https://fonts.googleapis.com/icon?family=Material+Icons'
]

// cache size limits
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size)) 
      }
    })
  })
}

// install the service worker
self.addEventListener('install', evt => {
  evt.waitUntil( 
    caches.open(staticCacheName).then(cache => {
      console.log('caching shell assets');
      cache.addAll(assets)
    })
  )
})

// activate event
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))
      )
    })
  )
})

// fetch event // TODO uncomment when firebase has been initialized
// self.addEventListener('fetch', evt => {
//   if(evt.request.url.indexOf('firestore.googleapis.com') === -1) {
//     evt.respondWith(
//       caches.match(evt.request).then(cacheRes => {
//         return cacheRes || fetch(evt.request).then(async fetchRes => {
//           // console.log('inside') // never makes it here
//           const cache = await caches.open(dynamicCacheName)
//           cache.put(evt.request.url, fetchRes.clone())
//           limitCacheSize(dynamicCacheName, 15)
//           return fetchRes
//         })
//       }).catch(() => {
//         if(evt.request.url.indexOf('.html') > -1){ // if the pages isn't an html
//           return caches.match('/pages/fallback.html')
//         }
//       })
//     )
//   }
// })