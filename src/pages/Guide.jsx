import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { freeResponseMatches } from '../data/testData.js'
import { getStudiedTopics, setStudiedTopic, setChapterGuidePractice, markChapterGuideStarted } from '../lib/studyProgress.js'
import BrandLink from '../components/BrandLink.jsx'
import Icon from '../components/AppIcons.jsx'
import TopResourceNav from '../components/TopResourceNav.jsx'
import { getChaptersForExam, getGuideContentForExam } from '../data/examData.js'
import { useToast } from '../components/Toast.jsx'
import { resolveViewContext, withExam, withViewUser } from '../lib/viewAs.js'
import { getInitialPreferredExam } from '../lib/examChoice.js'
import { buildQuestionHintLadder } from '../lib/questionHints.js'
import { hasUnlockedResources } from '../lib/pretestGate.js'
import Sidebar from '../components/Sidebar.jsx'
import LessonPlayer from '../components/LessonPlayer.jsx'
import SAT_LESSON_CONTENT from '../data/satLessonContent.js'

/* Navbar removed — using Sidebar */

const cardStaggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045 } },
}
const cardFadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function DomainList({ domains, selectedId, onSelect, completedMap, practiceByChapter, guideContent, lessonData, onOpenLesson }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Object.entries(domains).map(([domain, chs]) => (
        <div key={domain}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8, background: '#16181d', padding: '8px 14px', borderRadius: 8 }}>
            {domain}
          </div>
          <motion.div
            variants={cardStaggerContainer}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              alignItems: 'stretch',
              gap: 10,
            }}
          >
            {chs.map(ch => {
              const hasGuide = Boolean(guideContent?.[ch.id])
              const done = Boolean(completedMap[ch.id])
              const practice = practiceByChapter?.[ch.id] || {}
              const guideMap = extractGuideMap(practice)
              const correctCount = Object.values(guideMap || {}).filter(Boolean).length
              const started = Boolean(practice?.meta?.guide_started_at) || Object.keys(guideMap || {}).length > 0
              const inProgress = !done && started
              const status = done ? 'Completed' : inProgress ? 'In progress' : 'Not started'
              const statusColor = done ? '#10b981' : inProgress ? '#f59e0b' : '#ef4444'
              const statusBg = done ? 'rgba(16,185,129,.10)' : inProgress ? 'rgba(245,158,11,.12)' : 'rgba(239,68,68,.10)'
              const statusBorder = done ? 'rgba(16,185,129,.25)' : inProgress ? 'rgba(245,158,11,.35)' : 'rgba(239,68,68,.25)'
              return (
                <motion.button
                  key={ch.id}
                  variants={cardFadeUp}
                  onClick={() => onSelect(ch.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: selectedId === ch.id ? '2px solid #f59e0b' : `1.5px solid ${statusBorder}`,
                    borderLeft: selectedId === ch.id ? '4px solid #0284c7' : `3px solid ${done ? '#10b981' : inProgress ? '#f59e0b' : 'transparent'}`,
                    background: hasGuide ? statusBg : 'white',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    height: '100%',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 600, color: '#16181d', flex: '1 1 auto', minWidth: 0, overflowWrap: 'anywhere', lineHeight: 1.25 }}>
                      {(ch.code || ch.id)}: {ch.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {hasGuide && (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: 999,
                          background: 'rgba(255,255,255,.7)',
                          border: `1px solid ${statusBorder}`,
                          color: statusColor,
                          whiteSpace: 'nowrap',
                        }}>
                          {status}
                        </span>
                      )}
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 999,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: done ? 'rgba(16,185,129,.12)' : inProgress ? 'rgba(245,158,11,.14)' : hasGuide ? 'rgba(239,68,68,.12)' : 'rgba(138,143,152,.12)',
                          color: done ? '#10b981' : inProgress ? '#f59e0b' : hasGuide ? '#ef4444' : '#8a8f98',
                        }}
                      >
                        <Icon name={done ? 'check' : inProgress ? 'clock' : hasGuide ? 'warning' : 'task'} size={14} />
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: '#565a63' }}>{ch.domain}{ch.page ? ` · Guide p.${ch.page}` : ''}</div>
                  <div style={{ marginTop: 'auto', paddingTop: 8, fontSize: 11, color: hasGuide ? '#10b981' : '#8a8f98', fontWeight: 600 }}>
                    {hasGuide ? 'Full guide + practice' : 'Guide coming soon'}
                  </div>
                  {hasGuide && (
                    <div style={{ marginTop: 8, fontSize: 11, color: '#565a63', fontWeight: 600 }}>
                      Practice: {Math.min(25, correctCount)}/25 correct
                    </div>
                  )}
                  {lessonData?.[ch.id] && (
                    <div
                      onClick={(e) => { e.stopPropagation(); onOpenLesson(ch.id) }}
                      style={{
                        marginTop: 8,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 12px',
                        borderRadius: 999,
                        background: 'rgba(2,132,199,.10)',
                        border: '1px solid rgba(2,132,199,.25)',
                        color: '#0284c7',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background .15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(2,132,199,.18)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(2,132,199,.10)' }}
                    >
                      <span style={{ fontSize: 10, lineHeight: 1 }}>&#9654;</span>
                      AI Lesson
                    </div>
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        </div>
      ))}
    </div>
  )
}

