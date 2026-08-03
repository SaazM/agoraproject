import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { PDF_PAGE_MAP, answerMatches, isMultipleChoiceAnswer } from '../data/testData.js'
import { getTestConfig } from '../data/tests.js'
import { EXTRA_PDF_PAGE_MAPS } from '../data/extraPdfPageMaps.js'
import { getAnswerKeyBySection } from '../data/answerKeys.js'
import { saveMistakes, ensureReviewItems } from '../lib/mistakesStore.js'
import {
  calcWeakTopicsForTest,
  getChoiceOptionsForQuestion,
  getDefaultModuleTimeRemaining,
  getExamConfigForTest,
  scoreAttemptFromKey,
} from '../data/examData.js'

function Timer({ seconds, onExpire, onTick }) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const [hidden, setHidden] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    setTimeLeft(seconds)
    if (onTick) onTick(seconds)
  }, [seconds])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(intervalRef.current); onExpire(); return 0 }
        if (onTick) onTick(t - 1)
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [onExpire, onTick])

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const isWarning = timeLeft <= 300 // 5 min warning
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  return (
    <div className={`timer-display${isWarning ? ' warning' : ''}`} onClick={() => setHidden(h => !h)} title="Click to hide/show">
      <span className="timer-icon">Timer</span>
      {hidden ? '--:--' : formatted}
    </div>
  )
}

