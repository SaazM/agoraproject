import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '../lib/rateLimit.js'
import { renderAnswerKeyPage } from '../lib/answerKeyPage.js'
import { TESTS } from '../../src/data/tests.js'

// Admin-only answer key pages. These used to be static files under public/, which
// any student could open. The caller's own session is checked against
// profiles.role, so this route needs no service-role key.

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

  const rl = rateLimit(req, { maxRequests: 30, windowMs: 60_000 })
  if (rl.limited) {
    res.setHeader('Retry-After', String(rl.retryAfter))
    return json(res, 429, { error: 'Too many requests. Try again later.' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl) return json(res, 500, { error: 'Server is missing the Supabase URL (set VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL)' })
  if (!anonKey) return json(res, 500, { error: 'Server is missing the Supabase anon key (set VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)' })

  const authHeader = String(req.headers.authorization || '')
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
  if (!token || token.length < 10 || token.length > 8000) return json(res, 401, { error: 'Missing or invalid bearer token' })

  let payload = {}
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
  } catch {
    return json(res, 400, { error: 'Invalid JSON body' })
  }
  const testId = String(payload.test_id || payload.testId || '').trim()
  const test = TESTS.find((t) => t.id === testId)
  if (!test) return json(res, 400, { error: 'Unknown test_id' })

  // Acts as the caller: RLS lets them read only their own profile row.
  const asCaller = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  try {
    const { data: u, error: uErr } = await asCaller.auth.getUser(token)
    if (uErr || !u?.user?.id) return json(res, 401, { error: 'Invalid session' })
    const { data: prof, error: pErr } = await asCaller
      .from('profiles')
      .select('role')
      .eq('id', u.user.id)
      .maybeSingle()
    if (pErr || prof?.role !== 'admin') return json(res, 403, { error: 'Not authorized' })

    const html = renderAnswerKeyPage(test)
    if (!html) return json(res, 404, { error: 'No answer key for this test' })
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    return res.end(html)
  } catch (e) {
    console.error('[answer-key] Error:', e?.message)
    return json(res, 500, { error: 'Server error' })
  }
}
