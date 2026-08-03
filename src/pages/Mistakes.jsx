import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth.jsx'
import { PDF_PAGE_MAP, answerMatches, isMultipleChoiceAnswer } from '../data/testData.js'
import { EXTRA_PDF_PAGE_MAPS } from '../data/extraPdfPageMaps.js'
import { getTestConfig } from '../data/tests.js'
import { getAnswerKeyBySection } from '../data/answerKeys.js'
import BrandLink from '../components/BrandLink.jsx'
import Icon from '../components/AppIcons.jsx'
import TopResourceNav from '../components/TopResourceNav.jsx'
import { loadMistakes, loadReviewItems, computeDueCount, updateMistakeNote, applyReviewResult, saveReviewItem } from '../lib/mistakesStore.js'
import { getChoiceOptionsForQuestion, getExamConfigForTest, getGuideContentForExam } from '../data/examData.js'
import { resolveViewContext, withExam, withViewUser } from '../lib/viewAs.js'
import { getInitialPreferredExam } from '../lib/examChoice.js'
import { buildQuestionHintLadder } from '../lib/questionHints.js'
import { hasUnlockedResources } from '../lib/pretestGate.js'
import { useToast } from '../components/Toast.jsx'
import Sidebar from '../components/Sidebar.jsx'
/* ── framer-motion variants ── */
const listStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045 } },
}
const listItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}
const panelSlideIn = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.35, ease: 'easeOut' },
}

const ALL_GUIDE_CONTENT = getGuideContentForExam('sat')

/* Navbar removed — using Sidebar */

function parseItemKey(k) {
  const parts = String(k || '').split(':')
  if (parts.length < 3) return null
  const q = Number(parts[2])
  return { test_id: parts[0], section: parts[1], q_num: q }
}

function pdfPageFor(testId, section, qNum) {
  const map = (testId === 'pre_test')
    ? (PDF_PAGE_MAP?.[section] || {})
    : (EXTRA_PDF_PAGE_MAPS?.[testId]?.[section] || {})
  if (Number.isFinite(Number(map?.[qNum]))) return { pageIndex: map[qNum], scrollRatio: 0 }
  for (let q = qNum - 1; q >= 1; q--) {
    if (Number.isFinite(Number(map?.[q]))) return { pageIndex: map[q], scrollRatio: 0 }
  }
  return { pageIndex: 0, scrollRatio: 0 }
}

function buildMistakeHints(mistake, isMC, questionText = '') {
  const chapterMeta = ALL_GUIDE_CONTENT?.[mistake?.chapter_id] || {}
  return buildQuestionHintLadder({
    exam: 'sat',
    section: mistake?.section || '',
    qNum: mistake?.q_num || 0,
    isMC,
    chapterName: chapterMeta?.name || '',
    chapterCode: chapterMeta?.code || '',
    concepts: chapterMeta?.concepts || [],
    questionText,
    answerChoices: isMC ? getChoiceOptionsForQuestion(mistake?.test_id, mistake?.section, mistake?.q_num) : [],
  })
}

