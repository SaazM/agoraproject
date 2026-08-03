import { supabase } from './supabase.js'
import { sanitizeNote, isValidUUID, isValidTestId } from './validate.js'

const LS_MISTAKES_PREFIX = 'agora_mistakes_v1:'
const LS_REVIEW_PREFIX = 'agora_review_v1:'

function keyFor(userId, prefix) {
  return `${prefix}${userId || 'anon'}`
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

export function mistakeItemKey(m) {
  return `${m.test_id}:${m.section}:${m.q_num}`
}

export function listLocalMistakes(userId) {
  return readJson(keyFor(userId, LS_MISTAKES_PREFIX), [])
}

export function listLocalReviewItems(userId) {
  return readJson(keyFor(userId, LS_REVIEW_PREFIX), {})
}

export function upsertLocalMistakes(userId, newMistakes) {
  const existing = listLocalMistakes(userId)
  const by = {}
  for (const m of existing) by[m.id] = m
  for (const m of newMistakes || []) by[m.id] = m
  const next = Object.values(by).sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
  writeJson(keyFor(userId, LS_MISTAKES_PREFIX), next)
  return next
}

export function upsertLocalReviewItems(userId, patch) {
  const existing = listLocalReviewItems(userId)
  const next = { ...(existing || {}), ...(patch || {}) }
  writeJson(keyFor(userId, LS_REVIEW_PREFIX), next)
  return next
}

export async function saveMistakes(userId, mistakes) {
  if (!userId) return { source: 'none', items: [] }
  const nowIso = new Date().toISOString()
  const normalized = (mistakes || []).slice(0, 500).map((m) => ({
    id: m.id || crypto.randomUUID(),
    user_id: userId,
    test_id: String(m.test_id || 'pre_test').slice(0, 50),
    attempt_id: m.attempt_id || null,
    section: String(m.section || '').slice(0, 50),
    q_num: Math.max(0, Math.min(999, Math.round(Number(m.q_num || 0)))),
    given: String(m.given ?? '').slice(0, 100),
    correct: String(m.correct ?? '').slice(0, 100),
    chapter_id: m.chapter_id ? String(m.chapter_id).slice(0, 60) : null,
    note: m.note != null ? sanitizeNote(m.note) : null,
    created_at: m.created_at || nowIso,
    updated_at: nowIso,
  }))

  // Try Supabase first, fall back to localStorage if the table isn't migrated yet.
  if (supabase && userId) {
    try {
      const ins = await supabase.from('mistakes').insert(normalized)
      if (!ins.error) return { source: 'supabase', items: normalized }
    } catch {}
  }

  const items = upsertLocalMistakes(userId, normalized)
  return { source: 'local', items }
}

export async function updateMistakeNote(userId, mistakeId, note) {
  if (!userId || !mistakeId) return { source: 'none' }
  const cleanNote = sanitizeNote(note)
  const nowIso = new Date().toISOString()
  if (supabase && userId) {
    try {
      const up = await supabase.from('mistakes').update({ note: cleanNote, updated_at: nowIso }).eq('id', mistakeId)
      if (!up.error) return { source: 'supabase' }
    } catch {}
  }
  const existing = listLocalMistakes(userId)
  const next = existing.map(m => m.id === mistakeId ? { ...m, note: cleanNote, updated_at: nowIso } : m)
  writeJson(keyFor(userId, LS_MISTAKES_PREFIX), next)
  return { source: 'local' }
}

export async function loadMistakes(userId) {
  if (supabase && userId) {
    try {
      const { data, error } = await supabase.from('mistakes').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(500)
      if (!error && data) {
        writeJson(keyFor(userId, LS_MISTAKES_PREFIX), data)
        return { source: 'supabase', items: data }
      }
    } catch {}
  }
  return { source: 'local', items: listLocalMistakes(userId) }
}

function normalizeReviewItem(item) {
  const now = new Date().toISOString()
  return {
    due_at: item?.due_at || now,
    interval_days: Number(item?.interval_days || 0),
    ease: Number(item?.ease || 2.4),
    reps: Number(item?.reps || 0),
    lapses: Number(item?.lapses || 0),
    last_reviewed_at: item?.last_reviewed_at || null,
    last_correct: item?.last_correct == null ? null : Boolean(item.last_correct),
  }
}

export async function ensureReviewItems(userId, mistakes) {
  const patch = {}
  const nowIso = new Date().toISOString()
  for (const m of mistakes || []) {
    const k = mistakeItemKey(m)
    patch[k] = normalizeReviewItem({ due_at: nowIso })
  }

  if (supabase && userId) {
    try {
      // Upsert individually to avoid needing a composite PK migration for now.
      // If the `review_items` table exists, we store by (user_id,item_key).
      const rows = Object.entries(patch).map(([item_key, v]) => ({ user_id: userId, item_key, ...v }))
      const up = await supabase.from('review_items').upsert(rows)
      if (!up.error) return { source: 'supabase' }
    } catch {}
  }

  upsertLocalReviewItems(userId, patch)
  return { source: 'local' }
}

export async function loadReviewItems(userId) {
  if (supabase && userId) {
    try {
      const { data, error } = await supabase.from('review_items').select('*').eq('user_id', userId).limit(1000)
      if (!error && data) {
        const map = {}
        for (const r of data) map[r.item_key] = normalizeReviewItem(r)
        writeJson(keyFor(userId, LS_REVIEW_PREFIX), map)
        return { source: 'supabase', items: map }
      }
    } catch {}
  }
  return { source: 'local', items: listLocalReviewItems(userId) }
}

export function computeDueCount(reviewItems, now = new Date(), { exam = '' } = {}) {
  const t = now.getTime()
  let n = 0
  for (const [key, it] of Object.entries(reviewItems || {})) {
    // Skip already-validated items
    if (it?.last_correct === true) continue
    // Skip legacy ACT items (key format: "test_id:section:q_num")
    if (key.startsWith('act')) continue
    const due = new Date(it?.due_at || 0).getTime()
    if (Number.isFinite(due) && due <= t) n += 1
  }
  return n
}

export function nextDueItemKey(reviewItems, now = new Date()) {
  const t = now.getTime()
  let best = null
  let bestDue = Infinity
  for (const [k, it] of Object.entries(reviewItems || {})) {
    const due = new Date(it?.due_at || 0).getTime()
    if (!Number.isFinite(due) || due > t) continue
    if (due < bestDue) { bestDue = due; best = k }
  }
  return best
}

export function applyReviewResult(current, wasCorrect) {
  const now = new Date()
  const it = normalizeReviewItem(current)
  it.last_reviewed_at = now.toISOString()
  it.last_correct = Boolean(wasCorrect)

  if (wasCorrect) {
    it.reps += 1
    if (it.reps === 1) it.interval_days = 1
    else if (it.reps === 2) it.interval_days = 3
    else it.interval_days = Math.max(3, Math.round(it.interval_days * it.ease))
    it.ease = Math.min(2.8, it.ease + 0.08)
    const due = new Date(now)
    due.setDate(due.getDate() + it.interval_days)
    it.due_at = due.toISOString()
  } else {
    it.lapses += 1
    it.reps = 0
    it.interval_days = 0
    it.ease = Math.max(1.8, it.ease - 0.18)
    const due = new Date(now)
    due.setHours(due.getHours() + 2)
    it.due_at = due.toISOString()
  }
  return it
}

export async function saveReviewItem(userId, itemKey, nextItem) {
  const normalized = normalizeReviewItem(nextItem)
  if (supabase && userId) {
    try {
      const up = await supabase.from('review_items').upsert({ user_id: userId, item_key: itemKey, ...normalized })
      if (!up.error) return { source: 'supabase' }
    } catch {}
  }
  const patch = { [itemKey]: normalized }
  upsertLocalReviewItems(userId, patch)
  return { source: 'local' }
}

