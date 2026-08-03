import {
  ANSWER_KEY as SAT_ANSWER_KEY,
  CHAPTERS as SAT_CHAPTERS,
  QUESTION_CHAPTER_MAP as SAT_QUESTION_CHAPTER_MAP,
  MODULES as SAT_MODULES,
  MODULE_ORDER as SAT_MODULE_ORDER,
  PDF_PAGE_MAP,
  rawToScaled as rawToSatScaled,
  answerMatches,
} from './testData.js'
import { EXTRA_PDF_PAGE_MAPS } from './extraPdfPageMaps.js'
import { GUIDE_CONTENT } from './guideContent.js'
import { SAT_TESTS } from './tests.js'

// Derive SAT section page ranges from the per-question page maps
function buildSatSectionRanges() {
  const allMaps = { pre_test: PDF_PAGE_MAP, ...EXTRA_PDF_PAGE_MAPS }
  const ranges = {}
  for (const [testId, modules] of Object.entries(allMaps)) {
    ranges[testId] = {}
    for (const [moduleId, qMap] of Object.entries(modules)) {
      const pages = Object.values(qMap).map(Number).filter(Number.isFinite)
      if (pages.length) {
        ranges[testId][moduleId] = [Math.min(...pages), Math.max(...pages)]
      }
    }
  }
  return ranges
}
const SAT_SECTION_PAGE_RANGES = buildSatSectionRanges()

const SAT_PERCENTILES = [
  { score: 400, percentile: 1 },
  { score: 500, percentile: 8 },
  { score: 600, percentile: 17 },
  { score: 700, percentile: 30 },
  { score: 800, percentile: 43 },
  { score: 900, percentile: 57 },
  { score: 1000, percentile: 71 },
  { score: 1100, percentile: 81 },
  { score: 1200, percentile: 89 },
  { score: 1300, percentile: 94 },
  { score: 1400, percentile: 97 },
  { score: 1500, percentile: 99 },
  { score: 1600, percentile: 99 },
]

function interpolateScore(score, table) {
  const sorted = [...table].sort((a, b) => a.score - b.score)
  if (score <= sorted[0].score) return sorted[0].percentile
  if (score >= sorted[sorted.length - 1].score) return sorted[sorted.length - 1].percentile
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const next = sorted[i]
    if (score <= next.score) {
      const ratio = (score - prev.score) / Math.max(1, next.score - prev.score)
      return Math.round(prev.percentile + ratio * (next.percentile - prev.percentile))
    }
  }
  return sorted[sorted.length - 1].percentile
}

export function satScoreToPercentile(score) {
  return interpolateScore(Number(score || 0), SAT_PERCENTILES)
}

export function getExamConfig() {
  return {
    exam: 'sat',
    label: 'SAT',
    tests: SAT_TESTS,
    preTestId: 'pre_test',
    finalTestId: 'final_test',
    modules: SAT_MODULES,
    moduleOrder: SAT_MODULE_ORDER,
    chapters: SAT_CHAPTERS,
    questionChapterMap: SAT_QUESTION_CHAPTER_MAP,
    guideContent: GUIDE_CONTENT,
    answerKey: SAT_ANSWER_KEY,
    viewerMode: 'stack',
    sectionPageRanges: SAT_SECTION_PAGE_RANGES,
    guideCompletionTarget: Object.keys(SAT_CHAPTERS).length,
  }
}

export function getExamConfigForTest() {
  return getExamConfig()
}

export function getGuideContentForExam() {
  return getExamConfig().guideContent
}

export function getChaptersForExam() {
  return getExamConfig().chapters
}

export function getModulesForTest() {
  return getExamConfig().modules
}

export function getModuleOrderForTest() {
  return getExamConfig().moduleOrder
}

export function getQuestionChapterMapForTest() {
  return getExamConfig().questionChapterMap
}

export function getSectionPageRangesForTest(testId) {
  return getExamConfig().sectionPageRanges?.[String(testId || '')] || null
}

export function getDefaultModuleTimeRemaining(testId) {
  const cfg = getExamConfigForTest(testId)
  return Object.fromEntries(
    (cfg.moduleOrder || []).map((moduleId) => [moduleId, Number(cfg.modules?.[moduleId]?.time || 0)])
  )
}

export function getQuestionCountForTest(testId) {
  const cfg = getExamConfigForTest(testId)
  return (cfg.moduleOrder || []).reduce((sum, moduleId) => sum + Number(cfg.modules?.[moduleId]?.questions || 0), 0)
}

export function getChoiceOptionsForQuestion() {
  return ['A', 'B', 'C', 'D']
}

export function formatDurationMinutes(totalSeconds = 0) {
  const seconds = Math.max(0, Number(totalSeconds || 0))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  if (hours && minutes) return `${hours} hr ${minutes} min`
  if (hours) return `${hours} hr`
  return `${minutes} min`
}

export function getScoreColumnsForExam() {
  return [
    { key: 'rw', label: 'R&W' },
    { key: 'math', label: 'Math' },
    { key: 'total', label: 'Total' },
  ]
}

export function scoreAttemptFromKey(testId, answers, keyBySection) {
  const cfg = getExamConfig()
  const modules = cfg.modules
  const order = cfg.moduleOrder
  const result = {}
  let totalCorrect = 0

  for (const section of order) {
    const key = keyBySection?.[section] || {}
    const sectionAnswers = answers?.[section] || {}
    const total = Number(modules?.[section]?.questions || 0)
    let correct = 0
    for (let q = 1; q <= total; q++) {
      const right = key?.[q]
      if (right == null) continue
      if (answerMatches(sectionAnswers?.[q], right)) correct += 1
    }
    totalCorrect += correct
    result[section] = { correct, total, wrong: Math.max(0, total - correct) }
  }

  const scaled = rawToSatScaled(
    (result.rw_m1?.correct || 0) + (result.rw_m2?.correct || 0),
    (result.math_m1?.correct || 0) + (result.math_m2?.correct || 0),
  )
  return {
    ...scaled,
    sections: {
      rw: scaled.rw,
      math: scaled.math,
    },
    raw: totalCorrect,
  }
}

export function calcWeakTopicsForTest(testId, answers, keyBySection) {
  const cfg = getExamConfigForTest(testId)
  const counts = {}
  for (const section of cfg.moduleOrder) {
    const key = keyBySection?.[section] || {}
    const sectionAnswers = answers?.[section] || {}
    const chapterMap = cfg.questionChapterMap?.[section] || {}
    const total = Number(cfg.modules?.[section]?.questions || 0)
    for (let q = 1; q <= total; q++) {
      const right = key?.[q]
      if (right == null) continue
      const chapterId = chapterMap?.[q]
      if (!chapterId) continue
      if (!answerMatches(sectionAnswers?.[q], right)) counts[chapterId] = (counts[chapterId] || 0) + 1
    }
  }
  return Object.entries(counts)
    .map(([ch, count]) => ({ ...(cfg.chapters?.[ch] || {}), ch, count }))
    .filter((item) => item.ch && Number(item.count) > 0)
    .sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0))
}

export function scoreToPercentile(exam, score) {
  return satScoreToPercentile(score)
}
