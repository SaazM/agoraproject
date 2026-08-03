/* Simple SW cache for The Agora Project (Vercel + Vite)
   - Navigation: network-first, fallback to cached index.html
   - Static assets + PDFs: cache-first
   This improves reliability on spotty iPhone/Wi‑Fi after the first load.
*/

// Bump this to force clients to refresh caches after deploys.
const VERSION = 'v6'
const STATIC_CACHE = `agora-static-${VERSION}`
const RUNTIME_CACHE = `agora-runtime-${VERSION}`

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
]

function isCacheableRequest(req) {
  if (req.method !== 'GET') return false
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return false
  return true
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE)
    await cache.addAll(CORE_ASSETS)
    self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => {
      if (k.startsWith('agora-') && k !== STATIC_CACHE && k !== RUNTIME_CACHE) return caches.delete(k)
      return null
    }))
    self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (!isCacheableRequest(req)) return

  const url = new URL(req.url)
  // Never intercept the service worker script itself (allows updates to always work).
  if (url.pathname === '/sw.js') return
  const isNav = req.mode === 'navigate'
  const isPdf = url.pathname.endsWith('.pdf')
  const isStaticAsset = /\.(css|js|mjs|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname)

  if (isNav) {
    event.respondWith((async () => {
      try {
        // Network-only for navigations (prevents stale HTML pointing to missing hashed assets).
        return await fetch(req)
      } catch {
        // Offline fallback: app shell (best-effort).
        const shell = await caches.match('/index.html')
        return shell || Response.error()
      }
    })())
    return
  }

  if (isPdf) {
    event.respondWith((async () => {
      const cached = await caches.match(req)
      if (cached) return cached
      try {
        const fresh = await fetch(req)
        const cache = await caches.open(RUNTIME_CACHE)
        cache.put(req, fresh.clone())
        return fresh
      } catch {
        return cached || Response.error()
      }
    })())
    return
  }

  if (isStaticAsset) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req)
        const cache = await caches.open(RUNTIME_CACHE)
        cache.put(req, fresh.clone())
        return fresh
      } catch {
        const cached = await caches.match(req)
        return cached || Response.error()
      }
    })())
    return
  }
})
