import { createClient } from '@supabase/supabase-js'
import { getAnswerKeyBySection } from '../../src/data/answerKeys.js'
import { calcWeakTopicsForTest, scoreAttemptFromKey } from '../../src/data/examData.js'
import { rateLimit } from '../lib/rateLimit.js'

function json(res, status, body) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.statusCode = status
  res.end(JSON.stringify(body))
}

function getKeyForTest(testId) {
  return getAnswerKeyBySection(testId) || null
}

function computeScoresAndWeakTopics(attempt) {
  const keyBySection = getKeyForTest(attempt?.test_id)
  const answers = attempt?.answers || {}
  if (!keyBySection || !answers || typeof answers !== 'object') return null
  try {
    const scores = scoreAttemptFromKey(attempt?.test_id, answers, keyBySection)
    const weakTopics = calcWeakTopicsForTest(attempt?.test_id, answers, keyBySection)
    return { scores, weakTopics }
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  // Rate limit: 2 requests per minute (bulk operation)
  const rl = rateLimit(req, { maxRequests: 2, windowMs: 60_000 })
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

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  try {
    const { data: userData, error: userErr } = await admin.auth.getUser(token)
    if (userErr || !userData?.user?.id) return json(res, 401, { error: 'Invalid session' })
    const requesterId = userData.user.id

    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('id,email,role')
      .eq('id', requesterId)
      .maybeSingle()

    if (profileErr || !profile) return json(res, 403, { error: 'Not authorized' })

    if (profile.role !== 'admin') return json(res, 403, { error: 'Not authorized' })

    const { data: attempts, error: attemptsErr } = await admin
      .from('test_attempts')
      .select('id,test_id,answers,scores,weak_topics')
      .not('completed_at', 'is', null)
      .limit(5000)

    if (attemptsErr) return json(res, 500, { error: attemptsErr.message || 'Failed to load attempts' })

    let scanned = 0
    let updated = 0
    let errors = 0

    for (const attempt of attempts || []) {
      if (!attempt?.answers || !Object.keys(attempt.answers || {}).length) continue
      scanned += 1
      const next = computeScoresAndWeakTopics(attempt)
      if (!next) continue

      const scoresChanged = JSON.stringify(attempt.scores || {}) !== JSON.stringify(next.scores || {})
      const weakChanged = JSON.stringify(attempt.weak_topics || []) !== JSON.stringify(next.weakTopics || [])
      if (!scoresChanged && !weakChanged) continue

      const { error: updateErr } = await admin
        .from('test_attempts')
        .update({ scores: next.scores, weak_topics: next.weakTopics })
        .eq('id', attempt.id)

      if (updateErr) errors += 1
      else updated += 1
    }

    return json(res, 200, { ok: true, scanned, updated, errors })
  } catch (error) {
    console.error('[regrade-tests] Error:', error?.message)
    return json(res, 500, { error: 'Server error' })
  }
}
