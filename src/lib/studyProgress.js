import { supabase } from './supabase.js'

const LS_KEY_PREFIX = 'agora_studied_topics_v1:'

function lsKey(userId) {
  return `${LS_KEY_PREFIX}${userId || 'anon'}`
}

function readLocal(userId) {
  try {
    return JSON.parse(localStorage.getItem(lsKey(userId)) || '{}')
  } catch {
    return {}
  }
}

function writeLocal(userId, map) {
  localStorage.setItem(lsKey(userId), JSON.stringify(map || {}))
}

export async function getStudiedTopics(userId) {
  if (!userId) return { source: 'none', map: {} }
  if (!supabase) return { source: 'local', map: readLocal(userId) }
  const { data, error } = await supabase
    .from('studied_topics')
    .select('chapter_id,completed,practice,updated_at,completed_at')
    .eq('user_id', userId)
  if (error) return { source: 'local', map: readLocal(userId) }
  const map = {}
  const practiceByChapter = {}
  const rows = []
  for (const row of data || []) {
    map[row.chapter_id] = Boolean(row.completed)
    if (row.practice && typeof row.practice === 'object') practiceByChapter[row.chapter_id] = row.practice
    rows.push(row)
  }
  writeLocal(userId, map)
  return { source: 'supabase', map, practiceByChapter, rows }
}

export async function setStudiedTopic(userId, chapterId, completed) {
  if (!userId || !chapterId || typeof chapterId !== 'string' || chapterId.length > 60) return
  const local = readLocal(userId)
  local[chapterId] = Boolean(completed)
  writeLocal(userId, local)
  if (!supabase) return
  await supabase
    .from('studied_topics')
    .upsert({
      user_id: userId,
      chapter_id: chapterId,
      completed: Boolean(completed),
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
}

function asObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
}

// Guide answers live under practice.guide; very old rows stored them at the top level
// (and a few rows have both, from the old "mark started" write). Union them all.
function guideMapOf(practice) {
  const p = asObject(practice)
  const legacy = Object.fromEntries(Object.entries(p).filter(([k]) => /^\d+$/.test(k)))
  return { ...legacy, ...asObject(p.guide) }
}

// Chapter writes are read-then-upsert, so two in flight for the same chapter could
// interleave and the later upsert would drop the earlier one's answers. Run them one
// at a time per (user, chapter) within this tab.
const chapterQueues = new Map()
function withChapterLock(userId, chapterId, task) {
  const key = `${userId}|${chapterId}`
  const prev = chapterQueues.get(key) || Promise.resolve()
  const run = prev.catch(() => {}).then(task)
  chapterQueues.set(key, run)
  run.finally(() => { if (chapterQueues.get(key) === run) chapterQueues.delete(key) })
  return run
}

// Read the chapter's practice JSON as the database has it right now. Writers merge
// into this instead of trusting the page's copy, which may not have loaded yet —
// upserting a stale copy replaces the whole column and erases saved answers.
async function readServerPractice(userId, chapterId) {
  const { data, error } = await supabase
    .from('studied_topics')
    .select('practice')
    .eq('user_id', userId)
    .eq('chapter_id', chapterId)
    .maybeSingle()
  if (error) throw error
  return asObject(data?.practice)
}

export async function setChapterGuidePractice(userId, chapterId, guideMap, existingPractice) {
  if (!userId || !chapterId || typeof chapterId !== 'string' || chapterId.length > 60) return
  if (!guideMap || typeof guideMap !== 'object' || Array.isArray(guideMap)) return
  if (!supabase) return
  return withChapterLock(userId, chapterId, async () => {
    const server = await readServerPractice(userId, chapterId)
    const local = asObject(existingPractice)
    const legacyKeys = (p) => Object.fromEntries(Object.entries(p).filter(([k]) => !/^\d+$/.test(k)))
    const nextPractice = {
      ...legacyKeys(local),
      ...legacyKeys(server),
      meta: { ...asObject(local.meta), ...asObject(server.meta) },
      // Answers only ever flip to "correct", so the union never loses progress.
      guide: { ...guideMapOf(server), ...guideMapOf(local), ...guideMap },
    }
    if (!Object.keys(nextPractice.meta).length) delete nextPractice.meta
    const { error } = await supabase
      .from('studied_topics')
      .upsert({
        user_id: userId,
        chapter_id: chapterId,
        practice: nextPractice,
        updated_at: new Date().toISOString(),
      })
    if (error) throw error
  })
}

export async function markChapterGuideStarted(userId, chapterId) {
  if (!userId || !chapterId || typeof chapterId !== 'string' || chapterId.length > 60) return
  if (!supabase) return
  return withChapterLock(userId, chapterId, async () => {
    const server = await readServerPractice(userId, chapterId)
    const meta = asObject(server.meta)
    if (meta.guide_started_at) return
    const nowIso = new Date().toISOString()
    const { error } = await supabase
      .from('studied_topics')
      .upsert({
        user_id: userId,
        chapter_id: chapterId,
        practice: { ...server, meta: { ...meta, guide_started_at: nowIso } },
        updated_at: nowIso,
      })
    if (error) throw error
  })
}

export async function clearAdminTestingData(userId) {
  if (!userId || !supabase) return
  // Best-effort cleanup; safe even if some columns/tables aren't migrated yet.
  try { await supabase.from('post_scores').delete().eq('user_id', userId) } catch {}
  try { await supabase.from('test_attempts').delete().eq('user_id', userId) } catch {}
  try { await supabase.from('studied_topics').delete().eq('user_id', userId) } catch {}
  try { localStorage.removeItem(lsKey(userId)) } catch {}
}
