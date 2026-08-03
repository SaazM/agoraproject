function pad2(n) {
  return String(n).padStart(2, '0')
}

export function toLocalDateKey(d) {
  // new Date(null) is the epoch, which passes the finite check — a null
  // completed_at must not become a phantom 1970 activity day.
  if (d == null) return null
  const dt = (d instanceof Date) ? d : new Date(d)
  if (!Number.isFinite(dt.getTime())) return null
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
}

export function startOfWeekKey(date = new Date()) {
  const d = (date instanceof Date) ? new Date(date) : new Date(date)
  if (!Number.isFinite(d.getTime())) return null
  // Monday as start of week.
  const day = d.getDay() // 0=Sun..6=Sat
  const delta = (day === 0 ? -6 : 1 - day)
  d.setDate(d.getDate() + delta)
  d.setHours(0, 0, 0, 0)
  return toLocalDateKey(d)
}

export function isInCurrentWeek(dateKey, now = new Date()) {
  if (!dateKey) return false
  const wk = startOfWeekKey(now)
  return dateKey >= wk
}

export function computeStreak(activityKeys, now = new Date()) {
  const set = activityKeys instanceof Set ? activityKeys : new Set(activityKeys || [])
  const todayKey = toLocalDateKey(now)
  if (!todayKey) return { current: 0, best: 0, todayKey }

  // Best streak across all time
  const sorted = Array.from(set).filter(Boolean).sort()
  let best = 0
  let run = 0
  let prev = null
  for (const k of sorted) {
    if (!prev) run = 1
    else {
      const prevD = new Date(prev + 'T00:00:00')
      const nextD = new Date(k + 'T00:00:00')
      const diff = Math.round((nextD - prevD) / (24 * 3600 * 1000))
      run = diff === 1 ? run + 1 : 1
    }
    best = Math.max(best, run)
    prev = k
  }

  // Current streak ending today (or yesterday if no activity today) — a streak
  // shouldn't read 0 every morning before the student's first activity.
  let current = 0
  const cursor = new Date(now)
  cursor.setHours(0, 0, 0, 0)
  if (!set.has(toLocalDateKey(cursor))) cursor.setDate(cursor.getDate() - 1)

  for (let i = 0; i < 3650; i++) { // hard cap ~10 years
    const key = toLocalDateKey(cursor)
    if (!set.has(key)) break
    current += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return { current, best, todayKey }
}

export function computeWeeklyProgress(activityKeys, goalDays = 5, now = new Date()) {
  const set = activityKeys instanceof Set ? activityKeys : new Set(activityKeys || [])
  const wk = startOfWeekKey(now)
  const done = Array.from(set).filter(k => k && k >= wk).length
  const goal = Math.max(1, Number(goalDays || 5))
  return { weekStartKey: wk, doneDays: done, goalDays: goal, pct: Math.min(100, Math.round((done / goal) * 100)) }
}

export function computeLevelAndBadges({ hasPretest, studiedCount, totalChapters, completedExtra, streakCurrent, streakBest, dueReviews }) {
  const chapters = Number(studiedCount || 0)
  const extras = Number(completedExtra || 0)
  const total = Number(totalChapters || 34)

  const xp =
    (hasPretest ? 250 : 0) +
    Math.round((chapters / Math.max(1, total)) * 600) +
    Math.min(400, extras * 80) +
    Math.min(300, streakBest * 10) +
    Math.min(150, Math.max(0, 7 - dueReviews) * 10)

  const level = 1 + Math.floor(xp / 250)
  const nextXp = level * 250
  const badges = [
    { id: 'pretest', label: 'First Test', desc: 'Complete the Pre Test.', earned: Boolean(hasPretest) },
    { id: 'guide10', label: 'Warmup', desc: 'Complete 10 study chapters.', earned: chapters >= 10 },
    { id: 'guideAll', label: 'Mastery', desc: 'Complete the full study guide.', earned: chapters >= total },
    { id: 'extra1', label: 'Skill Builder', desc: 'Finish an optional skill builder test.', earned: extras >= 1 },
    { id: 'extra5', label: 'Reinforced', desc: 'Finish 5 optional tests.', earned: extras >= 5 },
    { id: 'streak3', label: 'Momentum', desc: '3-day streak.', earned: streakBest >= 3 },
    { id: 'streak7', label: 'Consistency', desc: '7-day streak.', earned: streakBest >= 7 },
    { id: 'streak14', label: 'Locked In', desc: '14-day streak.', earned: streakBest >= 14 },
    { id: 'review0', label: 'Inbox Zero', desc: 'Clear your review queue.', earned: (dueReviews || 0) === 0 },
  ]
  const earned = badges.filter(b => b.earned).length

  let title = 'Starter'
  if (level >= 9) title = 'Scholar'
  else if (level >= 6) title = 'Strategist'
  else if (level >= 3) title = 'Builder'

  return { xp, level, nextXp, title, earnedBadges: earned, badges }
}

