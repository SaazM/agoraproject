import fs from 'node:fs'
import path from 'node:path'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

const ROOT = path.resolve(process.cwd())
const AK_PATH = path.join(ROOT, 'scripts', 'sources', 'final-test-answer-key.pdf') // kept out of public/ so students can't download it
const OUT_PATH = path.join(ROOT, 'src', 'data', 'finalAnswerKey.js')

function sumCounts(key) {
  if (!key || typeof key !== 'object') return 0
  return Object.keys(key.rw_m1 || {}).length
    + Object.keys(key.rw_m2 || {}).length
    + Object.keys(key.math_m1 || {}).length
    + Object.keys(key.math_m2 || {}).length
}

function isChoiceLetter(v) {
  const s = String(v || '').trim().toUpperCase()
  return s === 'A' || s === 'B' || s === 'C' || s === 'D'
}

function looksLikeFreeResponse(v) {
  const s = String(v || '').trim()
  if (!s) return false
  return /[0-9π]/i.test(s) && /^[0-9.+/()^piπ\-\s;,]+$/i.test(s)
}

async function loadPdfFromBuf(buf) {
  return pdfjsLib.getDocument({ data: buf, disableWorker: true }).promise
}

async function extractCollegeBoardAnswerKeyFromScoringGuide(buf) {
  const pdf = await loadPdfFromBuf(buf)
  const sections = ['rw_m1', 'rw_m2', 'math_m1', 'math_m2']
  const maxQ = { rw_m1: 33, rw_m2: 33, math_m1: 27, math_m2: 27 }

  async function tryParsePage(p) {
    const page = await pdf.getPage(p)
    const tc = await page.getTextContent()
    const items = (tc.items || [])
      .map(i => ({ s: String(i.str || '').trim(), x: i.transform?.[4] ?? 0, y: i.transform?.[5] ?? 0 }))
      .filter(i => i.s)

    const qTokens = items
      .map(i => ({ ...i, q: /^\d{1,2}$/.test(i.s) ? parseInt(i.s, 10) : null }))
      .filter(i => Number.isFinite(i.q) && i.q >= 1 && i.q <= 33)

    if (qTokens.length < 60) return null

    const xs = qTokens.map(t => t.x).sort((a, b) => a - b)
    const clusters = []
    const thresh = 40
    for (const x of xs) {
      const last = clusters[clusters.length - 1]
      if (!last || Math.abs(x - last.center) > thresh) clusters.push({ center: x, n: 1 })
      else { last.center = (last.center * last.n + x) / (last.n + 1); last.n += 1 }
    }
    clusters.sort((a, b) => b.n - a.n)
    const top = clusters.slice(0, 6).sort((a, b) => a.center - b.center)

    const picked = []
    for (const c of top) {
      if (!picked.length || Math.abs(c.center - picked[picked.length - 1]) > 60) picked.push(c.center)
      if (picked.length === 4) break
    }
    if (picked.length < 4) return null

    const cols = picked.sort((a, b) => a - b)
    function nearestColIndex(x) {
      let best = 0
      let bestD = Infinity
      for (let i = 0; i < cols.length; i++) {
        const d = Math.abs(x - cols[i])
        if (d < bestD) { bestD = d; best = i }
      }
      return best
    }

    const out = { rw_m1: {}, rw_m2: {}, math_m1: {}, math_m2: {} }
    for (const qt of qTokens) {
      const idx = nearestColIndex(qt.x)
      const section = sections[idx]
      if (!section) continue
      if (qt.q > maxQ[section]) continue

      const sameRow = items.filter(i => Math.abs(i.y - qt.y) < 6)
      const candidates = sameRow
        .filter(i => (isChoiceLetter(i.s) || looksLikeFreeResponse(i.s)) && i.x > qt.x)
        .sort((a, b) => a.x - b.x)
      const ans = candidates[0]?.s
      if (!ans) continue
      out[section][qt.q] = String(ans).toUpperCase().replace('Π', 'PI')
    }

    const count = sumCounts(out)
    if (count < 80) return null
    return out
  }

  for (let p = 1; p <= pdf.numPages; p++) {
    const parsed = await tryParsePage(p)
    if (parsed) return parsed
  }
  throw new Error('Could not find the answer key table in this PDF.')
}

async function extractSimpleAnswerKeyFromAnswerKeyPdf(buf) {
  const pdf = await loadPdfFromBuf(buf)
  const out = { rw_m1: {}, rw_m2: {}, math_m1: {}, math_m2: {} }
  const maxQ = { rw_m1: 33, rw_m2: 33, math_m1: 27, math_m2: 27 }
  const rePair = /(^|\s)(\d{1,2})\s*([A-D])(?=\s|$)/g

  function detectSection(text) {
    const t = String(text || '').toLowerCase()
    const isRW = t.includes('reading') || t.includes('writing') || t.includes('r&w')
    const isMath = t.includes('math')
    const m1 = /module\s*1/.test(t) || /mod\s*1/.test(t)
    const m2 = /module\s*2/.test(t) || /mod\s*2/.test(t)
    if (isRW && m1) return 'rw_m1'
    if (isRW && m2) return 'rw_m2'
    if (isMath && m1) return 'math_m1'
    if (isMath && m2) return 'math_m2'
    return null
  }

  let current = null
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const tc = await page.getTextContent()
    const text = (tc.items || []).map(i => String(i.str || '')).join(' ')
    current = detectSection(text) || current
    const sec = current
    if (!sec) continue

    let m
    while ((m = rePair.exec(text)) !== null) {
      const q = parseInt(m[2], 10)
      const a = String(m[3] || '').toUpperCase()
      if (!Number.isFinite(q) || q < 1 || q > maxQ[sec]) continue
      out[sec][q] = a
    }
  }

  const total = sumCounts(out)
  if (total < 40) throw new Error('Could not find enough answers in this PDF.')
  return out
}

async function extractAnswerKeyFromPdf(buf) {
  try {
    return await extractCollegeBoardAnswerKeyFromScoringGuide(buf)
  } catch {
    return await extractSimpleAnswerKeyFromAnswerKeyPdf(buf)
  }
}

function toModuleExport(name, obj) {
  return `export const ${name} = ${JSON.stringify(obj, null, 2)}\n`
}

async function main() {
  if (!fs.existsSync(AK_PATH)) throw new Error(`Missing ${AK_PATH}`)
  const buf = new Uint8Array(fs.readFileSync(AK_PATH))
  const key = await extractAnswerKeyFromPdf(buf)
  const total = sumCounts(key)
  const per = {
    rw_m1: Object.keys(key.rw_m1 || {}).length,
    rw_m2: Object.keys(key.rw_m2 || {}).length,
    math_m1: Object.keys(key.math_m1 || {}).length,
    math_m2: Object.keys(key.math_m2 || {}).length,
  }
  if (total !== 120 || per.rw_m1 !== 33 || per.rw_m2 !== 33 || per.math_m1 !== 27 || per.math_m2 !== 27) {
    throw new Error(`final_test key parsed incomplete (total=${total}, rw_m1=${per.rw_m1}, rw_m2=${per.rw_m2}, math_m1=${per.math_m1}, math_m2=${per.math_m2})`)
  }
  fs.writeFileSync(OUT_PATH, `// Auto-generated by scripts/generateFinalAnswerKey.mjs\n${toModuleExport('FINAL_ANSWER_KEY', key)}`)
  console.log('Wrote:', OUT_PATH)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

