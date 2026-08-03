import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { loadSatTestDate, loadStudyPrefs, normalizeWeakTopics, buildAdaptiveSchedule, allChaptersAsWeakTopics } from '../lib/studyPlan.js'
import UserMenu from '../components/UserMenu.jsx'
import BrandLink from '../components/BrandLink.jsx'
import Icon from '../components/AppIcons.jsx'
import TopResourceNav from '../components/TopResourceNav.jsx'
import Sidebar from '../components/Sidebar.jsx'
import AnimateOnScroll from '../components/AnimateOnScroll.jsx'
import { useToast } from '../components/Toast.jsx'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import { TESTS, getTestsForExam, getExamFromTestId, normalizeTestId } from '../data/tests.js'
import { getAnswerKeyBySection } from '../data/answerKeys.js'
import {
  formatDurationMinutes,
  getDefaultModuleTimeRemaining,
  getChaptersForExam,
  getExamConfig,
  getQuestionCountForTest,
  getScoreColumnsForExam,
  scoreAttemptFromKey,
  calcWeakTopicsForTest,
  scoreToPercentile,
} from '../data/examData.js'
import { loadDashboardViewData, loadProfileSafe } from '../lib/dashboardData.js'
import { resolveViewContext, withViewUser, withExam } from '../lib/viewAs.js'
import { chooseDashboardExam, saveLocalPreferredExam, userNeedsExamChoice } from '../lib/examChoice.js'
import { setUnlockedResources } from '../lib/pretestGate.js'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