function hashString(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function seededShuffle(arr, seed) {
  const out = arr.slice()
  let x = seed || 1
  for (let i = out.length - 1; i > 0; i--) {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5
    const j = Math.abs(x) % (i + 1)
    const tmp = out[i]; out[i] = out[j]; out[j] = tmp
  }
  return out
}

function extractGuideMap(practice) {
  if (!practice || typeof practice !== 'object') return {}
  if (practice.guide && typeof practice.guide === 'object') return practice.guide
  // Legacy format: practice stored directly as { [idx]: true } (numeric keys).
  const keys = Object.keys(practice || {})
  const looksLikeLegacy = keys.length > 0 && keys.every(k => /^\d+$/.test(String(k)))
  if (looksLikeLegacy) return practice
  // If the row only has test metadata (ex: practice.test.correct/total), that does NOT mean the guide is in progress.
  return {}
}

const SUPER_CHAR_MAP = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁺': '+',
  '⁻': '-',
  '⁼': '=',
  '⁽': '(',
  '⁾': ')',
  'ⁿ': 'n',
  'ᵃ': 'a',
  'ᵇ': 'b',
  'ᶜ': 'c',
  'ᵈ': 'd',
  'ᵉ': 'e',
  'ᶠ': 'f',
  'ᵍ': 'g',
  'ʰ': 'h',
  'ᶦ': 'i',
  'ʲ': 'j',
  'ᵏ': 'k',
  'ˡ': 'l',
  'ᵐ': 'm',
  'ᵒ': 'o',
  'ᵖ': 'p',
  'ʳ': 'r',
  'ˢ': 's',
  'ᵗ': 't',
  'ᵘ': 'u',
  'ᵛ': 'v',
  'ʷ': 'w',
  'ˣ': 'x',
  'ʸ': 'y',
  'ᶻ': 'z',
}
const SUPER_CHAR_RE = /[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ]+/g

function toSuperscriptText(raw) {
  return String(raw || '')
    .split('')
    .map(ch => SUPER_CHAR_MAP[ch] || ch)
    .join('')
}

function sanitizeGuideDisplayText(raw) {
  return String(raw || '')
    .replaceAll('✅', 'Right:')
    .replaceAll('❌', 'Wrong:')
    .replaceAll('✓', ' (checks out)')
}

function renderStudyMathLine(line, keyPrefix = 'study') {
  const nodes = []
  const tokenRe = /\^\([^)]+\)|\^[A-Za-z0-9.+\-\/]+|[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ]+/g
  let last = 0
  let idx = 0
  let match
  while ((match = tokenRe.exec(line)) !== null) {
    if (match.index > last) nodes.push(line.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('^')) {
      nodes.push(
        <sup key={`${keyPrefix}-exp-${idx++}`} className="study-exp">
          {token.slice(1)}
        </sup>
      )
    } else {
      nodes.push(
        <sup key={`${keyPrefix}-sup-${idx++}`} className="study-exp">
          {toSuperscriptText(token)}
        </sup>
      )
    }
    last = tokenRe.lastIndex
  }
  if (last < line.length) nodes.push(line.slice(last))
  return nodes
}

