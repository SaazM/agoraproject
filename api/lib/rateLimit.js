// Simple in-memory rate limiter for serverless functions.
// Uses a sliding window per IP. State resets on cold starts, which is acceptable
// for Vercel serverless — it still blocks rapid bursts within a single instance.

const buckets = new Map()

const CLEANUP_INTERVAL = 60_000
let lastCleanup = Date.now()

function cleanup(windowMs) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > windowMs * 2) buckets.delete(key)
  }
}

export function rateLimit(req, { maxRequests = 10, windowMs = 60_000 } = {}) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown'

  const now = Date.now()
  cleanup(windowMs)

  // Key on the pathname only — including the query string would give
  // ?x=1, ?x=2, … each their own fresh bucket, defeating the limit.
  const path = String(req.url || '/').split('?')[0]
  const key = `${path}:${ip}`
  let entry = buckets.get(key)

  if (!entry || now - entry.windowStart > windowMs) {
    entry = { windowStart: now, count: 0 }
    buckets.set(key, entry)
  }

  entry.count += 1

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000)
    return { limited: true, retryAfter }
  }

  return { limited: false }
}