function Navbar({ viewUserId, isAdminPreview, currentExam, showResources = false }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const isAdmin = profile?.role === 'admin'
  const isTutor = profile?.role === 'tutor'
  const calendarHref = withViewUser(withExam('/calendar', currentExam), viewUserId, isAdminPreview)
  const guideHref = withViewUser(withExam('/guide', currentExam), viewUserId, isAdminPreview)
  const mistakesHref = withViewUser(withExam('/mistakes', currentExam), viewUserId, isAdminPreview)
  return (
    <nav className="nav">
      <BrandLink to={withViewUser(withExam('/dashboard', currentExam), viewUserId, isAdminPreview)} />
      <div className="nav-actions">
        <TopResourceNav hidden={!showResources} calendarHref={calendarHref} guideHref={guideHref} mistakesHref={mistakesHref} />
        {!isAdmin && !isTutor && (
          <Link
            to={withViewUser(withExam('/overview', currentExam), viewUserId, isAdminPreview)}
            className="btn btn-outline"
            style={{
              padding: '6px 14px',
              fontSize: 12,
              color: 'rgba(255,255,255,.9)',
              borderColor: 'rgba(2,132,199,.4)',
              background: 'rgba(2,132,199,.12)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon name="chart" size={14} />
            Overview
          </Link>
        )}
        {isTutor && (
          <Link
            to="/tutor"
            className="btn btn-outline"
            style={{
              padding: '6px 14px',
              fontSize: 12,
              color: 'rgba(255,255,255,.9)',
              borderColor: 'rgba(139,92,246,.5)',
              background: 'rgba(139,92,246,.15)'
            }}
          >
            Students
          </Link>
        )}
        {isAdmin && (
          <Link
            to="/admin"
            className="btn btn-outline"
            style={{
              padding: '6px 14px',
              fontSize: 12,
              color: 'rgba(255,255,255,.9)',
              borderColor: 'rgba(255,255,255,.3)',
              background: 'rgba(255,255,255,.08)'
            }}
          >
            Admin
          </Link>
        )}
        <UserMenu profile={profile} />
        <button className="btn btn-outline" onClick={() => signOut().then(() => navigate('/login'))}
          style={{padding:'6px 14px',fontSize:12,color:'rgba(255,255,255,.7)',borderColor:'rgba(255,255,255,.2)',background:'rgba(255,255,255,.08)'}}>
          Sign Out
        </button>
      </div>
    </nav>
  )
}

function SectionIcon({ name, color = '#0284c7' }) {
  return (
    <span style={{
      width: 32, height: 32, borderRadius: 10,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: color,
      color: 'white', flexShrink: 0,
      boxShadow: '0 1px 3px rgba(22,24,29,.06)',
    }}>
      <Icon name={name} size={16} />
    </span>
  )
}

function ScoreOverviewCard({ label, value, sub, icon, dark = false, to = '' }) {
  const content = (
    <div className={`stat-box stat-box-animated${dark ? ' dark' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', height: '100%' }}>
      <div style={{
        width: 46,
        height: 46,
        borderRadius: 12,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: dark ? 'rgba(255,255,255,.18)' : '#0284c7',
        color: dark ? 'white' : '#ffffff',
        boxShadow: dark ? 'none' : '0 1px 3px rgba(22,24,29,.06)',
      }}>
        <Icon name={icon} size={20} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="stat-label">{label}</div>
        <div className="stat-num" style={{ fontSize: 24 }}>
          <AnimatedNumber value={value} />
        </div>
        <div className="stat-sub">{sub}</div>
      </div>
    </div>
  )

  if (!to) return content
  return (
    <Link to={to} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      {content}
    </Link>
  )
}

function ScheduleTaskLink({ task, compact = false, stopParentClick = false, completed = false }) {
  const doneAccent = '#059669'
  const accent = completed ? doneAccent : (task.type === 'guide' ? '#0284c7' : task.type === 'mistakes' ? '#f59e0b' : '#0284c7')
  const icon = completed ? 'check' : (task.type === 'guide' ? 'guide' : task.type === 'mistakes' ? 'mistakes' : 'results')
  return (
    <Link
      to={task.href}
      onClick={stopParentClick ? (event) => event.stopPropagation() : undefined}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: compact ? '10px 12px' : '12px 14px',
        border: completed ? '2px solid rgba(5,150,105,.35)' : '1px solid rgba(2,132,199,.15)',
        borderRadius: 12,
        textDecoration: 'none',
        color: completed ? '#059669' : '#16181d',
        background: completed ? 'rgba(5,150,105,.06)' : 'white',
        boxShadow: '0 2px 6px rgba(22,24,29,.04)',
        transition: 'all .2s ease',
      }}
    >
      <span style={{
        width: compact ? 30 : 34,
        height: compact ? 30 : 34,
        borderRadius: 10,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: completed ? 'rgba(5,150,105,.15)' : accent,
        color: completed ? doneAccent : 'white',
        flexShrink: 0,
        boxShadow: completed ? 'none' : '0 1px 3px rgba(22,24,29,.06)',
      }}>
        <Icon name={icon} size={compact ? 15 : 16} />
      </span>
      <span style={{ minWidth: 0 }}>
        <div style={{ fontSize: compact ? 12 : 13, fontWeight: 600, color: completed ? '#059669' : '#16181d', lineHeight: 1.35 }}>
          {completed && '✓ '}{task.title}
        </div>
        <div style={{ fontSize: 12, color: completed ? '#6ee7b7' : '#565a63', lineHeight: 1.5, marginTop: 2 }}>{task.subtitle}</div>
      </span>
    </Link>
  )
}

function examResultLabel() {
  return 'SAT progress'
}

function formatExamSubscore(exam, scores, key) {
  if (!scores) return '—'
  return scores[key] ?? '—'
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = useMemo(() => new URLSearchParams(location.search || ''), [location.search])
  const requestedExam = String(searchParams.get('exam') || '').toLowerCase()
  const { viewUserId, isAdminPreview } = useMemo(
    () => resolveViewContext({ userId: user?.id, profile, search: location.search }),
    [user?.id, profile, location.search]
  )
  const [attempts, setAttempts] = useState([])
  const [postScores, setPostScores] = useState([])
  const [studied, setStudied] = useState({})
  const [studiedRows, setStudiedRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [startingTest, setStartingTest] = useState(false)
  const [addingPost, setAddingPost] = useState(null)
  const [postInput, setPostInput] = useState('')
  const [confirmStart, setConfirmStart] = useState(false)
  const [confirmExtraTestId, setConfirmExtraTestId] = useState(null)
  const [reviewItems, setReviewItems] = useState({})
  const [mistakes, setMistakes] = useState([])
  const [targetProfile, setTargetProfile] = useState(null)
  const chosenExam = chooseDashboardExam({ user, attempts, explicitExam: requestedExam })
  const exam = requestedExam === 'sat' ? requestedExam : chosenExam
  const examConfig = getExamConfig(exam)
  const examTests = getTestsForExam(exam)
  const chaptersForExam = getChaptersForExam(exam)
  const [satDate, setSatDate] = useState(() => loadSatTestDate(viewUserId, exam))
  const [studyPrefs, setStudyPrefs] = useState(() => loadStudyPrefs(viewUserId, exam))

  useEffect(() => {
    setSatDate(loadSatTestDate(viewUserId, exam))
    setStudyPrefs(loadStudyPrefs(viewUserId, exam))
  }, [viewUserId, exam])

  const displayProfile = isAdminPreview ? targetProfile : profile
  const readOnlyView = isAdminPreview
  const isTutor = profile?.role === 'tutor'
  const viewHref = useCallback((path) => withViewUser(withExam(path, exam), viewUserId, isAdminPreview), [exam, viewUserId, isAdminPreview])

  function hasViewedResultsForAttempt(attemptId) {
    if (!viewUserId || !attemptId) return false
    try {
      const key = `agora_viewed_results_v1:${viewUserId}`
      const raw = localStorage.getItem(key)
      const obj = raw ? JSON.parse(raw) : {}
      return Boolean(obj?.[String(attemptId)])
    } catch {
      return false
    }
  }

  function computeScoresFromAnswers(attempt) {
    try {
      const keyBySection = getAnswerKeyBySection(attempt?.test_id) || null
      if (!keyBySection) return null
      return scoreAttemptFromKey(attempt?.test_id, attempt?.answers || {}, keyBySection)
    } catch {
      return null
    }
  }

  useEffect(() => {
    if (!user || !viewUserId) return
    let cancelled = false

    async function loadDashboardData() {
      setLoading(true)
      try {
        const [dataRes, previewRes] = await Promise.allSettled([
          loadDashboardViewData(viewUserId),
          isAdminPreview ? loadProfileSafe(viewUserId) : Promise.resolve(null),
        ])

        const data = dataRes.status === 'fulfilled' ? dataRes.value : null
        const previewProfile = previewRes.status === 'fulfilled' ? previewRes.value : null
        const rows = data?.attempts || []
        const posts = data?.postScores || []

        if (cancelled) return

        setAttempts(rows)
        setPostScores(posts)
        setTargetProfile(previewProfile || null)
        setStudied(data?.studiedMap || {})
        setStudiedRows(data?.studiedRows || [])
        setReviewItems(data?.reviewItems || {})
        setMistakes(data?.mistakes || [])

        if (readOnlyView) return
        const needsPatch = rows.filter(r => (r.completed_at || r.scores?.total) && (!r.scores || !r.scores.total) && r.answers && Object.keys(r.answers || {}).length)
        Promise.allSettled(needsPatch.slice(0, 3).map(async (r) => {
          const computed = computeScoresFromAnswers(r)
          if (!computed?.total) return
          const { error } = await supabase.from('test_attempts').update({ scores: computed }).eq('id', r.id)
          if (cancelled || error) return
          setAttempts(prev => (prev || []).map(x => x.id === r.id ? { ...x, scores: computed } : x))
        }))
      } catch {
        if (cancelled) return
        setAttempts([])
        setPostScores([])
        setStudied({})
        setStudiedRows([])
        setReviewItems({})
        setMistakes([])
        setTargetProfile(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboardData()

    return () => {
      cancelled = true
    }
  }, [user, viewUserId, isAdminPreview, readOnlyView])

  useEffect(() => {
    if (!user || loading) return
    if (userNeedsExamChoice(user, attempts) && !requestedExam && profile?.role !== 'tutor') {
      navigate('/choose-test', { replace: true })
      return
    }
    if (!requestedExam || requestedExam !== exam) {
      saveLocalPreferredExam(user.id, exam)
      navigate(viewHref('/dashboard'), { replace: true })
    }
  }, [user, loading, attempts, requestedExam, exam, navigate, viewHref])

  async function startNewTest(testId = examConfig.preTestId) {
    if (readOnlyView || startingTest || !supabase || !user?.id) return
    if (testId === examConfig.preTestId) {
      if (!confirmStart) { setConfirmStart(true); return }
      setConfirmStart(false)
    }
    setStartingTest(true)
    try {
      const existing = await supabase
        .from('test_attempts')
        .select('id')
        .eq('user_id', user.id)
        .eq('test_id', testId)
        .is('completed_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existing?.data?.id) {
        navigate(`/test/${existing.data.id}`)
        return
      }
      // A failed lookup must not fall through to insert — that would create a
      // duplicate in-progress attempt on a transient query error.
      if (existing?.error) {
        alert('Could not check for an existing attempt. Please try again.')
        return
      }

      const payload = {
        user_id: user.id,
        test_id: testId,
        current_section: examConfig.moduleOrder[0],
        answers: {},
        module_time_remaining: getDefaultModuleTimeRemaining(testId)
      }
      const res = await supabase.from('test_attempts').insert(payload).select().single()
      if (!res.error && res.data) navigate(`/test/${res.data.id}`)
      else {
        alert(res.error?.message || 'Could not start test. Please try again.')
      }
    } catch (error) {
      alert(error?.message || 'Could not start test. Please try again.')
    } finally {
      setStartingTest(false)
    }
  }

  async function savePostScore(attemptId) {
    if (readOnlyView || !user?.id || !attemptId) return
    const sc = parseInt(String(postInput).replace(/[^0-9-]/g, ''), 10)
    if (!Number.isFinite(sc)) return alert('Enter a valid score (400–1600)')
    if (sc < 400 || sc > 1600) return alert('Enter a valid score (400–1600)')
    const rw = Math.round(sc * 0.5 / 10) * 10
    const math = sc - rw
    const payload = { user_id: user.id, attempt_id: String(attemptId), post_score: sc, post_rw: rw, post_math: math }
    const ins = await supabase.from('post_scores').insert(payload)
    if (ins.error) alert(ins.error.message)
    const { data } = await supabase.from('post_scores').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false })
    setPostScores(data || [])
    setAddingPost(null); setPostInput('')
  }

  const examAttemptIds = new Set(examTests.map((test) => test.id))
  const examAttempts = attempts.filter((attempt) => examAttemptIds.has(normalizeTestId(attempt?.test_id)))
  const studiedForExam = Object.fromEntries(Object.entries(studied || {}).filter(([chapterId]) => Boolean(chaptersForExam?.[chapterId])))
  const studiedRowsForExam = (studiedRows || []).filter((row) => Boolean(chaptersForExam?.[row.chapter_id]))
  const mistakesForExam = (mistakes || []).filter((row) => getExamFromTestId(row?.test_id) === exam)

  const completed = examAttempts.filter(a => a.completed_at || a.scores?.total)
  const inProgress = examAttempts.filter(a => !a.completed_at)
  const latestCompleted = completed.length ? completed[0] : null
  const completedPre = completed.filter(a => normalizeTestId(a.test_id) === examConfig.preTestId)
  const completedRealPre = completedPre.filter(a => a.scores?.source !== 'prior_score')
  const onlyPriorScore = completedPre.length > 0 && completedRealPre.length === 0
  const preInProgress = inProgress.find(a => normalizeTestId(a.test_id) === examConfig.preTestId)
  const completedWithScores = completed
    .map((attempt) => ({ attempt, scores: attempt.scores?.total ? attempt.scores : (computeScoresFromAnswers(attempt) || attempt.scores || {}) }))
    .filter((entry) => entry.scores?.total)
  const fullLengthRecords = completedWithScores.filter(({ attempt }) => {
    const cfg = examTests.find((t) => t.id === normalizeTestId(attempt.test_id))
    return cfg && cfg.kind !== 'extra'
  })
  const bestSatRecord = completedWithScores.reduce((best, entry) => {
    if (!best) return entry
    return Number(entry.scores.total || 0) > Number(best.scores.total || 0) ? entry : best
  }, null)
  const lowestScoreRecord = completedWithScores.reduce((lowest, entry) => {
    if (!lowest) return entry
    return Number(entry.scores.total || 0) < Number(lowest.scores.total || 0) ? entry : lowest
  }, null)
  const highestTestRecord = fullLengthRecords.reduce((best, entry) => {
    if (!best) return entry
    return Number(entry.scores.total || 0) > Number(best.scores.total || 0) ? entry : best
  }, null)
  const mostRecentRecord = completedWithScores[0] || null
  const improvement = mostRecentRecord && lowestScoreRecord
    ? Number(mostRecentRecord.scores?.total || 0) - Number(lowestScoreRecord.scores?.total || 0)
    : null

  // Percentile based on best score
  const bestTotal = bestSatRecord ? Number(bestSatRecord.scores?.total || bestSatRecord.scores?.composite || 0) : 0
  const bestPercentile = bestTotal > 0 ? scoreToPercentile(exam, bestTotal) : null

  // Superscore: best section scores across all completed attempts
  const superscore = useMemo(() => {
    if (!completedWithScores.length) return null
    let bestRW = 0, bestMath = 0
    for (const { scores } of completedWithScores) {
      bestRW = Math.max(bestRW, Number(scores.rw || 0))
      bestMath = Math.max(bestMath, Number(scores.math || 0))
    }
    if (!bestRW && !bestMath) return null
    return { total: bestRW + bestMath, sections: { rw: bestRW, math: bestMath } }
  }, [completedWithScores, exam])
  const superscorePercentile = superscore ? scoreToPercentile(exam, superscore.total) : null
  const studiedCount = Object.values(studiedForExam).filter(Boolean).length
  const studiedPct = Math.round((studiedCount / Math.max(1, examConfig.guideCompletionTarget)) * 100)
  const hasStartedGuide = (studiedRowsForExam || []).some((r) => {
    const g = r?.practice?.guide
    if (r?.practice?.meta?.guide_started_at) return true
    return g && typeof g === 'object' && Object.values(g).some(Boolean)
  })
  const hasStudyPlan = Boolean(satDate)
  const extraTests = examTests.filter(t => t.kind === 'extra')
  const completedExtra = completed.filter(a => extraTests.some(t => t.id === a.test_id))
  const hasTakenPretest = completedPre.length > 0
  const preTestConfig = examTests.find((test) => test.id === examConfig.preTestId) || examTests[0]
  const totalQuestions = getQuestionCountForTest(examConfig.preTestId)
  const totalDuration = formatDurationMinutes(
    examConfig.moduleOrder.reduce((sum, moduleId) => sum + Number(examConfig.modules?.[moduleId]?.time || 0), 0)
  )
  const calendarEntryHref = (!satDate && latestCompleted?.id) ? viewHref(`/results/${latestCompleted.id}`) : viewHref('/calendar')
  const scoreColumns = getScoreColumnsForExam(exam)
  const bestScoreLabel = 'Best SAT Score'
  const improvementLabel = lowestScoreRecord
    ? 'Most recent minus lowest score'
    : `${completed.length} completed · ${inProgress.length} in progress`
  const viewedLatestResults = latestCompleted ? hasViewedResultsForAttempt(latestCompleted.id) : false
  const latestMistakes = latestCompleted ? mistakesForExam.filter(m => String(m.attempt_id || '') === String(latestCompleted.id)) : []
  // Use ALL mistakes for the exam (not just latest test) so the review count
  // matches what the Mistake Notebook actually shows.
  const allExamMistakes = mistakesForExam || []
  const allExamValidated = allExamMistakes.filter((m) => {
    const k = `${m.test_id}:${m.section}:${m.q_num}`
    return reviewItems?.[k]?.last_correct === true
  }).length
  const latestValidated = latestMistakes.filter((m) => {
    const k = `${m.test_id}:${m.section}:${m.q_num}`
    return reviewItems?.[k]?.last_correct === true
  }).length
  const reviewJourneyStatus = (() => {
    const total = latestMistakes.length
    if (total === 0) return hasTakenPretest ? 'DONE' : 'NOT STARTED'
    if (latestValidated === 0) return 'NOT STARTED'
    if (latestValidated < total) return 'IN PROGRESS'
    return 'DONE'
  })()
  const reviewTodoCount = Math.max(0, allExamMistakes.length - allExamValidated)

  const journeySchedule = useMemo(() => {
    const weakTopics = latestCompleted
      ? deriveWeakTopicsForAttempt(latestCompleted)
      : allChaptersAsWeakTopics(exam)
    const schedule = buildAdaptiveSchedule({
      weakTopics,
      studiedMap: studiedForExam,
      reviewCount: reviewTodoCount,
      totalReviewCount: allExamMistakes.length,
      hasViewedResults: viewedLatestResults,
      hasTakenPretest: hasTakenPretest,
      prefs: studyPrefs,
      testDate: satDate,
      exam,
    })
    return {
      ...schedule,
      days: (schedule?.days || []).map((day) => ({
        ...day,
        tasks: (day.tasks || []).map((task) => {
          const href = task.type === 'results' ? `/results/${latestCompleted.id}` : task.href
          return { ...task, href: viewHref(href) }
        }),
      })),
    }
  }, [hasTakenPretest, latestCompleted, studiedForExam, reviewTodoCount, viewedLatestResults, studyPrefs, satDate, mistakes, viewHref])

  const scheduleDayCards = useMemo(() => {
    const days = journeySchedule?.days || []
    if (!days.length) return []
    const primary = days.filter((day) => day.isActive && day.tasks.length > 0)
    const fallback = days.filter((day) => day.isActive || day.tasks.length > 0)
    return (primary.length ? primary : fallback).slice(0, 3)
  }, [journeySchedule])

  useEffect(() => {
    // Resources unlock only once the pretest is done — unconditionally setting
    // this made the gate a no-op after a single dashboard visit.
    if (hasTakenPretest) setUnlockedResources(viewUserId, exam, true)
  }, [viewUserId, exam, hasTakenPretest])

  // Toast notifications for newly completed tasks
  const addToast = useToast()
  const prevStudiedRef = useRef(null)
  const prevReviewTodoRef = useRef(null)
  // Reset toast refs when exam changes so stale cross-exam deltas don't fire
  const prevExamRef = useRef(exam)
  useEffect(() => {
    if (prevExamRef.current !== exam) {
      prevStudiedRef.current = null
      prevReviewTodoRef.current = null
      prevExamRef.current = exam
    }
  }, [exam])

  useEffect(() => {
    if (!addToast) return
    const currentKeys = new Set(Object.keys(studiedForExam).filter((k) => studiedForExam[k]))
    if (prevStudiedRef.current) {
      for (const key of currentKeys) {
        if (!prevStudiedRef.current.has(key)) {
          const ch = chaptersForExam?.[key]
          const label = ch?.name || `Chapter ${key}`
          addToast(`${label} — completed!`, 'success')
        }
      }
    }
    prevStudiedRef.current = currentKeys
  }, [studiedForExam, chaptersForExam, addToast, hasTakenPretest])

  useEffect(() => {
    if (!addToast) return
    if (prevReviewTodoRef.current !== null && reviewTodoCount < prevReviewTodoRef.current) {
      const diff = prevReviewTodoRef.current - reviewTodoCount
      if (reviewTodoCount === 0) {
        addToast('All missed questions reviewed — great work!', 'success')
      } else {
        addToast(`${diff} missed question${diff === 1 ? '' : 's'} validated!`, 'success')
      }
    }
    prevReviewTodoRef.current = reviewTodoCount
  }, [reviewTodoCount, addToast, hasTakenPretest])

  function scheduleCardTitle(day, idx) {
    if (idx === 0 && day?.isToday) return 'Today'
    if (idx === 0) return 'Next Study Day'
    if (idx === 1) return 'Following Study Day'
    return 'Coming Up'
  }

  useEffect(() => {
    setConfirmExtraTestId(null)
  }, [hasTakenPretest])

  function deriveWeakTopicsForAttempt(attempt) {
    // Always recompute from raw answers + answer key for accuracy.
    // This guarantees every missed chapter appears regardless of what was stored.
    const keyBySection = getAnswerKeyBySection(attempt?.test_id)
    if (keyBySection && attempt?.answers && Object.keys(attempt.answers).length) {
      const computed = calcWeakTopicsForTest(attempt.test_id, attempt.answers, keyBySection)
      if (computed.length) return computed
    }
    // Fallback to stored weak_topics if recomputation isn't possible
    const normalized = normalizeWeakTopics(attempt?.weak_topics || [])
    if (normalized.length) return normalized
    // Last resort: derive from mistakes table
    const list = (mistakes || [])
      .filter((m) => String(m.attempt_id || '') === String(attempt?.id || '') && m.chapter_id)
    const counts = {}
    for (const m of list) {
      const ch = String(m.chapter_id)
      counts[ch] = (counts[ch] || 0) + 1
    }
    return Object.entries(counts)
      .map(([ch, count]) => ({ ...(chaptersForExam?.[ch] || {}), ch, count }))
      .filter((t) => t.ch && Number(t.count) > 0)
      .sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0))
  }

  const trendAttempts = completed
    .map(a => ({ a, scores: a.scores?.total ? a.scores : (computeScoresFromAnswers(a) || a.scores || {}) }))
    .filter(x => x.scores?.total)
    .sort((x, y) => new Date(x.a.started_at).getTime() - new Date(y.a.started_at).getTime())

  const trendData = trendAttempts.length >= 2 ? {
    labels: trendAttempts.map(x => {
      const t = TESTS.find(tt => tt.id === (x.a.test_id === 'practice_test_11' ? 'pre_test' : x.a.test_id))
      const d = new Date(x.a.started_at).toLocaleDateString()
      return `${t?.label || x.a.test_id} · ${d}`
    }),
    datasets: [{
      label: 'Total Score',
      data: trendAttempts.map(x => x.scores.total),
      borderColor: '#0284c7',
      backgroundColor: 'rgba(2,132,199,.08)',
      pointBackgroundColor: '#f59e0b',
      tension: 0.25,
      fill: true,
    }]
  } : null

  if (loading) return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />
      <div className="page" style={{display:'flex',alignItems:'center',justifyContent:'center',color:'#565a63'}}>Loading…</div>
    </div>
  )

  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />
      <div className="page fade-up" style={{ overflowX: 'hidden' }}>
        {isAdminPreview && (() => {
          const isTutorUser = profile?.role === "tutor"
          return (
          <div className="card" style={{ marginBottom: 18, background: "#16181d", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{isTutorUser ? "Tutor View" : "Admin View"}</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.88 }}>
                  {"You\u0027re previewing "}{displayProfile?.full_name || "this student"}{"'s dashboard. Troubleshooting links work, but data-changing actions are read-only here."}
                </div>
              </div>
              <Link className="btn btn-outline" to={isTutorUser ? "/tutor" : "/admin"} style={{ color: "white", borderColor: "rgba(255,255,255,.24)", background: "rgba(255,255,255,.08)" }}>
                {isTutorUser ? "Back to Students" : "Back to Admin"}
              </Link>
            </div>
          </div>
          )
        })()}

        {/* Hero — logo + brand text, full width */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 22,
            padding: '32px 28px',
            background: '#16181d',
            borderRadius: 12,
            marginBottom: 24,
            overflow: 'hidden',
            flexWrap: 'wrap',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          <motion.img
            src="/logo.png"
            alt="The Agora Project"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            style={{
              width: 96,
              height: 96,
              flexShrink: 0,
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,.3))',
            }}
          />
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            style={{ textAlign: 'left' }}
          >
            <div style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 'clamp(22px, 3vw, 32px)',
              fontWeight: 600,
              color: 'white',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              wordBreak: 'break-word',
            }}>
              The Agora Project
            </div>
            <div style={{
              fontSize: 16,
              color: 'rgba(255,255,255,.65)',
              fontWeight: 500,
              marginTop: 8,
            }}>
              Built for speed, focus, and results
            </div>
          </motion.div>
        </motion.div>

        {/* Score overview — students only */}
        {!isTutor && (
          <AnimateOnScroll animation="anim-fade-up" stagger={120} as="div" className="stats-grid">
            <ScoreOverviewCard
              label={bestScoreLabel}
              value={bestSatRecord ? formatExamSubscore(exam, bestSatRecord.scores, 'total') : '—'}
              sub={bestSatRecord ? `${TESTS.find((t) => t.id === (bestSatRecord.attempt.test_id === 'practice_test_11' ? 'pre_test' : bestSatRecord.attempt.test_id))?.label || 'Completed test'}` : 'All-time high'}
              icon="sparkle"
              dark={Boolean(bestSatRecord?.scores?.total)}
              to={bestSatRecord ? viewHref(`/results/${bestSatRecord.attempt.id}`) : ''}
            />
            <ScoreOverviewCard
              label="Highest Test"
              value={highestTestRecord ? formatExamSubscore(exam, highestTestRecord.scores, 'total') : '—'}
              sub={highestTestRecord ? `${TESTS.find((t) => t.id === (highestTestRecord.attempt.test_id === 'practice_test_11' ? 'pre_test' : highestTestRecord.attempt.test_id))?.label || 'Highest full-length test'}` : 'No full-length test recorded yet'}
              icon="test"
              to={highestTestRecord ? viewHref(`/results/${highestTestRecord.attempt.id}`) : ''}
            />
            <ScoreOverviewCard
              label="Most Recent Test"
              value={mostRecentRecord ? formatExamSubscore(exam, mostRecentRecord.scores, 'total') : '—'}
              sub={mostRecentRecord ? `${TESTS.find((t) => t.id === (mostRecentRecord.attempt.test_id === 'practice_test_11' ? 'pre_test' : mostRecentRecord.attempt.test_id))?.label || 'Latest test'} · ${new Date(mostRecentRecord.attempt.started_at).toLocaleDateString()}` : 'No completed attempt yet'}
              icon="results"
              to={mostRecentRecord ? viewHref(`/results/${mostRecentRecord.attempt.id}`) : ''}
            />
            <ScoreOverviewCard
              label="Total Improvement"
              value={improvement !== null ? `${improvement > 0 ? '+' : ''}${improvement}` : '—'}
              sub={improvement !== null ? improvementLabel : `${completed.length} completed · ${inProgress.length} in progress`}
              icon="chart"
              dark={improvement !== null && improvement !== 0}
            />
            <ScoreOverviewCard
              label="Percentile"
              value={bestPercentile !== null ? `${bestPercentile}${bestPercentile < 100 ? '' : ''}` : '—'}
              sub={bestPercentile !== null ? `Top ${100 - bestPercentile}% of test takers` : 'Complete a test to see percentile'}
              icon="target"
              dark={bestPercentile !== null && bestPercentile >= 75}
            />
            <ScoreOverviewCard
              label="Superscore"
              value={superscore ? superscore.total : '—'}
              sub={superscore
                ? `R&W ${superscore.sections.rw} + M ${superscore.sections.math}${superscorePercentile ? ` · ${superscorePercentile}th %ile` : ''}`
                : 'Best section scores across all tests'}
              icon="star"
              dark={Boolean(superscore)}
            />
        </AnimateOnScroll>
        )}

        {/* Pre Test CTA — shown under stats when not yet taken (or only prior score entered) */}
        {!isTutor && (completedRealPre.length === 0 || preInProgress) && (
          <AnimateOnScroll animation="anim-slide-up" duration={600} delay={200}>
            <div className="card dashboard-pretest-card" style={{marginBottom:24, background:'#16181d', color:'white'}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16}}>
                <div>
                  <div style={{fontFamily:'Fraunces, Georgia, serif', fontSize:18, fontWeight:600, marginBottom:4, display: 'flex', alignItems: 'center', gap: 8}}>
                    <Icon name="test" size={18} />
                    {preTestConfig?.label || 'Pre Test'}
                  </div>
                  <div style={{fontSize:13, opacity:.7}}>
                    {onlyPriorScore
                      ? `You entered a prior score. Take the full diagnostic to get a detailed breakdown of your strengths and weaknesses.`
                      : `${examConfig.moduleOrder.length} sections · ${totalQuestions} questions · ${totalDuration} · Timed like the real ${examConfig.label}`}
                  </div>
                </div>
                {preInProgress ? (
                  <div style={{display:'flex', gap:10}}>
                    <button className="btn" disabled={readOnlyView} onClick={() => navigate(`/test/${preInProgress.id}`)}
                      style={{background:'#f59e0b', color:'#16181d', fontWeight:700}}>
                      {readOnlyView ? 'Preview only' : 'Resume'}
                    </button>
                  </div>
                ) : (
                  <button className="btn" onClick={() => startNewTest(examConfig.preTestId)} disabled={startingTest || readOnlyView}
                    style={{background:'#f59e0b', color:'#16181d', fontWeight:700}}>
                    {readOnlyView ? 'Preview only' : startingTest ? <><span className="spinner" style={{borderTopColor:'#16181d'}} /> Starting...</> : `Start ${preTestConfig?.shortLabel || 'Pre Test'}`}
                  </button>
                )}
              </div>
              {confirmStart && (
                <div style={{ marginTop: 14, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Ready to start?</div>
                  <div style={{ fontSize: 13, opacity: .8, lineHeight: 1.6 }}>
                    This is a full timed {examConfig.label} test ({totalDuration}). Once you start, your timer runs.
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                    <button className="btn" onClick={() => setConfirmStart(false)} style={{ background: 'rgba(255,255,255,.14)', color: 'white' }}>
                      Cancel
                    </button>
                    <button className="btn" onClick={() => startNewTest(examConfig.preTestId)} disabled={readOnlyView} style={{ background: '#f59e0b', color: '#16181d', fontWeight: 600 }}>
                      {readOnlyView ? 'Preview only' : 'Start Test'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </AnimateOnScroll>
        )}

        {/* Resource cards grid */}
        {!isTutor && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
            gap: 16,
            marginBottom: 28,
          }}>
            {[
              { title: 'Study Guide', desc: `Master every ${examConfig.label} topic with guided lessons, practice questions, and chapter-by-chapter progress tracking.`, btn: 'Learn more', href: viewHref('/guide'), color: '#0284c7', icon: 'guide' },
              { title: 'Test Strategies', desc: `Time management, elimination techniques, and section-specific tips to maximize your ${examConfig.label} score.`, btn: 'Learn more', href: viewHref('/strategies'), color: '#166534', icon: 'target' },
              { title: 'More Practice', desc: 'Additional practice questions organized by topic to reinforce weak areas and build confidence.', btn: 'Practice now', href: viewHref('/practice'), color: '#84cc16', icon: 'star' },

              { title: 'Mistake Notebook', desc: 'Track every missed question, review explanations, and validate your understanding to close knowledge gaps.', btn: 'Review mistakes', href: viewHref('/mistakes'), color: '#f59e0b', icon: 'mistakes' },
              { title: 'Progress Report', desc: 'Detailed analytics on score trends, improvement over time, and study completion rates.', btn: 'View report', href: viewHref('/report'), color: '#8b5cf6', icon: 'chart' },

              { title: 'Extra Tests', desc: `Full-length ${examConfig.label} practice tests beyond the pre-test to simulate real exam conditions.`, btn: 'View tests', href: viewHref('/extra-tests'), color: '#0284c7', icon: 'test' },
              { title: 'Tasks', desc: 'View and manage your daily study tasks, track what needs to be done, and stay on top of your prep schedule.', btn: 'View tasks', href: viewHref('/tasks'), color: '#6366f1', icon: 'task' },
              { title: 'Journey Planner', desc: 'Adaptive daily study plan that updates based on your weak topics, availability, and target test date.', btn: 'View journey', href: viewHref('/journey'), color: '#06b6d4', icon: 'calendar' },
              { title: 'College Recruiting', desc: 'Discover colleges that match your scores, filter by cost, location, and size, and see your admission chances.', btn: 'Explore schools', href: viewHref('/college-recruiting'), color: '#16181d', icon: 'students' },
              { title: 'Calendar', desc: 'See your full study schedule, set your test date, mark available days, and plan your prep timeline.', btn: 'Open calendar', href: viewHref('/calendar'), color: '#f97316', icon: 'calendar' },
              { title: 'About', desc: 'Learn about The Agora Project, how it works, and the tools available to help you succeed.', btn: 'Learn more', href: viewHref('/about'), color: '#3f434b', icon: 'info' },
            ].map((r) => (
              <Link key={r.title} to={r.href} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  background: '#f7f5ef',
                  borderRadius: 12,
                  padding: '28px 24px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow .2s ease, transform .2s ease',
                  border: '1px solid #e4e0d5',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(22,24,29,.06)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: `${r.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 18, flexShrink: 0,
                  }}>
                    <Icon name={r.icon} size={22} style={{ color: r.color }} />
                  </div>
                  <div style={{
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#16181d',
                    marginBottom: 10,
                  }}>{r.title}</div>
                  <div style={{
                    fontSize: 14,
                    color: '#565a63',
                    lineHeight: 1.7,
                    flex: 1,
                    marginBottom: 18,
                  }}>{r.desc}</div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    padding: '8px 18px',
                    borderRadius: 999,
                    border: `1.5px solid ${r.color}`,
                    fontSize: 13,
                    fontWeight: 700,
                    color: r.color,
                    background: 'transparent',
                  }}>{r.btn}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Tutor CTA — primary action for tutors */}
        {isTutor && !isAdminPreview && (
          <AnimateOnScroll animation="anim-scale-up" duration={500} delay={100}>
          <div className="card dashboard-tutor-cta">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 className="dashboard-section-title" style={{ color: 'white', marginBottom: 4 }}>
                  <Icon name="students" size={20} />
                  Your Students
                </h2>
                <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.6 }}>
                  View student progress, test results, and analytics.
                </div>
              </div>
              <button className="btn" onClick={() => navigate('/tutor')}>
                Open Tutor Dashboard
              </button>
            </div>
          </div>
          </AnimateOnScroll>
        )}

        {/* Completed tests */}
        {!isTutor && completed.length > 0 && (
          <AnimateOnScroll animation="anim-blur-in" duration={700} delay={100}>
          <div className="card dashboard-section-card">
            <h2 style={{fontFamily:'Fraunces, Georgia, serif', fontSize:17, fontWeight:600, marginBottom:16, display:'flex', alignItems:'center', gap:10}}>
              <SectionIcon name="results" color="#0284c7" />
              Your Test Results
            </h2>
	            <div style={{overflowX:'auto'}}>
	              <table style={{width:'100%', borderCollapse:'collapse'}}>
	                <thead>
	                  <tr>
                      {[
                        'Test',
                        'Date',
                        ...scoreColumns.map((column) => column.label),
                        'Post-Test',
                        'Gain',
                        ''
                      ].map(h => (
	                        <th key={h} style={{padding:'8px 12px', textAlign:'left', fontSize:11, color:'#16181d', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', background:'#f0f4f8', borderBottom:'1px solid #e4e0d5'}}>
	                        {h}
	                      </th>
	                    ))}
	                  </tr>
	                </thead>
	                <tbody>
		                  {completed.map(a => {
		                    const rowScores = a.scores?.total ? a.scores : (computeScoresFromAnswers(a) || a.scores || {})
		                    const cfg = TESTS.find(t => t.id === (a.test_id === 'practice_test_11' ? 'pre_test' : a.test_id))
		                    const post = postScores.find(p => p.attempt_id === a.id)
		                    const gain = post ? post.post_score - (rowScores?.total || 0) : null
		                    return (
		                      <tr key={a.id} style={{borderBottom:'1px solid #f3f0e9'}}>
		                        <td style={{padding:'12px', fontWeight:600, color:'#16181d'}}>{cfg?.label || a.test_id}</td>
		                        <td style={{padding:'12px'}}>{new Date(a.started_at).toLocaleDateString()}</td>
                        {scoreColumns.map((column) => (
                          <td
                            key={`${a.id}-${column.key}`}
                            style={{
                              padding:'12px',
                              fontWeight: column.key === 'total' ? 600 : 700,
                              fontFamily: column.key === 'total' ? 'Fraunces, Georgia, serif' : 'inherit',
                              fontSize: column.key === 'total' ? 16 : 14,
                              color: column.key === 'total' ? '#16181d' : 'inherit'
                            }}
                          >
                            {formatExamSubscore(exam, rowScores, column.key)}
                          </td>
                        ))}
                        <td style={{padding:'12px'}}>
                          {addingPost === a.id ? (
                            <div style={{display:'flex', gap:6}}>
                              <input
                                type="number"
                                min={400}
                                max={1600}
                                placeholder="Score"
                                value={postInput}
                                onChange={e => setPostInput(e.target.value)}
                                style={{width:80, padding:'5px 8px', border:'1.5px solid #e4e0d5', borderRadius:7, fontSize:13}} />
                              <button onClick={() => savePostScore(a.id)} style={{padding:'5px 10px', background:'#10b981', color:'white', border:'none', borderRadius:7, cursor:'pointer', fontSize:12}}>Save</button>
                              <button onClick={() => setAddingPost(null)} style={{padding:'5px 8px', background:'#f3f0e9', border:'none', borderRadius:7, cursor:'pointer', fontSize:12}}>Cancel</button>
                            </div>
                          ) : post ? (
                            <span style={{fontFamily:'Fraunces, Georgia, serif', fontWeight:600, color:'#10b981'}}>{post.post_score}</span>
                          ) : (
                            <button onClick={() => setAddingPost(a.id)}
                              disabled={readOnlyView}
                              style={{padding:'4px 10px', background:'#f3f0e9', border:'1px solid #e4e0d5', borderRadius:7, fontSize:12, cursor:'pointer', color:'#3f434b'}}>
                              {readOnlyView ? 'Preview only' : '+ Add'}
                            </button>
                          )}
                        </td>
                        <td style={{padding:'12px'}}>
                          {gain !== null && (
                            <span style={{fontFamily:'Fraunces, Georgia, serif', fontWeight:600, color: gain > 0 ? '#10b981' : '#ef4444'}}>
                              {gain > 0 ? '+' : ''}{gain}
                            </span>
                          )}
                        </td>
                        <td style={{padding:'12px'}}>
                          <Link to={viewHref(`/results/${a.id}`)} style={{fontSize:12, color:'#16181d', fontWeight:600}}>
                            View →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          </AnimateOnScroll>
        )}

        {/* Score trend (hidden until pretest is taken) */}
        {!isTutor && hasTakenPretest && trendData && (
          <AnimateOnScroll animation="anim-scale-up" duration={700} delay={150}>
          <div className="card dashboard-section-card" style={{ marginTop: 24 }}>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 17, fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
              <SectionIcon name="chart" color="#10b981" />
              Your Improvement
            </h2>
            <div style={{ color: '#565a63', fontSize: 13, marginBottom: 12 }}>
              Track how your scores change across the Pre Test and optional skill builders.
            </div>
            <div style={{ height: 220 }}>
              <Line
                data={trendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { font: { family: 'DM Sans', size: 10 } }, grid: { display: false } },
                    y: { min: 400, max: 1600, ticks: { font: { family: 'DM Sans', size: 10 } }, grid: { color: '#eceadf' } }
                  }
                }}
              />
            </div>
          </div>
          </AnimateOnScroll>
        )}
      </div>
    </div>
  )
}