function renderStudyMathText(text, keyPrefix = 'study') {
  const lines = sanitizeGuideDisplayText(text).split('\n')
  return lines.map((line, idx) => (
    <span key={`${keyPrefix}-line-${idx}`}>
      {renderStudyMathLine(line, `${keyPrefix}-${idx}`)}
      {idx < lines.length - 1 ? <br /> : null}
    </span>
  ))
}

function PracticeProblem({ problem, idx, onAnswered, answered, concepts, exam, chapter }) {
  const [choice, setChoice] = useState(null)
  const [text, setText] = useState('')
  const [show, setShow] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [hintStep, setHintStep] = useState(0)

  useEffect(() => {
    setChoice(null)
    setText('')
    setShow(false)
    setReveal(false)
    setHintStep(0)
  }, [problem?.q])

  const isMC = Boolean(problem?.choices)
  const correctOrig = String(problem?.correct || '').toUpperCase()
  const qSeed = hashString(`${problem?.q || ''}::${idx}`)

  const shuffledChoices = useMemo(() => {
    if (!isMC) return null
    const original = Object.entries(problem.choices || {}) // [['A','text'],...]
    const order = seededShuffle(original, qSeed)
    const labels = ['A', 'B', 'C', 'D']
    const mapped = order.map(([origKey, text], i) => ({ label: labels[i], origKey, text }))
    const correctLabel = mapped.find(m => m.origKey === correctOrig)?.label || null
    return { mapped, correctLabel }
  }, [isMC, problem?.q])

  const isCorrect = show && (
    isMC
      ? (choice && shuffledChoices?.correctLabel && choice === shuffledChoices.correctLabel)
      : (text.trim().length > 0 && freeResponseMatches(text, problem?.correct))
  )
  const ladder = useMemo(() => buildQuestionHintLadder({
    exam,
    section: chapter?.sectionId || chapter?.subject || '',
    qNum: idx + 1,
    isMC,
    chapterName: chapter?.name || '',
    chapterCode: chapter?.code || '',
    concepts,
    questionText: problem?.q || '',
  }), [exam, chapter, concepts, idx, isMC, problem?.q])

  return (
    <div className={show ? (isCorrect ? 'answer-feedback-correct' : 'answer-feedback-wrong') : ''} style={{ border: '1px solid #e4e0d5', borderRadius: 12, padding: 14, background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div style={{ fontWeight: 600, color: '#16181d' }}>
          {problem?.mode === 'redo' ? `Mastery Redo ${problem?.redoIndex || 1}` : `Core Problem ${idx + 1}`}
        </div>
        <div style={{ fontSize: 12, color: answered ? '#10b981' : '#8a8f98', fontWeight: 600 }}>
          {answered ? 'Completed' : 'Not completed'}
        </div>
      </div>
      <div className="study-rich-text" style={{ fontSize: 13, lineHeight: 1.65, color: '#16181d', whiteSpace: 'pre-line' }}>
        {renderStudyMathText(problem?.q, `practice-q-${idx}`)}
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: '#8a8f98' }}>
        Pick your answer, then click <b>Check</b> to submit it.
      </div>
      {isMC && (
        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          {(shuffledChoices?.mapped || []).map(({ label, text }) => (
            <button
              key={label}
              onClick={() => {
                setChoice(label)
                // Require clicking "Check" to evaluate (changing the choice should clear prior feedback).
                setShow(false)
                setReveal(false)
                setHintStep(0)
              }}
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 10,
                border: choice === label ? '2px solid #16181d' : '1px solid #e4e0d5',
                background: '#f7f5ef',
                cursor: 'pointer',
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              <span style={{ fontWeight: 600, marginRight: 8 }}>{label}.</span> <span className="study-rich-text">{renderStudyMathText(text, `choice-${idx}-${label}`)}</span>
            </button>
          ))}
        </div>
      )}
      {!isMC && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: '#565a63', marginBottom: 8 }}>
            Open response: enter only the value/expression. Equivalent answers count, including fractions and comma-formatted numbers. Examples: <code>75</code>, <code>1/2</code>, <code>0.5</code>, <code>15,000</code>, <code>pi</code>, <code>3*pi/2</code>, <code>2^3</code>.
          </div>
          <input
            type="text"
            className="free-response-input"
            placeholder="Your answer"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              // Require clicking "Check" to evaluate.
              setShow(false)
              setReveal(false)
              setHintStep(0)
            }}
            autoComplete="off"
          />
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
        <button
          className="btn btn-primary"
          style={{ padding: '8px 14px', fontSize: 13 }}
          onClick={() => {
            if (isMC && !choice) return
            if (!isMC && !text.trim()) return
            const ok = isMC ? (choice === shuffledChoices?.correctLabel) : freeResponseMatches(text, problem?.correct)
            setShow(true)
            setHintStep(0)
            if (ok) onAnswered(true)
          }}
        >
          Check (submit) →
        </button>
        {show && !isCorrect && (
          <button
            className="btn btn-outline"
            style={{ padding: '8px 14px', fontSize: 13 }}
            onClick={() => { setChoice(null); setShow(false); setReveal(false) }}
          >
            Try again
          </button>
        )}
        {show && (
          <div style={{ fontSize: 12, fontWeight: 600, color: isCorrect ? '#10b981' : '#ef4444' }}>
            {isCorrect ? 'Correct' : 'Not quite'}
          </div>
        )}
      </div>
      {show && !isCorrect && (
        <div style={{ marginTop: 10, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: 12, fontSize: 13, lineHeight: 1.65, color: '#7c2d12' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Hint ladder (no answer given)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className="btn btn-outline"
                style={{ padding: '7px 12px', fontSize: 12 }}
                onClick={() => setHintStep(s => Math.max(s, n))}
              >
                Hint {n}
              </button>
            ))}
            <button
              className="btn btn-outline"
              style={{ padding: '7px 12px', fontSize: 12 }}
              onClick={() => setReveal(true)}
              title="This explanation may reveal the correct answer—use after you've tried the hints."
            >
              Reveal explanation
            </button>
          </div>
          <ul style={{ marginLeft: 18 }}>
            {ladder.slice(0, hintStep).map((h, i) => <li key={i} style={{ marginBottom: 6 }}>{h}</li>)}
            {hintStep === 0 && <li style={{ marginBottom: 6 }}>Start with Hint 1.</li>}
          </ul>
        </div>
      )}
      {(reveal || isCorrect) && (
        <div style={{ marginTop: 10, background: '#f7f5ef', border: '1px solid #e4e0d5', borderRadius: 10, padding: 12, fontSize: 13, lineHeight: 1.6, color: '#3f434b' }}>
          <strong>Explanation:</strong> <span className="study-rich-text">{renderStudyMathText(problem?.exp, `exp-${idx}`)}</span>
        </div>
      )}
    </div>
  )
}

