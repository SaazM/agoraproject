import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Icon from '../components/AppIcons.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { getChaptersForExam } from '../data/examData.js'
import { getInitialPreferredExam } from '../lib/examChoice.js'
import { SAT_QUESTION_BANK } from '../data/practiceQuestionBank.js'

/* ─── optional supplemental question banks (lazy-loaded, may not exist yet) ─── */
let _extraBanksLoaded = false
let SAT_RW_EXTRA_BANK = {}

async function loadExtraBanks() {
  if (_extraBanksLoaded) return
  _extraBanksLoaded = true
  try {
    const m = await import('../data/satRWPracticeQuestions.js')
    SAT_RW_EXTRA_BANK = m.SAT_RW_PRACTICE_QUESTIONS || m.default || {}
  } catch { /* file may not exist yet */ }
}

/* ─── constants ─── */
const PAGE_SIZE = 20
const STORAGE_PREFIX = 'agora_practice_'

/* ─── merge question banks: overlay extra banks onto the primary bank ─── */
function mergeBank(...banks) {
  const merged = {}
  for (const bank of banks) {
    if (!bank || typeof bank !== 'object') continue
    for (const [chId, questions] of Object.entries(bank)) {
      if (!Array.isArray(questions)) continue
      if (!merged[chId]) merged[chId] = []
      merged[chId] = merged[chId].concat(questions)
    }
  }
  return merged
}

/* ─── resolve chapter info for questions that only have domain/topic ─── */
function resolveChapter(bq, chId, chapters) {
  if (chId && chapters[chId]) return { chId, ch: chapters[chId] }
  // If the question has a domain or topic, try to find a matching chapter
  const domain = bq.domain || bq.topic || ''
  if (domain) {
    for (const [id, ch] of Object.entries(chapters)) {
      if ((ch.domain || '').toLowerCase() === domain.toLowerCase() ||
          (ch.name || '').toLowerCase() === domain.toLowerCase()) {
        return { chId: id, ch }
      }
    }
  }
  return { chId: chId || 'general', ch: chapters[chId] || {} }
}

/* ─── build the question list from all curated question banks ─── */
function buildQuestions(chapters, exam) {
  const primaryBank = SAT_QUESTION_BANK
  const extraBank = SAT_RW_EXTRA_BANK
  const bank = mergeBank(primaryBank, extraBank)
  const chapterEntries = Object.entries(chapters)
  if (!chapterEntries.length) return []

  // Collect all chapter IDs from both chapters config and bank keys
  const allChapterIds = new Set([
    ...chapterEntries.map(([id]) => id),
    ...Object.keys(bank),
  ])

  const questions = []
  let num = 0

  for (const chId of allChapterIds) {
    const bankQuestions = bank[chId]
    if (!bankQuestions || !bankQuestions.length) continue

    let chIdx = 0
    for (const bq of bankQuestions) {
      const { chId: resolvedId, ch } = resolveChapter(bq, chId, chapters)
      const topicName = ch.name || bq.topic || resolvedId
      const code = ch.code || bq.chapterCode || resolvedId

      num += 1
      chIdx += 1
      questions.push({
        // Chapter-scoped ID: a global running number shifts for every later
        // chapter when the async extra bank loads, attaching saved answered
        // state to the wrong questions. Extras append per-chapter, so the
        // chapter + position key is stable.
        id: `${exam}-pq-${chId}-${chIdx}`,
        num,
        chapterId: resolvedId,
        chapterCode: code,
        chapterName: topicName,
        domain: ch.domain || bq.domain || 'General',
        color: ch.color || '#0284c7',
        stem: bq.stem,
        choices: bq.choices.map((text, ci) => ({
          label: String.fromCharCode(65 + ci),
          text: typeof text === 'string' ? text.replace(/^[A-D]\)\s*/, '') : text,
        })),
        correctIndex: bq.correct,
        correctLabel: String.fromCharCode(65 + bq.correct),
        explanation: bq.explanation,
      })
    }
  }
  return questions
}

