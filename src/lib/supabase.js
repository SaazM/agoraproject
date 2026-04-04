import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shouldRetryResponse(res, method) {
  if (!res) return false
  const m = String(method || 'GET').toUpperCase()
  if (m !== 'GET' && m !== 'HEAD') return false
  return [408, 425, 429, 500, 502, 503, 504].includes(res.status)
}

async function fetchWithRetry(input, init) {
  const maxAttempts = 3
  let lastErr = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const req = new Request(input, init)
      const res = await fetch(req)
      if (!shouldRetryResponse(res, req.method) || attempt === maxAttempts) return res
      const backoff = Math.round((250 * Math.pow(2, attempt - 1)) + (Math.random() * 200))
      await sleep(backoff)
      continue
    } catch (e) {
      lastErr = e
      const method = (init?.method || (input instanceof Request ? input.method : 'GET')) || 'GET'
      const m = String(method).toUpperCase()
      if ((m !== 'GET' && m !== 'HEAD') || attempt === maxAttempts) throw e
      const backoff = Math.round((250 * Math.pow(2, attempt - 1)) + (Math.random() * 200))
      await sleep(backoff)
    }
  }

  throw lastErr || new Error('Network error')
}

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: { fetch: fetchWithRetry },
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null