export default function Guide() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const requestedExam = useMemo(() => String(new URLSearchParams(location.search || '').get('exam') || '').toLowerCase(), [location.search])
  const exam = requestedExam === 'sat' ? requestedExam : getInitialPreferredExam(user)
  const chapters = useMemo(() => getChaptersForExam(exam), [exam])
  const guideContent = useMemo(() => getGuideContentForExam(exam), [exam])
  const { viewUserId, isAdminPreview } = useMemo(
    () => resolveViewContext({ userId: user?.id, profile, search: location.search }),
    [user?.id, profile, location.search]
  )
  const fromParam = useMemo(() => new URLSearchParams(location.search).get('from') || '', [location.search])
  const addToast = useToast()
  const [selectedId, setSelectedId] = useState(null)
  const [completedMap, setCompletedMap] = useState({})
  const [practiceByChapter, setPracticeByChapter] = useState({})
  const [lessonChapter, setLessonChapter] = useState(null)
  const lessonData = SAT_LESSON_CONTENT
  const viewHref = (path) => withViewUser(withExam(path, exam), viewUserId, isAdminPreview)
  const satHref = withViewUser(withExam('/dashboard', 'sat'), viewUserId, isAdminPreview)
  const showResourceNav = hasUnlockedResources(viewUserId, exam)

  useEffect(() => {
    const sp = new URLSearchParams(location.search || '')
    const id = sp.get('chapter')
    if (id && chapters[id]) setSelectedId(id)
  }, [location.search, chapters])

  useEffect(() => {
    if (!viewUserId) return
    getStudiedTopics(viewUserId).then(({ map, practiceByChapter }) => {
      setCompletedMap(map || {})
      setPracticeByChapter(practiceByChapter || {})
    })
  }, [viewUserId])

  useEffect(() => {
    if (!viewUserId || !selectedId || isAdminPreview) return
    const existingPractice = practiceByChapter?.[selectedId] || {}
    if (existingPractice?.meta?.guide_started_at) return
    // Mark the chapter as "started" so the dashboard list reflects In progress only after opening it.
    markChapterGuideStarted(viewUserId, selectedId, existingPractice).catch(() => {})
    setPracticeByChapter(prev => {
      const base = prev?.[selectedId] && typeof prev[selectedId] === 'object' ? prev[selectedId] : {}
      const meta = base.meta && typeof base.meta === 'object' ? base.meta : {}
      return { ...(prev || {}), [selectedId]: { ...base, meta: { ...meta, guide_started_at: new Date().toISOString() } } }
    })
  }, [viewUserId, selectedId, isAdminPreview])

  const domains = useMemo(() => {
    const grouped = {}
    Object.entries(chapters).forEach(([id, ch]) => {
      if (!grouped[ch.domain]) grouped[ch.domain] = []
      grouped[ch.domain].push({ id, ...ch })
    })
    for (const k of Object.keys(grouped)) grouped[k].sort((a, b) => String(a.id).localeCompare(String(b.id)))
    return grouped
  }, [chapters])

  const ch = selectedId ? chapters[selectedId] : null
  const content = selectedId ? guideContent[selectedId] : null
  const selectedLabel = ch?.code || selectedId
  const problems = content?.problems || []
  const expandedProblems = useMemo(() => {
    if (!problems.length) return []
    const out = []
    for (let i = 0; i < 25; i++) {
      const base = problems[i % problems.length]
      out.push({
        ...base,
        mode: i < problems.length ? 'core' : 'redo',
        redoIndex: i >= problems.length ? (i - problems.length + 1) : null,
      })
    }
    return out
  }, [problems])
  const corePracticeCount = Math.min(25, problems.length)
  const masteryRedoCount = Math.max(0, expandedProblems.length - corePracticeCount)

  // Auto-mark chapter complete when all 25 practice questions are answered correctly
  useEffect(() => {
    if (!selectedId || !viewUserId || isAdminPreview || completedMap[selectedId]) return
    const practice = practiceByChapter[selectedId] || {}
    const guideMap = {}
    for (const [k, v] of Object.entries(practice)) {
      if (k === 'meta') continue
      const idx = Number(k)
      if (Number.isFinite(idx) && v === true) guideMap[idx] = true
    }
    const allCorrect = expandedProblems.length > 0 && expandedProblems.every((_, i) => Boolean(guideMap[i]))
    if (allCorrect) {
      const updated = { ...completedMap, [selectedId]: true }
      setCompletedMap(updated)
      setStudiedTopic(viewUserId, selectedId, true).catch(() => {})
      if (addToast) {
        const chData = chapters?.[selectedId]
        addToast(`${chData?.name || 'Chapter'} — auto-completed!`, 'success')
      }
    }
  }, [selectedId, practiceByChapter, expandedProblems, completedMap, viewUserId, isAdminPreview])

  const completedCount = Object.values(completedMap).filter(Boolean).length
  const totalChapters = Object.keys(chapters).length
  const pct = Math.round((completedCount / Math.max(1, totalChapters)) * 100)
  const selectedPractice = selectedId ? (practiceByChapter[selectedId] || {}) : {}
  const selectedGuideMap = selectedId ? extractGuideMap(selectedPractice) : {}

  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />
      <div className="page fade-up">
        {isAdminPreview && (
          <div className="card" style={{ marginBottom: 16, background: '#16181d', color: 'white' }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Admin View</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.88 }}>
              You're viewing this student's Study Guide in read-only mode, so their progress won't change while you troubleshoot.
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
	          <div>
	            <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 600, color: '#16181d', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="guide" size={20} />
                Study Guide
              </h1>
	            <div style={{ color: '#565a63', marginTop: 4, fontSize: 13 }}>
	              Work through chapters, complete practice, and mark each one done. To mark one complete, you must get all 25 practice questions correct.
	            </div>
	          </div>
          <div style={{ background: 'white', border: '1px solid #e4e0d5', borderRadius: 12, padding: '12px 14px', minWidth: 280 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#16181d', fontWeight: 600 }}>
              <span>Progress</span>
              <span style={{ color: '#0284c7' }}>{completedCount}/{totalChapters}</span>
            </div>
            <div style={{ height: 8, background: '#f3f0e9', borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: '#10b981', transition: 'width .6s ease' }} />
            </div>
            <div style={{ fontSize: 12, color: '#8a8f98', marginTop: 8 }}>{pct}% of chapters completed</div>
          </div>
        </div>

        {!selectedId ? (
          <DomainList domains={domains} selectedId={selectedId} onSelect={setSelectedId} completedMap={completedMap} practiceByChapter={practiceByChapter} guideContent={guideContent} lessonData={lessonData} onOpenLesson={setLessonChapter} />
        ) : (
          <div>
            <button onClick={() => setSelectedId(null)} className="btn btn-outline" style={{ marginBottom: 14 }}>
              ← Back to Study Guide
            </button>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 600, color: '#16181d' }}>
                    Chapter {selectedLabel}: {ch?.name}
                  </div>
                  <div style={{ marginTop: 6, color: '#565a63', fontSize: 13 }}>{ch?.domain}{ch?.page ? ` · Guide p.${ch?.page}` : ''}</div>
                  {lessonData?.[selectedId] && (
                    <button
                      onClick={() => setLessonChapter(selectedId)}
                      style={{
                        marginTop: 8,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 14px',
                        borderRadius: 999,
                        background: 'rgba(2,132,199,.10)',
                        border: '1px solid rgba(2,132,199,.30)',
                        color: '#0284c7',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background .15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(2,132,199,.18)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(2,132,199,.10)' }}
                    >
                      <span style={{ fontSize: 11, lineHeight: 1 }}>&#9654;</span>
                      AI Lesson
                    </button>
                  )}
                </div>
	                {(() => {
	                  const allCorrect = expandedProblems.length > 0 && expandedProblems.every((_, i) => Boolean(selectedGuideMap[i]))
	                  return (
	                <button
	                  className="btn"
	                  disabled={isAdminPreview || (!allCorrect && !completedMap[selectedId])}
                  style={{
                    opacity: (isAdminPreview || (!allCorrect && !completedMap[selectedId])) ? .6 : 1,
                    cursor: (isAdminPreview || (!allCorrect && !completedMap[selectedId])) ? 'not-allowed' : 'pointer',
                    background: completedMap[selectedId] ? '#10b981' : '#f59e0b',
                    color: '#16181d',
                    fontWeight: 600
                  }}
                  onClick={async () => {
                    if (isAdminPreview) return
                    const next = !completedMap[selectedId]
                    if (next && !allCorrect) return
                    const updated = { ...completedMap, [selectedId]: next }
                    setCompletedMap(updated)
                    await setStudiedTopic(viewUserId, selectedId, next)
                    if (next && addToast) {
                      const ch = chapters?.[selectedId]
                      const label = ch?.name || `Chapter ${selectedId}`
                      addToast(`${label} — completed!`, 'success')
                      // Navigate back to entry point if specified
                      if (fromParam === 'dashboard' || fromParam === 'tasks') {
                        setTimeout(() => navigate(fromParam === 'tasks' ? '/tasks' : viewHref('/dashboard')), 800)
                      }
                    }
                  }}
                >
                  {isAdminPreview ? 'Preview only' : completedMap[selectedId] ? 'Marked Complete' : 'Mark Chapter Complete'}
                </button>
                  )
                })()}
              </div>
            </div>

            {!content ? (
              <div className="card" style={{ padding: 18, color: '#565a63' }}>
                This chapter guide isn't available yet.
              </div>
            ) : (
              <>
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, marginBottom: 10, color: '#16181d' }}>Guide</div>
                  <div className="study-rich-text" style={{ color: '#3f434b', lineHeight: 1.9, fontSize: 15, whiteSpace: 'pre-line', fontFamily: 'ui-serif, Charter, Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
                    {renderStudyMathText(content.intro, `intro-${selectedId}`)}
                  </div>
                  <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                    {(content.concepts || []).map((c, i) => (
                      <div key={i} style={{ border: '1px solid #e4e0d5', borderRadius: 12, padding: 14, background: '#f7f5ef' }}>
                        <div style={{ fontWeight: 600, color: '#16181d', marginBottom: 6 }}>{c.title}</div>
                        <div className="study-rich-text" style={{ color: '#3f434b', lineHeight: 1.85, fontSize: 14, fontFamily: 'ui-serif, Charter, Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
                          {renderStudyMathText(c.body, `concept-${selectedId}-${i}`)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

	                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
	                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 16, fontWeight: 600, color: '#16181d', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name="target" size={18} />
                      Practice Problems
                    </div>
	                  <div style={{ fontSize: 12, color: '#565a63', fontWeight: 600 }}>
	                    {Object.values(selectedGuideMap || {}).filter(Boolean).length}/{expandedProblems.length} correct
	                  </div>
	                </div>
	                <div className="card" style={{ marginBottom: 12, background: '#f7f5ef', borderStyle: 'dashed' }}>
	                  <div style={{ fontWeight: 600, color: '#16181d', marginBottom: 6 }}>How many to do in this chapter</div>
	                  <div style={{ fontSize: 13, color: '#3f434b', lineHeight: 1.7 }}>
	                    Complete <b>25 core questions</b> to reach the full <b>25/25</b> target to lock the skill in before the chapter counts as complete.
	                  </div>
	                </div>
	                <div style={{ display: 'grid', gap: 12 }}>
	                  {expandedProblems.map((p, idx) => (
	                    <PracticeProblem
                      key={idx}
	                      idx={idx}
	                      problem={p}
	                      concepts={content.concepts}
                        exam={exam}
                        chapter={ch}
	                      answered={Boolean(selectedGuideMap[idx])}
	                      onAnswered={async (correct) => {
	                        if (isAdminPreview) return
	                        if (!correct) return
	                        const existingPractice = practiceByChapter[selectedId] || {}
	                        const existingGuide = extractGuideMap(existingPractice)
	                        const nextGuide = { ...existingGuide, [idx]: true }
	                        const nextPractice = { ...(existingPractice && typeof existingPractice === 'object' ? existingPractice : {}), guide: nextGuide }
	                        setPracticeByChapter(prev => ({ ...prev, [selectedId]: nextPractice }))
	                        await setChapterGuidePractice(viewUserId, selectedId, nextGuide, existingPractice)
	                      }}
	                    />
	                  ))}
	                </div>
	              </>
	            )}
          </div>
        )}
      </div>

      {/* AI Lesson modal overlay */}
      {lessonChapter && lessonData?.[lessonChapter] && (
        <div
          onClick={() => setLessonChapter(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'lessonModalFadeIn .2s ease',
          }}
        >
          <style>{`
            @keyframes lessonModalFadeIn {
              from { opacity: 0 }
              to { opacity: 1 }
            }
          `}</style>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: 'white',
              borderRadius: 12,
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 1px 3px rgba(22,24,29,.06)',
            }}
          >
            <button
              onClick={() => setLessonChapter(null)}
              style={{
                position: 'sticky',
                top: 12,
                float: 'right',
                marginRight: 12,
                marginTop: 12,
                width: 32,
                height: 32,
                borderRadius: 999,
                border: '1px solid #e4e0d5',
                background: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: '#565a63',
                fontWeight: 600,
                zIndex: 1,
                boxShadow: '0 1px 4px rgba(0,0,0,.08)',
              }}
              aria-label="Close lesson"
            >
              &times;
            </button>
            <div style={{ padding: 24 }}>
              <LessonPlayer title={lessonData[lessonChapter].title} slides={lessonData[lessonChapter].slides} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
