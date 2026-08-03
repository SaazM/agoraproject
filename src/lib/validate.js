// Input validation & sanitization utilities

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUUID(val) {
  return typeof val === 'string' && UUID_RE.test(val)
}

export function isValidExam(val) {
  return val === 'sat'
}

export function sanitizeString(val, maxLen = 500) {
  if (val == null) return ''
  return String(val).replace(/[<>]/g, '').trim().slice(0, maxLen)
}

export function sanitizeEmail(val) {
  if (!val) return ''
  return String(val).trim().toLowerCase().slice(0, 254)
}

export function sanitizeNote(val) {
  if (val == null) return ''
  return String(val).replace(/[<>]/g, '').trim().slice(0, 2000)
}

export function isValidScore(val, min, max) {
  const n = Number(val)
  return Number.isFinite(n) && Number.isInteger(n) && n >= min && n <= max
}

export function clampInt(val, min, max) {
  const n = Math.round(Number(val) || 0)
  return Math.max(min, Math.min(max, n))
}

export function isValidTestId(val) {
  if (!val || typeof val !== 'string') return false
  return /^[a-z0-9_-]{1,50}$/i.test(val)
}

export function isValidChapterId(val) {
  if (!val) return false
  return /^[a-z0-9_-]{1,60}$/i.test(String(val))
}

export function sanitizeAnswers(answers) {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return {}
  const clean = {}
  const sections = Object.keys(answers).slice(0, 20)
  for (const section of sections) {
    if (typeof section !== 'string' || section.length > 50) continue
    const sectionAnswers = answers[section]
    if (!sectionAnswers || typeof sectionAnswers !== 'object' || Array.isArray(sectionAnswers)) continue
    clean[section] = {}
    const keys = Object.keys(sectionAnswers).slice(0, 200)
    for (const q of keys) {
      const val = sectionAnswers[q]
      if (val == null) continue
      clean[section][q] = String(val).slice(0, 100)
    }
  }
  return clean
}