function BreakScreen({ nextModule, onContinue, modules }) {
  const TOTAL = 600
  const [breakTime, setBreakTime] = useState(TOTAL)
  const startRef = useRef(Date.now())

  useEffect(() => {
    let raf
    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000
      setBreakTime(Math.max(0, TOTAL - elapsed))
      if (elapsed < TOTAL) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const mins = Math.floor(breakTime / 60)
  const secs = Math.floor(breakTime % 60)
  const fraction = breakTime / TOTAL // 1 → 0

  // SVG ring params
  const SIZE = 260
  const STROKE = 10
  const R = (SIZE - STROKE) / 2
  const C = 2 * Math.PI * R // circumference
  const offset = C * (1 - fraction)

  // Color: green → yellow → red
  const ringColor = (() => {
    if (fraction > 0.5) {
      // green → yellow  (1.0 → 0.5)
      const t = (fraction - 0.5) / 0.5 // 1→0
      const r = Math.round(34 + (234 - 34) * (1 - t))
      const g = Math.round(197 + (179 - 197) * (1 - t))
      const b = Math.round(94 + (8 - 94) * (1 - t))
      return `rgb(${r},${g},${b})`
    }
    // yellow → red  (0.5 → 0)
    const t = fraction / 0.5 // 1→0
    const r = Math.round(239 + (234 - 239) * t)
    const g = Math.round(68 + (179 - 68) * t)
    const b = Math.round(68 + (8 - 68) * t)
    return `rgb(${r},${g},${b})`
  })()

  const timerColor = fraction > 0.33 ? '#16181d' : fraction > 0.15 ? '#b45309' : '#dc2626'
  const glowOpacity = fraction < 0.2 ? 0.35 : 0

  return (
    <div className="break-screen">
      <div className="break-panel">
        <div className="break-chip">Break Time</div>
        <div className="break-title">Section Break</div>
        <div className="break-sub">
          Take your 10-minute reset. Next up: <b>{modules?.[nextModule]?.label}</b> — {modules?.[nextModule]?.module}
        </div>

        {/* SVG countdown ring */}
        <div className="break-ring-wrap">
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="break-svg-ring">
            {/* Track */}
            <circle cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none" stroke="#e4e0d5" strokeWidth={STROKE} />
            {/* Glow layer for urgency */}
            {glowOpacity > 0 && (
              <circle cx={SIZE / 2} cy={SIZE / 2} r={R}
                fill="none" stroke="#ef4444" strokeWidth={STROKE + 6} opacity={glowOpacity}
                strokeDasharray={C} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', filter: 'blur(6px)' }} />
            )}
            {/* Progress arc */}
            <circle cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none" stroke={ringColor} strokeWidth={STROKE}
              strokeDasharray={C} strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke 0.8s ease' }} />
          </svg>
          <div className="break-timer" style={{ color: timerColor }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <div className="break-timer-label" style={{ color: timerColor, opacity: 0.5 }}>remaining</div>
        </div>

        <div className="break-tips">
          <div className="break-tip">Stand up and stretch</div>
          <div className="break-tip">Take a few deep breaths</div>
          <div className="break-tip">Grab some water</div>
        </div>

        <div className="break-actions">
          <button className="btn btn-primary break-continue-btn" onClick={onContinue}>
            Start Next Module
          </button>
        </div>
        <p className="break-footnote">You can wait for the timer or start early whenever you feel ready.</p>
      </div>
    </div>
  )
}

export default function TestTaking() {
  const { attemptId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [testConfig, setTestConfig] = useState(null)
  const [keyBySection, setKeyBySection] = useState(null)
  const [keyStatus, setKeyStatus] = useState({ loading: false, msg: '' })
  const [currentModule, setCurrentModule] = useState(null)
  const [currentQ, setCurrentQ] = useState(1)
  const [answers, setAnswers] = useState({}) // { rw_m1: { 1: 'A', 2: 'C', ... }, ... }
  const [markedForReview, setMarkedForReview] = useState({}) // { rw_m1: [2, 5], ... }
  const [moduleTimeLeft, setModuleTimeLeft] = useState({})
  const [timerLeft, setTimerLeft] = useState(null)
  const [showBreak, setShowBreak] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const saveTimer = useRef(null)
  const lastSaveAt = useRef(0)
  const pendingSave = useRef(null)
  const saveInFlight = useRef(false)

  // Tutors should not take tests — redirect to dashboard
  useEffect(() => {
    if (profile && profile.role === 'tutor') {
      navigate('/dashboard', { replace: true })
    }
  }, [profile, navigate])

  function readDraft() {
    try {
      const key = `agora_attempt_draft_v1:${attemptId}`
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  function writeLastOpen(next) {
    try {
      const key = `agora_last_open_v1:${attemptId}`
      localStorage.setItem(key, JSON.stringify({ attemptId, ...next, updated_at: new Date().toISOString() }))
    } catch {}
  }

  function readLastOpen() {
    try {
      const key = `agora_last_open_v1:${attemptId}`
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  const currentTestId = attempt?.test_id || testConfig?.id || 'pre_test'
  const examConfig = getExamConfigForTest(currentTestId)
  const moduleOrder = examConfig.moduleOrder || []
  const modules = examConfig.modules || {}

  useEffect(() => {
    if (!supabase || !user?.id) return
    let cancelled = false
    supabase.from('test_attempts').select('*').eq('id', attemptId).eq('user_id', user.id).single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          // Offline fallback: open the locally saved draft (answers + timing), but disable submit.
          const draft = readDraft()
          if (!draft) { navigate('/dashboard'); return }
          const cfg = getTestConfig(draft.test_id) || getTestConfig('pre_test')
          const cfgId = draft.test_id || cfg?.id || 'pre_test'
          const defaultModule = getExamConfigForTest(cfgId).moduleOrder[0]
          setAttempt({
            id: attemptId,
            user_id: user.id,
            test_id: cfgId,
            current_section: draft.current_section || defaultModule,
            answers: draft.answers || {},
            module_time_remaining: draft.module_time_remaining || getDefaultModuleTimeRemaining(cfgId),
            completed_at: null,
          })
          setTestConfig(cfg)
          const last = readLastOpen()
          const mod = last?.current_section || draft.current_section || defaultModule
          setCurrentModule(mod)
          setCurrentQ(Number(last?.current_q) || 1)
          setAnswers(draft.answers || {})
          setModuleTimeLeft(draft.module_time_remaining || getDefaultModuleTimeRemaining(cfgId))
          setLoading(false)
          return
        }
        if (data.completed_at) { navigate(`/results/${attemptId}`); return }
        setAttempt(data)
        const cfg = getTestConfig(data.test_id) || getTestConfig('pre_test')
        const defaultModule = getExamConfigForTest(data.test_id || cfg?.id || 'pre_test').moduleOrder[0]
        setTestConfig(cfg)
        const last = readLastOpen()
        const mod = last?.current_section || data.current_section || defaultModule
        setCurrentModule(mod)
        setCurrentQ(Number(last?.current_q) || 1)
        setAnswers(data.answers || {})
        setModuleTimeLeft(data.module_time_remaining || getDefaultModuleTimeRemaining(data.test_id || cfg?.id || 'pre_test'))
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        const draft = readDraft()
        if (!draft) {
          setLoading(false)
          navigate('/dashboard')
          return
        }
        const cfg = getTestConfig(draft.test_id) || getTestConfig('pre_test')
        const cfgId = draft.test_id || cfg?.id || 'pre_test'
        const defaultModule = getExamConfigForTest(cfgId).moduleOrder[0]
        setAttempt({
          id: attemptId,
          user_id: user.id,
          test_id: cfgId,
          current_section: draft.current_section || defaultModule,
          answers: draft.answers || {},
          module_time_remaining: draft.module_time_remaining || getDefaultModuleTimeRemaining(cfgId),
          completed_at: null,
        })
        setTestConfig(cfg)
        setCurrentModule(draft.current_section || defaultModule)
        setCurrentQ(1)
        setAnswers(draft.answers || {})
        setModuleTimeLeft(draft.module_time_remaining || getDefaultModuleTimeRemaining(cfgId))
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [attemptId, user?.id, navigate])

  useEffect(() => {
    if (!attempt?.test_id) return
    const cfg = getTestConfig(attempt.test_id) || getTestConfig('pre_test')
    const builtIn = getAnswerKeyBySection(cfg?.id)
    if (builtIn) {
      setKeyBySection(builtIn)
      setKeyStatus({ loading: false, msg: '' })
    } else {
      setKeyBySection(null)
      setKeyStatus({ loading: false, msg: 'Answer key is missing for this test build. Please contact the admin.' })
    }
  }, [attempt?.test_id])

  const saveProgress = useCallback(async (updatedAnswers, mod, timeRemaining) => {
    if (!attemptId || !supabase || !user?.id) return
    await supabase
      .from('test_attempts')
      .update({
        current_section: mod,
        answers: updatedAnswers,
        module_time_remaining: timeRemaining,
      })
      .eq('id', attemptId)
      .eq('user_id', user.id)
  }, [attemptId, user?.id])

  function writeLocalDraft(updatedAnswers, mod, timeRemaining) {
    try {
      const key = `agora_attempt_draft_v1:${attemptId}`
      localStorage.setItem(key, JSON.stringify({
        attemptId,
        test_id: attempt?.test_id || testConfig?.id || 'pre_test',
        current_section: mod,
        answers: updatedAnswers,
        module_time_remaining: timeRemaining,
        updated_at: new Date().toISOString(),
      }))
    } catch {}
  }

  async function flushSave() {
    if (!pendingSave.current || saveInFlight.current) return
    const payload = pendingSave.current
    pendingSave.current = null
    saveInFlight.current = true
    try {
      await saveProgress(payload.answers, payload.mod, payload.timeRemaining)
      lastSaveAt.current = Date.now()
    } catch {
      pendingSave.current = payload
    } finally {
      saveInFlight.current = false
      if (pendingSave.current) scheduleSave()
    }
  }

  function scheduleSave() {
    const minIntervalMs = 8000
    clearTimeout(saveTimer.current)
    const sinceLast = Date.now() - (lastSaveAt.current || 0)
    const wait = Math.max(500, minIntervalMs - sinceLast)
    saveTimer.current = setTimeout(() => flushSave(), wait)
  }

  function triggerSave(updatedAnswers, mod) {
    const timeRemaining = {
      ...(moduleTimeLeft || {}),
      [mod]: (timerLeft ?? moduleTimeLeft?.[mod]),
    }
    pendingSave.current = { answers: updatedAnswers, mod, timeRemaining }
    writeLocalDraft(updatedAnswers, mod, timeRemaining)
    scheduleSave()
  }

  function setAnswer(qNum, value) {
    const updated = {
      ...answers,
      [currentModule]: { ...(answers[currentModule] || {}), [qNum]: value }
    }
    setAnswers(updated)
    triggerSave(updated, currentModule)
  }

  useEffect(() => {
    writeLastOpen({ current_section: currentModule, current_q: currentQ })
  }, [currentModule, currentQ])

  useEffect(() => {
    return () => {
      clearTimeout(saveTimer.current)
      flushSave()
    }
  }, [])

  // Arrow key navigation between questions (left/right and up/down)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setCurrentQ(q => Math.max(1, q - 1))
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setCurrentQ(q => {
          const mod = modules[currentModule]
          return mod ? Math.min(mod.questions, q + 1) : q
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentModule, modules])

  function toggleMark(qNum) {
    setMarkedForReview(prev => {
      const list = prev[currentModule] || []
      return { ...prev, [currentModule]: list.includes(qNum) ? list.filter(q => q !== qNum) : [...list, qNum] }
    })
  }

  function shouldShowBreakBetween(fromModule, toModule) {
    return fromModule === 'rw_m2' && toModule === 'math_m1'
  }

  async function advanceModule() {
    const idx = moduleOrder.indexOf(currentModule)
    if (idx >= moduleOrder.length - 1) {
      await submitTest()
    } else {
      const nextMod = moduleOrder[idx + 1]
      if (shouldShowBreakBetween(currentModule, nextMod)) {
        setShowBreak(true)
      } else {
        setCurrentModule(nextMod)
        setCurrentQ(1)
        const nextTimes = { ...(moduleTimeLeft || {}), [currentModule]: timerLeft ?? moduleTimeLeft?.[currentModule] }
        setModuleTimeLeft(nextTimes)
        await saveProgress(answers, nextMod, nextTimes)
      }
    }
  }

  async function startNextModule() {
    const idx = moduleOrder.indexOf(currentModule)
    const nextMod = moduleOrder[idx + 1]
    setShowBreak(false)
    setCurrentModule(nextMod)
    setCurrentQ(1)
    await saveProgress(answers, nextMod, moduleTimeLeft)
  }

  async function submitTest() {
    if (typeof navigator !== 'undefined' && navigator && navigator.onLine === false) {
      alert('You appear to be offline. Reconnect to submit your test. Your answers are saved on this device.')
      return
    }
    setSubmitting(true)
    const testId = attempt?.test_id || testConfig?.id || 'pre_test'
    const scores = scoreAttemptFromKey(testId, answers, keyBySection || {})
    const weakTopics = calcWeakTopicsForTest(testId, answers, keyBySection || {})

    const up = await supabase.from('test_attempts').update({
      completed_at: new Date().toISOString(),
      answers,
      scores,
      // Store the full set so domain/topic charts are accurate (avoid truncating to top N).
      weak_topics: weakTopics.slice(0, 250),
    }).eq('id', attemptId)
    if (up.error) {
      alert(up.error.message || 'Could not submit test. Please try again.')
      setSubmitting(false)
      return
    }

    // Mistake notebook + spaced repetition queue (auto-save missed questions).
    try {
      const mistakes = []
      let attemptedTotal = 0
      let totalQuestions = 0
      for (const section of moduleOrder) {
        const key = keyBySection?.[section] || {}
        const total = modules?.[section]?.questions || 0
        totalQuestions += total
        const sectionAnswers = answers?.[section] || {}
        for (let q = 1; q <= total; q++) {
          const right = key?.[q]
          if (right == null) continue
          const given = sectionAnswers?.[q]
          const attempted = String(given ?? '').trim().length > 0
          if (attempted) attemptedTotal += 1
          const ok = answerMatches(given, right)
          if (ok) continue
          if (!attempted) continue
          mistakes.push({
            test_id: testId,
            attempt_id: attemptId,
            section,
            q_num: q,
            given: String(given ?? ''),
            correct: String(right ?? ''),
            chapter_id: examConfig.questionChapterMap?.[section]?.[q] || null,
          })
        }
      }
      const includeUnanswered = attemptedTotal < Math.max(10, Math.round(totalQuestions * 0.25))
      if (includeUnanswered) {
        for (const section of moduleOrder) {
          const key = keyBySection?.[section] || {}
          const total = modules?.[section]?.questions || 0
          const sectionAnswers = answers?.[section] || {}
          for (let q = 1; q <= total; q++) {
            const right = key?.[q]
            if (right == null) continue
            const given = sectionAnswers?.[q]
            const attempted = String(given ?? '').trim().length > 0
            if (attempted) continue
            mistakes.push({
              test_id: testId,
              attempt_id: attemptId,
              section,
              q_num: q,
              given: '',
              correct: String(right ?? ''),
              chapter_id: examConfig.questionChapterMap?.[section]?.[q] || null,
              note: 'Unanswered',
            })
          }
        }
      }

      const capped = mistakes.slice(0, 200)
      if (capped.length && user?.id) {
        const saved = await saveMistakes(user.id, capped)
        await ensureReviewItems(user.id, saved.items || capped)
      }
    } catch (e) { console.error('[TestTaking] Failed to save mistakes:', e?.message) }

    // Auto-check Study Guide chapters that were mastered on the test (all questions correct for that chapter).
    try {
      const nowIso = new Date().toISOString()
      const stats = {}
      for (const section of moduleOrder) {
        const key = keyBySection?.[section] || {}
        const chMap = examConfig.questionChapterMap?.[section] || {}
        const total = modules?.[section]?.questions || 0
        const sectionAnswers = answers?.[section] || {}
        for (let q = 1; q <= total; q++) {
          const ch = chMap[q]
          const right = key[q]
          if (!ch || !right) continue
          if (!stats[ch]) stats[ch] = { total: 0, correct: 0, allCorrect: true }
          stats[ch].total += 1
          const given = sectionAnswers[q]
          const attempted = String(given ?? '').trim().length > 0
          const ok = attempted && answerMatches(given, right)
          if (ok) stats[ch].correct += 1
          else stats[ch].allCorrect = false
        }
      }

      const chapters = Object.keys(stats)
      if (chapters.length) {
        const { data: existingRows } = await supabase
          .from('studied_topics')
          .select('chapter_id,completed,completed_at,practice')
          .eq('user_id', user.id)
          .in('chapter_id', chapters)

        const existingBy = {}
        for (const r of existingRows || []) existingBy[r.chapter_id] = r

        const upserts = chapters.map((chapterId) => {
          const s = stats[chapterId]
          const existing = existingBy[chapterId]
          const existingPractice = (existing?.practice && typeof existing.practice === 'object') ? existing.practice : {}
          const nextPractice = {
            ...existingPractice,
            test: {
              correct: s.correct,
              total: s.total,
              mastered: Boolean(s.allCorrect && s.total > 0),
              attempt_id: attemptId,
              updated_at: nowIso,
            }
          }
          const mastered = Boolean(s.allCorrect && s.total > 0)
          const completed = Boolean(existing?.completed || mastered)
          return {
            user_id: user.id,
            chapter_id: chapterId,
            completed,
            completed_at: completed ? (existing?.completed ? existing?.completed_at : nowIso) : null,
            practice: nextPractice,
            updated_at: nowIso,
          }
        })

        await supabase.from('studied_topics').upsert(upserts)
      }
    } catch (e) { console.error('[TestTaking] Failed to update study progress:', e?.message) }

    navigate(`/results/${attemptId}`)
  }

  function handleTimerExpire() {
    advanceModule()
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Fraunces, Georgia, serif', color: '#565a63' }}>
      Loading test…
    </div>
  )

  if (!keyBySection && keyStatus.msg) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f3f0e9' }}>
        <div style={{ maxWidth: 720, width: '100%', background: 'white', border: '1px solid #e4e0d5', borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 600, color: '#16181d', marginBottom: 8 }}>Missing answer key</div>
          <div style={{ color: '#565a63', lineHeight: 1.6, fontSize: 14, marginBottom: 12 }}>
            {keyStatus.msg}
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    )
  }

  if (showBreak) {
    const idx = moduleOrder.indexOf(currentModule)
    const nextMod = moduleOrder[idx + 1]
    return <BreakScreen nextModule={nextMod} onContinue={startNextModule} modules={modules} />
  }

  const mod = modules[currentModule]
  if (!mod) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Fraunces, Georgia, serif', color: '#565a63' }}>
        Loading test section…
      </div>
    )
  }
  const totalQ = mod.questions

  // The tests themselves live on the College Board site — we only collect answers here.
  // The per-question page maps still describe the official PDFs, so we can point
  // students at the right page of the College Board PDF for the current question.
  const cbUrl = testConfig?.cbUrl || ''
  const cbLabel = testConfig?.cbLabel || 'the SAT practice test'
  const pageMap = (testConfig?.id === 'pre_test')
    ? (PDF_PAGE_MAP[currentModule] || {})
    : (EXTRA_PDF_PAGE_MAPS?.[testConfig?.id]?.[currentModule] || {})
  const pdfPage = (() => {
    if (Number.isFinite(Number(pageMap?.[currentQ]))) return Number(pageMap[currentQ])
    // Fallback: use the nearest previous mapped question page.
    for (let q = currentQ - 1; q >= 1; q--) {
      if (Number.isFinite(Number(pageMap?.[q]))) return Number(pageMap[q])
    }
    return null
  })()
  const cbPageUrl = cbUrl && pdfPage != null ? `${cbUrl}#page=${pdfPage + 1}` : cbUrl

  const modAnswers = answers[currentModule] || {}
  const currentAnswer = modAnswers[currentQ]
  const markedList = markedForReview[currentModule] || []
  const isMarked = markedList.includes(currentQ)
  const right = keyBySection?.[currentModule]?.[currentQ]
  const isFR = right != null && !isMultipleChoiceAnswer(right)
  const isLastQ = currentQ === totalQ
  const isLastModule = moduleOrder.indexOf(currentModule) === moduleOrder.length - 1
  const choices = getChoiceOptionsForQuestion(currentTestId, currentModule, currentQ)

  const moduleTotalTime = mod.time
  const currentLeft = timerLeft ?? (moduleTimeLeft[currentModule] || moduleTotalTime)
  const elapsed = Math.max(0, moduleTotalTime - currentLeft)
  const secPerQ = moduleTotalTime / totalQ
  const targetElapsed = (currentQ - 1) * secPerQ
  const delta = Math.round(targetElapsed - elapsed) // + means ahead, - means behind
  const paceLabel = (() => {
    const abs = Math.abs(delta)
    const mm = Math.floor(abs / 60)
    const ss = abs % 60
    const fmt = `${mm}:${String(ss).padStart(2, '0')}`
    if (abs < 10) return 'On pace'
    return delta > 0 ? `Ahead by ${fmt}` : `Behind by ${fmt}`
  })()

  return (
    <div className="test-layout">
      {/* Header */}
      <div className="test-header">
        <div className="test-header-left">
          <div className="test-section-label">{mod.section} · {testConfig?.label || 'Pre Test'}</div>
          <div className="test-module-label">{mod.label} — {mod.module}</div>
        </div>
        <Timer
          key={currentModule}
          seconds={moduleTimeLeft[currentModule] || mod.time}
          onExpire={handleTimerExpire}
          onTick={(t) => setTimerLeft(t)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, minWidth: 160 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: paceLabel === 'On pace' ? 'rgba(255,255,255,.75)' : (delta > 0 ? '#86efac' : '#fecaca'),
            background: 'rgba(255,255,255,.08)',
            border: '1px solid rgba(255,255,255,.14)',
            padding: '6px 10px',
            borderRadius: 999,
            lineHeight: 1,
            whiteSpace: 'nowrap'
          }}>
            {paceLabel}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', fontWeight: 700 }}>
            Target: {Math.floor(targetElapsed / 60)}:{String(Math.round(targetElapsed % 60)).padStart(2, '0')} by Q{currentQ}
          </div>
        </div>
        <div className="test-header-right">
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
            {Object.keys(modAnswers).length}/{totalQ} answered
          </div>
          {isLastModule && (
            <button className="btn" onClick={submitTest} disabled={submitting}
              style={{ background: '#f59e0b', color: '#16181d', fontWeight: 700, padding: '7px 16px', fontSize: 13 }}>
              {submitting ? 'Submitting…' : 'Submit Test'}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="test-body">
        {/* Test source panel — the questions live on the College Board site */}
        <div className="test-pdf-panel">
          <div style={{ width: '100%', maxWidth: 560 }}>
            <div style={{ background: 'white', border: '1px solid #e4e0d5', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(22,24,29,.06)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#0284c7', marginBottom: 8 }}>
                Official College Board Test
              </div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 600, color: '#16181d', marginBottom: 6 }}>
                {cbLabel}
              </div>
              <div style={{ color: '#3f434b', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                The questions for this test are on the College Board website. Keep it open in a
                second tab, read each question there, and record your answers on this page —
                this tab keeps your timer, pacing, and progress.
              </div>
              <a
                className="btn btn-primary"
                href={cbPageUrl || cbUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600 }}
              >
                Open {cbLabel} ↗
              </a>
              {pdfPage != null && (
                <div style={{ marginTop: 14, padding: '10px 14px', background: '#f3f0e9', borderRadius: 10, fontSize: 13, color: '#3f434b', fontWeight: 600 }}>
                  Question {currentQ} is on page {pdfPage + 1} of the test PDF.
                </div>
              )}
              <div style={{ marginTop: 14, fontSize: 12, color: '#8a8f98', lineHeight: 1.6 }}>
                Tip: put the two tabs side by side. If the PDF doesn't jump to the page, scroll
                to the page shown above.
              </div>
            </div>
          </div>
        </div>

        {/* Answer Panel */}
        <div className="test-answer-panel">
          {/* Q Navigator */}
          <div className="q-navigator">
            {Array.from({ length: totalQ }, (_, i) => i + 1).map(n => {
              const isAnswered = !!modAnswers[n]
              const isMrk = markedList.includes(n)
              const isCurr = n === currentQ
              return (
                <button key={n} className={`q-nav-btn${isCurr ? ' current' : ''}${isAnswered ? ' answered' : ''}${isMrk ? ' marked' : ''}`}
                  onClick={() => setCurrentQ(n)} title={`Q${n}${isMrk ? ' · Come back to' : ''}${isAnswered ? ' · Answered' : ''}`}>
                  {n}
                </button>
              )
            })}
          </div>

          {/* Panel header */}
          <div className="answer-panel-header">
            <div className="q-label">Question {currentQ}</div>
            <div className="q-counter">{mod.label} · {mod.module}</div>
            <button className={`mark-review-btn${isMarked ? ' marked' : ''}`} onClick={() => toggleMark(currentQ)}>
              {isMarked ? 'Marked to Come Back' : 'Mark to Come Back'}
            </button>
          </div>

          {/* Answer choices */}
          <div className="answer-choices">
            {isFR ? (
              <div>
                <div style={{ fontSize: 13, color: '#565a63', marginBottom: 10 }}>
                  Enter your answer (numbers or simple expressions):
                </div>
                <input
                  type="text"
                  className="free-response-input"
                  placeholder="Your answer"
                  value={currentAnswer || ''}
                  onChange={e => setAnswer(currentQ, e.target.value)}
                  autoComplete="off"
                />
                <div style={{ fontSize: 12, color: '#8a8f98', marginTop: 6 }}>
                  Equivalent answers count, including fractions and comma-formatted numbers. Examples: <code>75</code>, <code>1/2</code>, <code>.5</code>, <code>15,000</code>, <code>pi</code> (or <code>π</code>), <code>2^3</code>, <code>3*pi/2</code>
                </div>
              </div>
            ) : (
              <div className="choice-grid sat">
                {choices.map(letter => (
                  <button
                    key={letter}
                    className={`choice-btn${currentAnswer === letter ? ' selected' : ''}`}
                    onClick={() => setAnswer(currentQ, letter)}
                  >
                    <span className="choice-letter">{letter}</span>
                    <span style={{ paddingTop: 4, fontWeight: 600 }}>Choose {letter}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="answer-panel-footer">
            <div className="nav-btns">
              <button className="nav-btn nav-btn-back" onClick={() => setCurrentQ(q => Math.max(1, q - 1))} disabled={currentQ === 1}>
                ← Back
              </button>
              {isLastQ ? (
                <button className="nav-btn nav-btn-submit" onClick={advanceModule} disabled={submitting}>
                  {isLastModule ? (submitting ? 'Submitting…' : 'Submit Test') : 'End Module →'}
                </button>
              ) : (
                <button className="nav-btn nav-btn-next" onClick={() => setCurrentQ(q => Math.min(totalQ, q + 1))}>
                  Next →
                </button>
              )}
            </div>
            <div style={{ fontSize: 11, color: '#8a8f98' }}>
              {currentQ}/{totalQ}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