export default function Mistakes() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const exam = 'sat'
  const { viewUserId, isAdminPreview } = useMemo(
    () => resolveViewContext({ userId: user?.id, profile, search: location.search }),
    [user?.id, profile, location.search]
  )
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [reviewItems, setReviewItems] = useState({})
  const [selected, setSelected] = useState(null)
  const [filterDue, setFilterDue] = useState(false)
  const [savingId, setSavingId] = useState(null)
  const [redoChoice, setRedoChoice] = useState(null)
  const [redoText, setRedoText] = useState('')
  const [redoFeedback, setRedoFeedback] = useState(null)
  const [redoSaving, setRedoSaving] = useState(false)
  const [hintStep, setHintStep] = useState(0)
  const [questionContextText, setQuestionContextText] = useState('')
  const [solvedIds, setSolvedIds] = useState(new Set())

  const addToast = useToast()
  const viewHref = (path) => withViewUser(withExam(path, exam), viewUserId, isAdminPreview)
  const satHref = withViewUser(withExam('/dashboard', 'sat'), viewUserId, isAdminPreview)
  const showResourceNav = hasUnlockedResources(viewUserId, exam)

  useEffect(() => {
    if (!viewUserId) return
    let cancelled = false
    setLoading(true)
    Promise.allSettled([loadMistakes(viewUserId), loadReviewItems(viewUserId)])
      .then(([m, r]) => {
        if (cancelled) return
        setItems(m.status === 'fulfilled' ? (m.value.items || []) : [])
        setReviewItems(r.status === 'fulfilled' ? (r.value.items || {}) : {})
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [viewUserId])

  const dueCount = useMemo(() => computeDueCount(reviewItems, new Date(), { exam }), [reviewItems, exam])

  const filtered = useMemo(() => {
    const now = Date.now()
    const list = (items || []).slice()
      .filter((m) => !String(m?.test_id || '').startsWith('act'))
      // Hide validated items (once correct, it comes off the list).
      .filter((m) => {
        const k = `${m.test_id}:${m.section}:${m.q_num}`
        return reviewItems?.[k]?.last_correct !== true
      })
    if (!filterDue) return list
    return list.filter((m) => {
      const k = `${m.test_id}:${m.section}:${m.q_num}`
      const due = new Date(reviewItems?.[k]?.due_at || 0).getTime()
      return Number.isFinite(due) && due <= now
    })
  }, [items, filterDue, reviewItems])

  const selectedCfg = selected ? getTestConfig(selected.test_id) : null
  const selectedExamConfig = selected ? getExamConfigForTest(selected.test_id) : null
  const selectedModule = selectedExamConfig?.modules?.[selected?.section]
  const [resolvedPdfTarget, setResolvedPdfTarget] = useState({ pageIndex: 0, scrollRatio: 0 })
  const selectedItemKey = selected ? `${selected.test_id}:${selected.section}:${selected.q_num}` : null
  const selectedKeyBySection = selected ? getAnswerKeyBySection(selected.test_id) : null
  const selectedCorrect = selected ? selectedKeyBySection?.[selected.section]?.[selected.q_num] : null
  const selectedIsMC = selected ? isMultipleChoiceAnswer(selectedCorrect) : false
  const selectedChoices = selected ? getChoiceOptionsForQuestion(selected.test_id, selected.section, selected.q_num) : ['A', 'B', 'C', 'D']

  useEffect(() => {
    setRedoChoice(null)
    setRedoText('')
    setRedoFeedback(null)
    setRedoSaving(false)
    setHintStep(0)
    setQuestionContextText('')
  }, [selectedItemKey])

  useEffect(() => {
    // Don't auto-deselect if user just answered correctly (let them pick Next or Back)
    if (redoFeedback?.ok) return
    if (selected && !filtered.some((item) => item.id === selected.id)) {
      setSelected(null)
    }
  }, [filtered, selected, redoFeedback])

  useEffect(() => {
    if (!selected) {
      setResolvedPdfTarget({ pageIndex: 0, scrollRatio: 0 })
      return
    }
    setResolvedPdfTarget(pdfPageFor(selected.test_id, selected.section, selected.q_num))
  }, [selectedItemKey, selected?.test_id, selected?.section, selected?.q_num])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#565a63', fontFamily: 'Fraunces, Georgia, serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#0284c7',
            margin: '0 auto 12px',
            animation: 'pulse 1.5s ease-in-out infinite',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="mistakes" size={20} style={{ color: 'white' }} />
          </div>
          <span style={{ fontSize: 14 }}>Loading mistake notebook…</span>
        </div>
      </div>
    )
  }

  const nextMistake = (() => {
    if (!selected) return null
    const idx = filtered.findIndex((m) => m.id === selected.id)
    if (idx < 0) return filtered.find(m => !solvedIds.has(m.id)) || null
    // Find next unsolved mistake after current index, then wrap around
    for (let i = 1; i < filtered.length; i++) {
      const candidate = filtered[(idx + i) % filtered.length]
      if (!solvedIds.has(candidate.id)) return candidate
    }
    return null
  })()

  const answerPanel = selected ? (
    <motion.div
      {...panelSlideIn}
      className={`${redoFeedback ? (redoFeedback.ok ? 'answer-feedback-correct' : 'answer-feedback-wrong') : ''}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 26, height: 26, borderRadius: 8,
            background: '#0284c7',
            color: '#fff', fontSize: 11, fontWeight: 600,
          }}>Q{selected.q_num}</span>
          <span style={{ fontWeight: 600, color: '#16181d', fontSize: 15 }}>Quick Redo</span>
        </div>
        <div style={{ fontSize: 11, color: '#8a8f98', fontWeight: 700 }}>
          {selectedCorrect != null ? 'Click Check to validate' : 'Answer key missing'}
        </div>
      </div>

      {selectedCorrect == null ? (
        <div style={{ marginTop: 10, color: '#565a63', fontSize: 13, lineHeight: 1.6 }}>
          This question can't be validated yet because the answer key isn't loaded.
        </div>
      ) : (
        <>
          {selectedIsMC ? (
            <div
              className="mistake-choice-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${selectedChoices.length >= 5 ? 5 : 4}, minmax(0, 1fr))`,
                gap: 10,
                marginTop: 12,
              }}
            >
              {selectedChoices.map((c) => (
                <button
                  key={c}
                  className="btn btn-outline"
                  style={{
                    padding: '10px 12px',
                    fontWeight: 600,
                    borderColor: redoChoice === c ? '#16181d' : '#e4e0d5',
                    background: redoChoice === c ? 'rgba(22,24,29,.08)' : 'white',
                  }}
                  onClick={() => {
                    setRedoChoice(c)
                    setRedoFeedback(null)
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: '#565a63', marginBottom: 8 }}>
                Open response: enter only the value/expression. Equivalent fractions and comma-formatted numbers count. Examples: <code>75</code>, <code>1/2</code>, <code>0.5</code>, <code>15,000</code>, <code>pi</code>, <code>3*pi/2</code>, <code>2^3</code>.
              </div>
              <input
                type="text"
                className="free-response-input"
                placeholder="Your answer"
                value={redoText}
                onChange={(e) => {
                  setRedoText(e.target.value)
                  setRedoFeedback(null)
                }}
                autoComplete="off"
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              disabled={isAdminPreview || redoSaving || (selectedIsMC ? !redoChoice : !redoText.trim())}
              onClick={async () => {
                if (isAdminPreview || !selectedItemKey) return
                const right = String(selectedCorrect || '').trim()
                const submitted = selectedIsMC ? redoChoice : redoText
                const ok = answerMatches(submitted, right)

                setRedoFeedback(ok ? { ok: true, msg: 'Correct — nice work.' } : { ok: false, msg: 'Not quite — try the hints and check again.' })
                if (!ok) setHintStep((step) => Math.max(step, 1))
                if (!ok) return
                setSolvedIds(prev => new Set(prev).add(selected.id))

                setRedoSaving(true)
                try {
                  const currentItem = reviewItems?.[selectedItemKey] || { due_at: new Date().toISOString() }
                  const next = applyReviewResult(currentItem, true)
                  await saveReviewItem(viewUserId, selectedItemKey, next)
                  const updatedReview = { ...(reviewItems || {}), [selectedItemKey]: next }
                  setReviewItems(updatedReview)
                  // Don't remove from items yet — let user pick "Next" or "Back to list"
                  if (addToast) {
                    const remaining = (items || []).filter(m => m.id !== selected.id).filter(m => {
                      const k = `${m.test_id}:${m.section}:${m.q_num}`
                      return updatedReview?.[k]?.last_correct !== true
                    }).filter(m => !String(m?.test_id || '').startsWith('act')).length
                    if (remaining === 0) {
                      addToast("Good job on Q" + selected.q_num + "! You've completed all your missed questions!", 'success')
                    } else {
                      addToast("Good job on Q" + selected.q_num + "! " + remaining + " question" + (remaining === 1 ? "" : "s") + " left in your Mistake Notebook.", 'success')
                    }
                  }
                } catch (e) {
                  console.warn('[Mistakes] Failed to save review result:', e?.message)
                  setRedoFeedback({ ok: true, msg: 'Correct — but saving your progress failed. It may not stick after a reload.' })
                } finally {
                  setRedoSaving(false)
                }
              }}
            >
              {redoSaving ? 'Saving…' : 'Check →'}
            </button>
            {redoFeedback && (
              <div style={{ fontSize: 12, fontWeight: 600, color: redoFeedback.ok ? '#10b981' : '#ef4444' }}>
                {redoFeedback.msg}
              </div>
            )}
          </div>

          {redoFeedback && !redoFeedback.ok && (
            <div style={{ marginTop: 8, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '8px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <div style={{ fontWeight: 600, color: '#9a3412', fontSize: 12 }}>Hints</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      className="btn btn-outline"
                      style={{ padding: '4px 8px', fontSize: 11, background: 'white' }}
                      onClick={() => setHintStep((step) => Math.max(step, n))}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {hintStep > 0 && (
                <ul style={{ margin: '6px 0 0 14px', padding: 0, color: '#7c2d12', fontSize: 12, lineHeight: 1.5 }}>
                  {buildMistakeHints(selected, selectedIsMC, questionContextText).slice(0, hintStep).map((hint, index) => (
                    <li key={`${selectedItemKey}-hint-${index}`} style={{ marginBottom: 3 }}>{hint}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {redoFeedback?.ok && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>
                <Icon name="back" size={16} />
                Back to list
              </button>
              <button
                className="btn btn-primary"
                disabled={!nextMistake}
                onClick={() => {
                  if (nextMistake) setSelected(nextMistake)
                }}
              >
                {nextMistake ? 'Next unsolved →' : 'All done!'}
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  ) : null

  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />
      <div className="page fade-up">
        {isAdminPreview && (
          <div className="card" style={{ marginBottom: 16, background: '#16181d', color: 'white' }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Admin View</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.88 }}>
              You're viewing this student's Mistake Notebook in read-only mode. Notes and validations won't overwrite their data.
            </div>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: '#0284c7',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(22,24,29,.06)', flexShrink: 0,
              }}
            >
              <Icon name="mistakes" size={22} style={{ color: '#fff' }} />
            </motion.div>
            <div>
              <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 24, fontWeight: 600, color: '#16181d', margin: 0, lineHeight: 1.2 }}>
                Mistake Notebook
              </h1>
              <div style={{ marginTop: 4, color: '#565a63', fontSize: 13, lineHeight: 1.6 }}>
                Your missed questions auto-save here. Adding an explanation is <b>optional</b>, but it helps you avoid repeating the same mistake.
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats bar + filter pills ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 12,
                background: 'rgba(2,132,199,.08)', color: '#0284c7',
                fontSize: 12, fontWeight: 600,
              }}
            >
              {filtered.length} mistake{filtered.length !== 1 ? 's' : ''}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 12,
                background: 'rgba(16,185,129,.08)', color: '#047857',
                fontSize: 12, fontWeight: 600,
              }}
            >
              {solvedIds.size} validated
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.25 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 12,
                background: dueCount > 0 ? 'rgba(239,68,68,.08)' : 'rgba(138,143,152,.08)',
                color: dueCount > 0 ? '#dc2626' : '#565a63',
                fontSize: 12, fontWeight: 600,
              }}
            >
              {dueCount} due
            </motion.span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterDue(false)}
              style={{
                padding: '6px 16px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                border: filterDue ? '1.5px solid #e4e0d5' : 'none',
                background: !filterDue ? '#0284c7' : '#fff',
                color: !filterDue ? '#fff' : '#3f434b',
                cursor: 'pointer', transition: 'all .2s ease',
                boxShadow: !filterDue ? '0 1px 3px rgba(22,24,29,.06)' : '0 1px 3px rgba(0,0,0,.04)',
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilterDue(true)}
              style={{
                padding: '6px 16px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                border: !filterDue ? '1.5px solid #e4e0d5' : 'none',
                background: filterDue ? '#0284c7' : '#fff',
                color: filterDue ? '#fff' : '#3f434b',
                cursor: 'pointer', transition: 'all .2s ease',
                boxShadow: filterDue ? '0 1px 3px rgba(22,24,29,.06)' : '0 1px 3px rgba(0,0,0,.04)',
              }}
            >
              Due now ({dueCount})
            </button>
          </div>
        </motion.div>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              maxWidth: 480, margin: '60px auto', textAlign: 'center',
              padding: '48px 32px', borderRadius: 12,
              background: '#fff',
              border: '1.5px solid rgba(16,185,129,.15)',
              boxShadow: '0 1px 3px rgba(22,24,29,.06)',
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 12,
              background: '#10b981',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(22,24,29,.06)',
              marginBottom: 16,
            }}>
              <Icon name="check" size={28} style={{ color: '#fff' }} />
            </div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 18, color: '#16181d', marginBottom: 8 }}>
              {filterDue ? 'Nothing due right now' : 'No mistakes yet'}
            </div>
            <div style={{ color: '#565a63', fontSize: 14, lineHeight: 1.7 }}>
              {filterDue
                ? "You're all caught up! Check back later or switch to All to review previous mistakes."
                : 'Take a Pre Test or optional Skill Builder test. Any missed questions will appear here for review.'}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="mistake-list"
                variants={listStagger}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                {filtered.map((m) => {
                  const k = `${m.test_id}:${m.section}:${m.q_num}`
                  const cfg = getTestConfig(m.test_id) || { label: m.test_id }
                  const secLabel = getExamConfigForTest(m.test_id)?.modules?.[m.section]?.label || m.section
                  const dueAt = reviewItems?.[k]?.due_at
                  const dueSoon = dueAt && new Date(dueAt).getTime() <= Date.now()
                  const solved = solvedIds.has(m.id)
                  return (
                    <motion.button
                      key={m.id}
                      variants={listItem}
                      whileHover={{ y: -2, boxShadow: '0 1px 3px rgba(22,24,29,.06)', borderColor: '#0284c7' }}
                      onClick={() => setSelected(m)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '14px 16px',
                        border: solved
                          ? '1.5px solid rgba(16,185,129,.25)'
                          : '1.5px solid rgba(2,132,199,.12)',
                        borderLeft: solved
                          ? '3px solid #10b981'
                          : '1.5px solid rgba(2,132,199,.12)',
                        borderRadius: 12,
                        background: solved
                          ? 'rgba(16,185,129,.04)'
                          : '#fff',
                        cursor: 'pointer',
                        opacity: solved ? 0.75 : 1,
                        boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                        transition: 'all .2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            minWidth: 28, height: 28, borderRadius: 8,
                            background: solved
                              ? 'rgba(16,185,129,.12)'
                              : '#0284c7',
                            color: solved ? '#059669' : '#fff',
                            fontSize: 11, fontWeight: 600, flexShrink: 0,
                            padding: '0 6px',
                          }}>
                            Q{m.q_num}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: solved ? '#059669' : '#16181d' }}>
                              {solved ? '✓ ' : ''}{cfg.label} · {secLabel}
                            </div>
                            <div style={{ marginTop: 3, fontSize: 12, color: '#8a8f98', fontWeight: 500 }}>
                              {m.chapter_id ? `Ch ${m.chapter_id}` : 'No chapter'} · Your answer: <b style={{ color: '#565a63' }}>{String(m.given || '').trim() || 'Unanswered'}</b>
                            </div>
                          </div>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12,
                          background: solved
                            ? 'rgba(16,185,129,.1)'
                            : dueSoon ? 'rgba(239,68,68,.08)' : 'rgba(138,143,152,.06)',
                          color: solved ? '#059669' : (dueSoon ? '#dc2626' : '#8a8f98'),
                          flexShrink: 0,
                        }}>
                          {solved ? 'DONE' : (dueSoon ? 'DUE' : '—')}
                        </span>
                      </div>
                    </motion.button>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div
                key="mistake-detail"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ overflow: 'visible' }}
              >
                {/* Nav bar */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14,
                  background: '#fff', border: '1.5px solid rgba(2,132,199,.12)', borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(22,24,29,.06)', padding: '12px 16px',
                }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" onClick={() => setSelected(null)}>
                      <Icon name="back" size={16} />
                      Back to list
                    </button>
                    <Link className="btn btn-outline" to={viewHref('/dashboard')}>
                      <Icon name="home" size={16} />
                      Dashboard
                    </Link>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: 28, height: 28, borderRadius: 8,
                      background: '#0284c7',
                      color: '#fff', fontSize: 11, fontWeight: 600, padding: '0 6px',
                    }}>Q{selected.q_num}</span>
                    <span style={{ fontWeight: 600, color: '#16181d', fontSize: 14 }}>
                      {selectedCfg?.label || selected.test_id} · {selectedModule?.label || selected.section}
                    </span>
                  </div>
                  {selectedCfg?.cbUrl && (
                    <a className="btn btn-outline" href={`${selectedCfg.cbUrl}#page=${resolvedPdfTarget.pageIndex + 1}`} target="_blank" rel="noreferrer">
                      Open {selectedCfg.cbLabel || 'test'} on College Board ↗
                    </a>
                  )}
                </div>

                {/* Answer box - sticky at page level, outside any overflow container */}
                <div style={{
                  position: 'sticky', top: 0, zIndex: 20,
                  background: '#fff',
                  borderRadius: 12,
                  border: '1.5px solid rgba(2,132,199,.18)',
                  boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                  marginBottom: 14,
                  padding: '18px 20px',
                }}>
                  {answerPanel}
                </div>

                {/* Question source — the test lives on the College Board site */}
                <div style={{
                  border: '1.5px solid rgba(2,132,199,.12)', borderRadius: 12, background: 'white',
                  boxShadow: '0 1px 3px rgba(22,24,29,.06)', padding: '18px 20px',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#0284c7', marginBottom: 8 }}>
                    Official College Board Test
                  </div>
                  <div style={{ fontWeight: 600, color: '#16181d', fontSize: 16, marginBottom: 6 }}>
                    {selectedCfg?.cbLabel || selectedCfg?.label || selected.test_id}
                  </div>
                  <div style={{ color: '#565a63', fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
                    Open the test in another tab and find <b>{selectedModule?.label || selected.section} · Q{selected.q_num}</b> on
                    page <b>{resolvedPdfTarget.pageIndex + 1}</b> of the PDF, then redo the question using the answer box above.
                  </div>
                  {selectedCfg?.cbUrl ? (
                    <a
                      className="btn btn-primary"
                      href={`${selectedCfg.cbUrl}#page=${resolvedPdfTarget.pageIndex + 1}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open to page {resolvedPdfTarget.pageIndex + 1} ↗
                    </a>
                  ) : (
                    <div style={{ color: '#8a8f98', fontSize: 12 }}>Test link unavailable for this item.</div>
                  )}
                  <div style={{ marginTop: 12, fontSize: 12, color: '#8a8f98', lineHeight: 1.6 }}>
                    If the PDF doesn't jump to the page automatically, scroll to page {resolvedPdfTarget.pageIndex + 1}.
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#8a8f98', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Optional explanation (save what you learned)</div>
                    <textarea
                      value={selected.note || ''}
                      onChange={(e) => setSelected(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Write 2–4 sentences: what you missed, what the question was testing, and the exact rule/step you'll use next time."
                      readOnly={isAdminPreview}
                      style={{
                        width: '100%',
                        minHeight: 110,
                        padding: 12,
                        borderRadius: 12,
                        border: '1.5px solid rgba(2,132,199,.12)',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'DM Sans, system-ui, -apple-system, Segoe UI, sans-serif',
                        fontSize: 13,
                        lineHeight: 1.6
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                      <div style={{ color: '#8a8f98', fontSize: 12 }}>
                        Tip: Avoid "I'll be more careful." Write the specific method you'll apply.
                      </div>
                      <button
                        className="btn"
                        style={{ background: '#0284c7', color: 'white', fontWeight: 600, borderRadius: 10, boxShadow: '0 1px 3px rgba(22,24,29,.06)' }}
                        disabled={isAdminPreview || savingId === selected.id}
                        onClick={async () => {
                          if (isAdminPreview) return
                          setSavingId(selected.id)
                          try {
                            await updateMistakeNote(viewUserId, selected.id, selected.note || '')
                            setItems(prev => (prev || []).map(m => m.id === selected.id ? { ...m, note: selected.note || '' } : m))
                          } catch (e) {
                            alert(e?.message || 'Could not save your note. Please try again.')
                          } finally {
                            setSavingId(null)
                          }
                        }}
                      >
                        {isAdminPreview ? 'Preview only' : savingId === selected.id ? 'Saving…' : 'Save note'}
                      </button>
                    </div>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