/* ─── localStorage helpers ─── */
function loadAnswered(exam) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + exam)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAnswered(exam, answered) {
  try {
    localStorage.setItem(STORAGE_PREFIX + exam, JSON.stringify(answered))
  } catch { /* quota exceeded — degrade gracefully */ }
}

/* ─── component ─── */
export default function MorePractice() {
  const { user } = useAuth()
  const location = useLocation()
  const requestedExam = useMemo(
    () => String(new URLSearchParams(location.search).get('exam') || '').toLowerCase(),
    [location.search],
  )
  const exam = requestedExam === 'sat' ? requestedExam : getInitialPreferredExam(user)
  const chapters = useMemo(() => getChaptersForExam(exam), [exam])

  /* ─── load supplemental question banks ─── */
  const [extraBanksReady, setExtraBanksReady] = useState(_extraBanksLoaded)
  useEffect(() => {
    if (!extraBanksReady) {
      loadExtraBanks().then(() => setExtraBanksReady(true))
    }
  }, [extraBanksReady])

  /* ─── question bank (stable per exam, rebuilds when extras load) ─── */
  const allQuestions = useMemo(() => buildQuestions(chapters, exam), [chapters, exam, extraBanksReady])
  const totalQuestions = allQuestions.length

  /* ─── unique domains for filter pills ─── */
  const domains = useMemo(() => {
    const seen = new Set()
    const out = []
    for (const q of allQuestions) {
      if (!seen.has(q.domain)) {
        seen.add(q.domain)
        out.push(q.domain)
      }
    }
    return out
  }, [allQuestions])

  /* ─── state ─── */
  const [answered, setAnswered] = useState(() => loadAnswered(exam))
  const [selected, setSelected] = useState({})       // { [questionId]: choiceIndex }
  const [activeDomain, setActiveDomain] = useState('All')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const scrollRef = useRef(null)
  const questionRefs = useRef({})

  /* ─── reset state when exam changes ─── */
  useEffect(() => {
    setAnswered(loadAnswered(exam))
    setSelected({})
    setActiveDomain('All')
    setVisibleCount(PAGE_SIZE)
  }, [exam])

  /* ─── scroll to first unanswered on load ─── */
  useEffect(() => {
    const firstUnanswered = allQuestions.find((q) => !answered[q.id])
    if (firstUnanswered) {
      const idx = firstUnanswered.num - 1
      if (idx >= visibleCount) {
        setVisibleCount(Math.min(allQuestions.length, idx + PAGE_SIZE))
      }
      requestAnimationFrame(() => {
        const el = questionRefs.current[firstUnanswered.id]
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
    // run only once on mount / exam change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam])

  /* ─── filtered questions ─── */
  const filtered = useMemo(
    () => (activeDomain === 'All' ? allQuestions : allQuestions.filter((q) => q.domain === activeDomain)),
    [allQuestions, activeDomain],
  )
  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])

  /* ─── stats ─── */
  const answeredCount = useMemo(() => Object.keys(answered).length, [answered])
  const correctCount = useMemo(
    () => Object.values(answered).filter((a) => a.correct).length,
    [answered],
  )
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  /* ─── handlers ─── */
  const handleSelect = useCallback((questionId, choiceIndex) => {
    setSelected((prev) => ({ ...prev, [questionId]: choiceIndex }))
  }, [])

  const handleSubmit = useCallback(
    (question) => {
      const choiceIdx = selected[question.id]
      if (choiceIdx == null) return
      const correct = choiceIdx === question.correctIndex
      const next = { ...answered, [question.id]: { choice: choiceIdx, correct } }
      setAnswered(next)
      saveAnswered(exam, next)
    },
    [selected, answered, exam],
  )

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length))
  }, [filtered.length])

  const handleRetry = useCallback(
    (questionId) => {
      const next = { ...answered }
      delete next[questionId]
      setAnswered(next)
      setSelected((prev) => { const s = { ...prev }; delete s[questionId]; return s })
      saveAnswered(exam, next)
    },
    [answered, exam],
  )

  const handleReset = useCallback(() => {
    if (!window.confirm('Reset all practice progress for this exam? This cannot be undone.')) return
    setAnswered({})
    setSelected({})
    saveAnswered(exam, {})
    setVisibleCount(PAGE_SIZE)
  }, [exam])

  /* ─── render ─── */
  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />
      <div className="page fade-up" ref={scrollRef}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 0 80px' }}>

          {/* ── header ── */}
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ marginBottom: 32 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#d97706',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                }}
              >
                <Icon name="star" size={22} style={{ color: '#fff' }} />
              </motion.div>
              <div>
                <h1 style={{
                  fontFamily: "Fraunces, Georgia, serif", fontWeight: 600, fontSize: 28,
                  color: '#16181d', margin: 0, lineHeight: 1.2,
                }}>
                  More Practice
                </h1>
                <div style={{ fontSize: 13, color: '#565a63', marginTop: 2 }}>
                  {exam.toUpperCase()} &middot; {totalQuestions} realistic practice questions across every topic
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── sticky progress bar + filter pills ── */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            background: '#fff',
            boxShadow: '0 1px 3px rgba(22,24,29,.06)',
            borderRadius: '0 0 12px 12px',
            padding: '16px 0 12px',
            marginLeft: -4, marginRight: -4, paddingLeft: 4, paddingRight: 4,
          }}>
            {/* ── progress bar ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              style={{
                background: '#fff', borderRadius: 12, padding: '20px 24px',
                border: '1px solid rgba(2,132,199,.12)',
                boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    style={{ fontWeight: 600, fontSize: 22, color: '#0284c7', fontFamily: "Fraunces, Georgia, serif" }}
                  >
                    {answeredCount}
                  </motion.span>
                  <span style={{ fontSize: 13, color: '#8a8f98', fontWeight: 600 }}>
                    / {totalQuestions} answered
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {answeredCount > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.2 }}
                      style={{
                        fontSize: 12, fontWeight: 600, color: '#10b981',
                        background: 'rgba(16,185,129,.1)', padding: '3px 10px', borderRadius: 999,
                      }}
                    >
                      {correctCount}/{answeredCount} correct
                    </motion.span>
                  )}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: 0.25 }}
                    style={{
                      fontSize: 12, fontWeight: 600, color: '#0284c7',
                      background: 'rgba(2,132,199,.08)', padding: '3px 10px', borderRadius: 999,
                    }}
                  >
                    {progressPct}%
                  </motion.span>
                </div>
              </div>
              <div style={{
                height: 8, borderRadius: 99, background: 'rgba(2,132,199,.1)', overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    height: '100%', borderRadius: 99,
                    background: '#0284c7',
                  }}
                />
              </div>
              {answeredCount > 0 && (
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <button
                    onClick={handleReset}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 11, color: '#8a8f98', fontWeight: 700,
                      textDecoration: 'underline', textUnderlineOffset: 2,
                    }}
                  >
                    Reset progress
                  </button>
                </div>
              )}
            </motion.div>

            {/* ── filter pills ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{
                display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 4,
              }}
            >
              {['All', ...domains].map((d) => {
                const active = activeDomain === d
                return (
                  <button
                    key={d}
                    onClick={() => { setActiveDomain(d); setVisibleCount(PAGE_SIZE) }}
                    style={{
                      padding: '6px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600, transition: 'all .2s ease',
                      background: active
                        ? '#0284c7'
                        : 'rgba(2,132,199,.07)',
                      color: active ? '#fff' : '#3f434b',
                      boxShadow: active ? '0 1px 3px rgba(22,24,29,.06)' : 'none',
                    }}
                  >
                    {d}
                  </button>
                )
              })}
            </motion.div>
          </div>

          {/* spacer after sticky header */}
          <div style={{ height: 16 }} />

          {/* ── question cards ── */}
          <AnimatePresence mode="popLayout">
          <motion.div
            key={activeDomain}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {visible.map((q, vi) => {
              const isAnswered = Boolean(answered[q.id])
              const selectedIdx = selected[q.id]
              const result = answered[q.id]

              return (
                <motion.div
                  key={q.id}
                  ref={(el) => { questionRefs.current[q.id] = el }}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(vi * 0.02, 0.4) }}
                  style={{
                    background: '#fff', borderRadius: 12,
                    border: isAnswered
                      ? result?.correct
                        ? '1.5px solid rgba(16,185,129,.3)'
                        : '1.5px solid rgba(239,68,68,.25)'
                      : '1px solid rgba(2,132,199,.12)',
                    padding: '22px 26px',
                    boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                    transition: 'border-color .25s, box-shadow .25s',
                    opacity: isAnswered ? 0.88 : 1,
                  }}
                >
                  {/* card header */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    gap: 12, marginBottom: 14, flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontFamily: "Fraunces, Georgia, serif", fontWeight: 600, fontSize: 20,
                        color: '#0284c7', minWidth: 36,
                      }}>
                        #{q.num}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                        background: `${q.color}18`, color: q.color, border: `1px solid ${q.color}30`,
                        whiteSpace: 'nowrap',
                      }}>
                        {q.domain}
                      </span>
                      {isAnswered && (
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                          background: result?.correct ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)',
                          color: result?.correct ? '#10b981' : '#ef4444',
                        }}>
                          {result?.correct ? 'Correct' : 'Incorrect'}
                        </span>
                      )}
                      {isAnswered && (
                        <button
                          onClick={() => handleRetry(q.id)}
                          style={{
                            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                            background: 'rgba(2,132,199,.08)', color: '#0284c7',
                            border: '1px solid rgba(2,132,199,.2)', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            transition: 'all .2s ease',
                          }}
                        >
                          <Icon name="refresh" size={11} /> Retry
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#8a8f98', fontWeight: 600 }}>
                      {q.chapterCode} &middot; {q.chapterName}
                    </div>
                  </div>

                  {/* question stem */}
                  <div style={{
                    fontSize: 15, lineHeight: 1.65, color: '#16181d', fontWeight: 500,
                    marginBottom: 18, whiteSpace: 'pre-line',
                  }}>
                    {q.stem}
                  </div>

                  {/* choices */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: isAnswered ? 16 : 4 }}>
                    {q.choices.map((c, ci) => {
                      const isSelected = selectedIdx === ci
                      const wasChosen = isAnswered && result?.choice === ci
                      const isCorrectChoice = ci === q.correctIndex

                      let bg = 'rgba(2,132,199,.04)'
                      let borderColor = 'rgba(2,132,199,.12)'
                      let textColor = '#3f434b'

                      if (isAnswered) {
                        if (isCorrectChoice) {
                          bg = 'rgba(16,185,129,.10)'
                          borderColor = 'rgba(16,185,129,.4)'
                          textColor = '#047857'
                        } else if (wasChosen && !result?.correct) {
                          bg = 'rgba(239,68,68,.08)'
                          borderColor = 'rgba(239,68,68,.35)'
                          textColor = '#b91c1c'
                        } else {
                          bg = 'rgba(138,143,152,.05)'
                          borderColor = 'rgba(138,143,152,.15)'
                          textColor = '#8a8f98'
                        }
                      } else if (isSelected) {
                        bg = 'rgba(2,132,199,.10)'
                        borderColor = '#0284c7'
                        textColor = '#0284c7'
                      }

                      return (
                        <button
                          key={ci}
                          disabled={isAnswered}
                          onClick={() => handleSelect(q.id, ci)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 16px', borderRadius: 12,
                            border: `1.5px solid ${borderColor}`,
                            background: bg, cursor: isAnswered ? 'default' : 'pointer',
                            textAlign: 'left', transition: 'all .2s ease',
                            color: textColor,
                          }}
                        >
                          <span style={{
                            width: 28, height: 28, borderRadius: 999, flexShrink: 0,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 600, fontSize: 13,
                            background: isAnswered && isCorrectChoice
                              ? '#10b981'
                              : isAnswered && wasChosen && !result?.correct
                                ? '#ef4444'
                                : isSelected
                                  ? '#0284c7'
                                  : 'rgba(2,132,199,.1)',
                            color: (isSelected || (isAnswered && (isCorrectChoice || wasChosen)))
                              ? '#fff'
                              : '#565a63',
                          }}>
                            {c.label}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
                            {c.text}
                          </span>
                          {isAnswered && isCorrectChoice && (
                            <Icon name="check" size={16} style={{ color: '#10b981', marginLeft: 'auto', flexShrink: 0 }} />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* submit button (before answering) */}
                  {!isAnswered && (
                    <div style={{ textAlign: 'right', marginTop: 8 }}>
                      <button
                        disabled={selectedIdx == null}
                        onClick={() => handleSubmit(q)}
                        className="btn-primary"
                        style={{
                          padding: '8px 22px', borderRadius: 10, border: 'none',
                          fontSize: 13, fontWeight: 600, cursor: selectedIdx == null ? 'default' : 'pointer',
                          background: selectedIdx == null
                            ? 'rgba(2,132,199,.25)'
                            : '#0284c7',
                          color: '#fff',
                          boxShadow: selectedIdx != null ? '0 1px 3px rgba(22,24,29,.06)' : 'none',
                          transition: 'all .2s ease',
                          opacity: selectedIdx == null ? 0.6 : 1,
                        }}
                      >
                        Submit Answer
                      </button>
                    </div>
                  )}

                  {/* explanation (after answering) */}
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      style={{
                        padding: '14px 16px', borderRadius: 12,
                        background: 'rgba(2,132,199,.04)',
                        border: '1px solid rgba(2,132,199,.1)',
                      }}
                    >
                      <div style={{
                        fontSize: 11, fontWeight: 600, color: '#0284c7',
                        textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6,
                      }}>
                        Explanation
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.6, color: '#3f434b' }}>
                        {q.explanation}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
          </AnimatePresence>

          {/* ── load more ── */}
          {visibleCount < filtered.length && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button
                onClick={handleLoadMore}
                className="btn-outline"
                style={{
                  padding: '10px 32px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                  background: '#fff', border: '2px solid #0284c7', color: '#0284c7',
                  cursor: 'pointer', transition: 'all .2s ease',
                }}
              >
                Load More ({Math.min(PAGE_SIZE, filtered.length - visibleCount)} more of {filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}

          {/* ── completion message ── */}
          {visibleCount >= filtered.length && filtered.length > 0 && (
            <div style={{
              textAlign: 'center', marginTop: 40, padding: '24px 20px',
              background: 'rgba(2,132,199,.04)', borderRadius: 12,
              border: '1px dashed rgba(2,132,199,.2)',
            }}>
              <div style={{ fontSize: 14, color: '#565a63', fontWeight: 600 }}>
                {activeDomain === 'All'
                  ? `All ${totalQuestions} questions loaded`
                  : `All ${filtered.length} questions in "${activeDomain}" loaded`
                }
              </div>
            </div>
          )}

          {/* ── empty state ── */}
          {filtered.length === 0 && (
            <div style={{
              textAlign: 'center', marginTop: 60, padding: '40px 20px',
              background: 'rgba(2,132,199,.03)', borderRadius: 12,
              border: '1px dashed rgba(2,132,199,.15)',
            }}>
              <Icon name="star" size={32} style={{ color: '#8a8f98', marginBottom: 12 }} />
              <div style={{ fontSize: 15, color: '#565a63', fontWeight: 600 }}>
                No questions available for this filter.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
