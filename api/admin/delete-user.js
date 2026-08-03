import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '../lib/rateLimit.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function json(res, status, body) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.statusCode = status
  res.end(JSON.stringify(body))
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  // Rate limit: 5 requests per minute per IP
  const rl = rateLimit(req, { maxRequests: 5, windowMs: 60_000 })
  if (rl.limited) {
    res.setHeader('Retry-After', String(rl.retryAfter))
    return json(res, 429, { error: 'Too many requests. Try again later.' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return json(res, 500, { error: 'Missing server configuration' })

  const authHeader = String(req.headers.authorization || '')
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
  if (!token || token.length < 10 || token.length > 8000) return json(res, 401, { error: 'Missing or invalid bearer token' })

  let payload = {}
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
  } catch {
    return json(res, 400, { error: 'Invalid JSON body' })
  }

  const targetUserId = String(payload.user_id || payload.userId || '').trim()
  if (!targetUserId || !UUID_RE.test(targetUserId)) {
    return json(res, 400, { error: 'Missing or invalid user_id (must be a valid UUID)' })
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  try {
    const { data: u, error: uErr } = await admin.auth.getUser(token)
    if (uErr || !u?.user?.id) return json(res, 401, { error: 'Invalid session' })
    const requesterId = u.user.id

    const { data: prof, error: pErr } = await admin
      .from('profiles')
      .select('id,email,role')
      .eq('id', requesterId)
      .maybeSingle()
    if (pErr || !prof) return json(res, 403, { error: 'Not authorized' })

    if (prof.role !== 'admin') return json(res, 403, { error: 'Not authorized' })

    if (targetUserId === requesterId) {
      return json(res, 400, { error: 'Cannot delete your own admin account' })
    }

    const { error: delErr } = await admin.auth.admin.deleteUser(targetUserId)
    if (delErr) return json(res, 400, { error: delErr.message || 'Delete failed' })

    return json(res, 200, { ok: true })
  } catch (e) {
    console.error('[delete-user] Error:', e?.message)
    return json(res, 500, { error: 'Server error' })
  }
}
