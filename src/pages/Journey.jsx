import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Icon from '../components/AppIcons.jsx'
import { motion } from 'framer-motion'
import { getExamConfig, getChaptersForExam, calcWeakTopicsForTest } from '../data/examData.js'
import { getExamFromTestId, getTestsForExam } from '../data/tests.js'
import { getAnswerKeyBySection } from '../data/answerKeys.js'
import { loadDashboardViewData } from '../lib/dashboardData.js'
import { resolveViewContext, withExam, withViewUser } from '../lib/viewAs.js'
import { getInitialPreferredExam } from '../lib/examChoice.js'
import { hasUnlockedResources } from '../lib/pretestGate.js'
import { buildAdaptiveSchedule, loadSatTestDate, loadStudyPrefs, normalizeWeakTopics, allChaptersAsWeakTopics } from '../lib/studyPlan.js'

function statusColor(status) {
  if (status === 'DONE') return '#10b981'
  if (status === 'IN PROGRESS') return '#f59e0b'
  if (status === 'NOT STARTED') return '#ef4444'
  if (status === 'LOCKED') return '#8a8f98'
  return '#8a8f98'
}

function statusBg(status) {
  if (status === 'DONE') return 'rgba(16,185,129,.08)'
  if (status === 'IN PROGRESS') return 'rgba(245,158,11,.08)'
  if (status === 'NOT STARTED') return 'rgba(239,68,68,.06)'
  return 'transparent'
}

function borderColor(status) {
  if (status === 'DONE') return '#10b981'
  if (status === 'IN PROGRESS') return '#f59e0b'
  if (status === 'NOT STARTED') return '#ef4444'
  if (status === 'LOCKED') return '#cbd5e1'
  return '#e4e0d5'
}

function statusIcon(status) {
  if (status === 'DONE') return 'check'
  if (status === 'IN PROGRESS') return 'task'
  return 'guide'
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function Journey() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const requestedExam = useMemo(
    () => String(new URLSearchParams(location.search || '').get('exam') || '').toLowerCase(),
    [location.search]
  )
  const exam = requestedExam === 'sat' ? requestedExam : getInitialPreferredExam(user)
  const examConfig = useMemo(() => getExamConfig(exam), [exam])
  const examTests = useMemo(() => getTestsForExam(exam), [exam])
  const chapters = useMemo(() => getChaptersForExam(exam), [exam])
  const { viewUserId, isAdminPreview } = useMemo(
    () => resolveViewContext({ userId: user?.id, profile, search: location.search }),
    [user?.id, profile, location.search]
  )

  const [loading, setLoading] = useState(true)
  const [attempts, setAttempts] = useState([])
  const [studied, setStudied] = useState({})
  const [studiedRows, setStudiedRows] = useState([])
  const [mistakes, setMistakes] = useState([])
  const [reviewItems, setReviewItems] = useState({})

  const [satDate, setSatDate] = useState(() => loadSatTestDate(viewUserId, exam))
  const [studyPrefs, setStudyPrefs] = useState(() => loadStudyPrefs(viewUserId, exam))

  useEffect(() => {
    setSatDate(loadSatTestDate(viewUserId, exam))
    setStudyPrefs(loadStudyPrefs(viewUserId, exam))
  }, [viewUserId, exam])

  useEffect(() => {
    if (!viewUserId) return
    let cancelled = false
    setLoading(true)

    loadDashboardViewData(viewUserId).then((data) => {
      if (cancelled) return
      setAttempts(data?.attempts || [])
      setStudied(data?.studiedMap || {})
      setStudiedRows(data?.studiedRows || [])
      setMistakes(data?.mistakes || [])
      setReviewItems(data?.reviewItems || {})
      setLoading(false)
    }).catch(() => {
      if (cancelled) return
      setAttempts([])
      setStudied({})
      setStudiedRows([])
      setMistakes([])
      setReviewItems({})
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [viewUserId])

  const viewHref = (path) => withViewUser(withExam(path, exam), viewUserId, isAdminPreview)

  // Filter data for current exam
  const examAttemptIds = new Set(examTests.map((t) => t.id))
  const completed = attempts.filter((a) => (a.completed_at || a.scores?.total) && examAttemptIds.has(a.test_id === 'practice_test_11' ? 'pre_test' : a.test_id))
  const inProgress = attempts.filter((a) => !a.completed_at && examAttemptIds.has(a.test_id === 'practice_test_11' ? 'pre_test' : a.test_id))
  const studiedForExam = Object.fromEntries(Object.entries(studied || {}).filter(([ch]) => Boolean(chapters?.[ch])))
  const studiedRowsForExam = (studiedRows || []).filter((r) => Boolean(chapters?.[r.chapter_id]))
  const latestCompleted = completed[0] || null
  const completedPre = completed.filter((a) => a.test_id === examConfig.preTestId || (exam === 'sat' && a.test_id === 'practice_test_11'))
  const preInProgress = inProgress.find((a) => a.test_id === examConfig.preTestId || (exam === 'sat' && a.test_id === 'practice_test_11'))
  const hasTakenPretest = completedPre.length > 0
  const hasStudyPlan = Boolean(satDate)

  const latestMistakes = latestCompleted
    ? (mistakes || []).filter((m) => String(m.attempt_id || '') === String(latestCompleted.id))
    : []
  const allExamMistakes = (mistakes || []).filter((m) => getExamFromTestId(m?.test_id) === exam)
  const allExamValidated = allExamMistakes.filter((m) => {
    const key = `${m.test_id}:${m.section}:${m.q_num}`
    return reviewItems?.[key]?.last_correct === true
  }).length
  const latestValidated = latestMistakes.filter((m) => {
    const key = `${m.test_id}:${m.section}:${m.q_num}`
    return reviewItems?.[key]?.last_correct === true
  }).length
  const reviewTodoCount = Math.max(0, allExamMistakes.length - allExamValidated)

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
  const viewedLatestResults = latestCompleted ? hasViewedResultsForAttempt(latestCompleted.id) : false

  const hasStartedGuide = (studiedRowsForExam || []).some((r) => {
    const g = r?.practice?.guide
    if (r?.practice?.meta?.guide_started_at) return true
    return g && typeof g === 'object' && Object.values(g).some(Boolean)
  })

  const studiedCount = Object.values(studiedForExam).filter(Boolean).length
  const studiedPct = Math.round((studiedCount / Math.max(1, examConfig.guideCompletionTarget)) * 100)

  const reviewJourneyStatus = (() => {
    const total = latestMistakes.length
    if (total === 0) return hasTakenPretest ? 'DONE' : 'NOT STARTED'
    if (latestValidated === 0) return 'NOT STARTED'
    if (latestValidated < total) return 'IN PROGRESS'
    return 'DONE'
  })()

  function deriveWeakTopicsForAttempt(attempt) {
    const keyBySection = getAnswerKeyBySection(attempt?.test_id)
    if (keyBySection && attempt?.answers && Object.keys(attempt.answers).length) {
      const computed = calcWeakTopicsForTest(attempt.test_id, attempt.answers, keyBySection)
      if (computed.length) return computed
    }
    const normalized = normalizeWeakTopics(attempt?.weak_topics || [])
    if (normalized.length) return normalized
    const list = (mistakes || []).filter((m) => String(m.attempt_id || '') === String(attempt?.id || '') && m.chapter_id)
    const counts = {}
    for (const m of list) {
      const ch = String(m.chapter_id)
      counts[ch] = (counts[ch] || 0) + 1
    }
    return Object.entries(counts)
      .map(([ch, count]) => ({ ...(chapters?.[ch] || {}), ch, count }))
      .filter((t) => t.ch && Number(t.count) > 0)
      .sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0))
  }

  // Build the adaptive schedule to extract the full list of journey tasks
  const schedule = useMemo(() => {
    const weakTopics = latestCompleted
      ? deriveWeakTopicsForAttempt(latestCompleted)
      : allChaptersAsWeakTopics(exam)
    return buildAdaptiveSchedule({
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
  }, [hasTakenPretest, latestCompleted, studiedForExam, reviewTodoCount, viewedLatestResults, studyPrefs, satDate, mistakes, exam])

  // Flatten all tasks from all days for the journey timeline view
  const allTasks = useMemo(() => {
    if (!schedule?.days?.length) return []
    const seen = new Set()
    const tasks = []
    for (const day of schedule.days) {
      for (const task of (day.tasks || [])) {
        // Deduplicate by chapterId for guide tasks, keep all review tasks
        const dedupKey = task.type === 'guide' ? `guide:${task.chapterId}` : `${task.type}:${task.id}`
        if (seen.has(dedupKey)) continue
        seen.add(dedupKey)
        tasks.push({ ...task, dayLabel: day.label, dayKey: day.key })
      }
    }
    return tasks
  }, [schedule])

  const completedTasks = allTasks.filter((t) => t.completed)
  const totalTasks = allTasks.length
  const overallPct = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0

  // The 5 high-level journey steps (same structure as Dashboard)
  const toReview = Math.max(0, (latestMistakes?.length || 0) - (latestValidated || 0))
  const journeySteps = [
    {
      title: '1) Take the Pretest',
      status: hasTakenPretest ? 'DONE' : (preInProgress ? 'IN PROGRESS' : 'TODO'),
      desc: `Take the full timed ${examConfig.label} Pre Test to set your baseline.`,
      href: hasTakenPretest && latestCompleted
        ? viewHref(`/results/${latestCompleted.id}`)
        : viewHref('/dashboard'),
    },
    {
      title: '2) Study Plan',
      status: hasStudyPlan ? 'DONE' : 'TODO',
      desc: `Set your ${examConfig.label} date and use the adaptive plan for daily guidance.`,
      href: viewHref('/calendar'),
    },
    {
      title: '3) Review Results',
      status: viewedLatestResults ? 'DONE' : 'TODO',
      desc: latestCompleted?.id
        ? 'Open your most recent results and identify weak topics.'
        : 'Complete a test to see results.',
      href: latestCompleted ? viewHref(`/results/${latestCompleted.id}`) : viewHref('/dashboard'),
    },
    {
      title: '4) Review Missed Questions',
      status: reviewJourneyStatus,
      desc: `To review: ${toReview} · Validated: ${latestValidated}/${latestMistakes.length}`,
      href: viewHref('/mistakes'),
    },
    {
      title: '5) Study Guide',
      status: studiedCount >= examConfig.guideCompletionTarget ? 'DONE' : (hasStartedGuide ? 'IN PROGRESS' : 'TODO'),
      desc: `Master chapters (${studiedCount}/${examConfig.guideCompletionTarget}) to mark them complete.`,
      href: viewHref('/guide'),
    },
  ]

  const stepsCompleted = journeySteps.filter((s) => s.status === 'DONE').length
  const stepsPct = Math.round((stepsCompleted / journeySteps.length) * 100)

  if (loading) {
    return (
      <div className="app-layout has-sidebar">
        <Sidebar currentExam={exam} />
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#565a63' }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />
      <div className="page fade-up">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ marginBottom: 24 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 24,
                fontWeight: 600,
                color: '#16181d',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 6,
              }}>
                <span style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0284c7',
                  color: 'white',
                  boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                }}>
                  <Icon name="calendar" size={18} />
                </span>
                Smart Journey
              </h1>
              <p style={{ color: '#565a63', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Your personalized {examConfig.label} study plan overview. Complete each step to unlock the Final Test.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link className="btn btn-outline" to={viewHref('/dashboard')} style={{ padding: '8px 14px', fontSize: 12 }}>
                <Icon name="home" size={14} /> Dashboard
              </Link>
              <Link className="btn btn-outline" to={viewHref('/calendar')} style={{ padding: '8px 14px', fontSize: 12 }}>
                <Icon name="calendar" size={14} /> Calendar
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Overall Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="card"
          style={{ marginBottom: 24, padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 16, fontWeight: 600, color: '#16181d', marginBottom: 4 }}>
                Journey Progress
              </div>
              <div style={{ fontSize: 13, color: '#565a63', lineHeight: 1.5 }}>
                {stepsCompleted} of {journeySteps.length} milestones completed
                {hasTakenPretest && schedule ? ` · ${completedTasks.length} of ${totalTasks} study tasks done` : ''}
              </div>
            </div>
            <div style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 28,
              fontWeight: 600,
              color: stepsPct >= 80 ? '#10b981' : stepsPct >= 40 ? '#f59e0b' : '#0284c7',
            }}>
              {stepsPct}%
            </div>
          </div>
          <div style={{
            height: 12,
            background: '#f3f0e9',
            borderRadius: 999,
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, stepsPct)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              style={{
                height: '100%',
                borderRadius: 999,
                background: stepsPct >= 80
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : stepsPct >= 40
                    ? '#d97706'
                    : '#0284c7',
              }}
            />
          </div>

          {/* Study guide sub-progress */}
          {hasTakenPretest && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#565a63', fontWeight: 600, marginBottom: 6 }}>
                <span>Study Guide Chapters</span>
                <span>{studiedCount}/{examConfig.guideCompletionTarget}</span>
              </div>
              <div style={{ height: 6, background: '#f3f0e9', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, studiedPct)}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.35 }}
                  style={{
                    height: '100%',
                    borderRadius: 999,
                    background: studiedPct >= 80 ? '#10b981' : studiedPct >= 40 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
            </div>
          )}

          {/* Task-level progress when schedule exists */}
          {hasTakenPretest && schedule && totalTasks > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#565a63', fontWeight: 600, marginBottom: 6 }}>
                <span>Study Tasks Completed</span>
                <span>{completedTasks.length}/{totalTasks}</span>
              </div>
              <div style={{ height: 6, background: '#f3f0e9', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, overallPct)}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.45 }}
                  style={{
                    height: '100%',
                    borderRadius: 999,
                    background: overallPct >= 80 ? '#10b981' : overallPct >= 40 ? '#f59e0b' : '#0284c7',
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Journey Milestones - vertical timeline */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="card"
          style={{ marginBottom: 24, padding: '20px 24px' }}
        >
          <h2 style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 17,
            fontWeight: 600,
            color: '#16181d',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0284c7',
              color: 'white',
              boxShadow: '0 1px 3px rgba(22,24,29,.06)',
            }}>
              <Icon name="task" size={16} />
            </span>
            Milestones
          </h2>
          <p style={{ color: '#565a63', fontSize: 13, lineHeight: 1.6, margin: '0 0 18px 0' }}>
            Complete these steps in order to be fully prepared for the final test.
          </p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ position: 'relative', paddingLeft: 28 }}
          >
            {/* Timeline vertical line */}
            <div style={{
              position: 'absolute',
              left: 11,
              top: 6,
              bottom: 6,
              width: 2,
              background: 'linear-gradient(180deg, #0284c7, #e4e0d5)',
              borderRadius: 999,
            }} />

            {journeySteps.map((step, idx) => {
              const disabled = step.status === 'LOCKED'
              const color = statusColor(step.status)
              return (
                <motion.div key={step.title} variants={fadeInUp} style={{ position: 'relative', marginBottom: idx < journeySteps.length - 1 ? 12 : 0 }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: -22,
                    top: 16,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: step.status === 'DONE' ? '#10b981' : step.status === 'IN PROGRESS' ? '#f59e0b' : '#e4e0d5',
                    border: `2px solid ${step.status === 'DONE' ? '#10b981' : step.status === 'IN PROGRESS' ? '#f59e0b' : '#cbd5e1'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}>
                    {step.status === 'DONE' && (
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <Link
                    to={disabled ? '#' : step.href}
                    onClick={disabled ? (e) => e.preventDefault() : undefined}
                    style={{
                      display: 'block',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid rgba(2,132,199,.12)',
                      borderLeft: `4px solid ${borderColor(step.status)}`,
                      borderRadius: 12,
                      padding: '16px 18px',
                      background: disabled ? '#f7f5ef' : '#ffffff',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.6 : 1,
                      transition: 'box-shadow .2s ease, transform .15s ease',
                      boxShadow: '0 1px 4px rgba(22,24,29,.04)',
                    }}
                    onMouseEnter={(e) => {
                      if (!disabled) e.currentTarget.style.boxShadow = '0 1px 3px rgba(22,24,29,.06)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(22,24,29,.04)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 30,
                          height: 30,
                          borderRadius: 9,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: step.status === 'DONE'
                            ? 'rgba(16,185,129,.15)'
                            : step.status === 'IN PROGRESS'
                              ? 'rgba(245,158,11,.15)'
                              : 'rgba(138,143,152,.12)',
                          color: color,
                          flexShrink: 0,
                        }}>
                          <Icon name={statusIcon(step.status)} size={15} />
                        </span>
                        <div style={{ fontWeight: 600, color: '#16181d', fontSize: 14 }}>{step.title}</div>
                      </div>
                      <div style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: color,
                        background: statusBg(step.status),
                        padding: '4px 12px',
                        borderRadius: 999,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {step.status}
                      </div>
                    </div>
                    <div style={{ marginTop: 8, color: '#565a63', fontSize: 13, lineHeight: 1.6, paddingLeft: 40 }}>
                      {step.desc}
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Final test unlock notice */}
          <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link className="btn btn-outline" to={viewHref('/report')} style={{ padding: '8px 14px', fontSize: 12 }}>
              Progress Report
            </Link>
            {(() => {
              const unlocked = studiedCount >= examConfig.guideCompletionTarget && hasTakenPretest
              return (
                <span style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  background: unlocked ? 'rgba(16,185,129,.12)' : 'rgba(138,143,152,.10)',
                  color: unlocked ? '#059669' : '#8a8f98',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <Icon name={unlocked ? 'check' : 'guide'} size={14} />
                  {unlocked ? 'Final Test Unlocked' : 'Complete all milestones to unlock the Final Test'}
                </span>
              )
            })()}
          </div>
        </motion.div>

        {/* Detailed Study Tasks Timeline */}
        {!hasTakenPretest ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="card"
            style={{ padding: '32px 24px', textAlign: 'center' }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#faf9f6',
              color: '#0284c7',
              marginBottom: 16,
            }}>
              <Icon name="test" size={26} />
            </div>
            <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 600, color: '#16181d', marginBottom: 8 }}>
              Take the Pre Test to Begin
            </h3>
            <p style={{ color: '#565a63', fontSize: 14, lineHeight: 1.7, maxWidth: 460, margin: '0 auto 20px' }}>
              Your Smart Journey generates a personalized study plan after you complete the {examConfig.label} Pre Test.
              Each chapter and review task is tailored to your weak topics.
            </p>
            <Link
              to={viewHref('/dashboard')}
              className="btn"
              style={{
                background: '#0284c7',
                color: 'white',
                fontWeight: 600,
                padding: '12px 24px',
                fontSize: 14,
              }}
            >
              Go to Dashboard to Start
            </Link>
          </motion.div>
        ) : allTasks.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="card"
            style={{ marginBottom: 24, padding: '20px 24px' }}
          >
            <h2 style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 17,
              fontWeight: 600,
              color: '#16181d',
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#d97706',
                color: 'white',
                boxShadow: '0 1px 3px rgba(22,24,29,.06)',
              }}>
                <Icon name="guide" size={16} />
              </span>
              Study Tasks
            </h2>
            <p style={{ color: '#565a63', fontSize: 13, lineHeight: 1.6, margin: '0 0 18px 0' }}>
              {completedTasks.length} of {totalTasks} tasks completed. Click any task to jump to that chapter or review set.
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              style={{ display: 'grid', gap: 8 }}
            >
              {allTasks.map((task, idx) => {
                const isDone = Boolean(task.completed)
                const isGuide = task.type === 'guide'
                const accentColor = isDone ? '#10b981' : isGuide ? '#0284c7' : '#f59e0b'
                const href = isGuide
                  ? viewHref(task.href)
                  : viewHref(task.href || '/mistakes')

                return (
                  <motion.div key={task.id || `task-${idx}`} variants={fadeInUp}>
                    <Link
                      to={href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '14px 16px',
                        borderRadius: 12,
                        borderLeft: `4px solid ${isDone ? '#10b981' : accentColor}`,
                        border: isDone ? '1px solid rgba(16,185,129,.25)' : '1px solid #f3f0e9',
                        borderLeftWidth: 4,
                        borderLeftStyle: 'solid',
                        borderLeftColor: isDone ? '#10b981' : accentColor,
                        background: isDone ? 'rgba(16,185,129,.04)' : '#ffffff',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'box-shadow .2s ease',
                        boxShadow: '0 1px 3px rgba(22,24,29,.03)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(22,24,29,.06)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(22,24,29,.03)'
                      }}
                    >
                      <span style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isDone
                          ? 'rgba(16,185,129,.15)'
                          : accentColor,
                        color: isDone ? '#10b981' : 'white',
                        flexShrink: 0,
                        boxShadow: isDone ? 'none' : '0 1px 3px rgba(22,24,29,.06)',
                      }}>
                        <Icon name={isDone ? 'check' : (isGuide ? 'guide' : 'mistakes')} size={15} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 600,
                          fontSize: 13,
                          color: isDone ? '#059669' : '#16181d',
                          lineHeight: 1.35,
                        }}>
                          {isDone ? '\u2713 ' : ''}{task.title}
                        </div>
                        <div style={{
                          fontSize: 12,
                          color: isDone ? '#6ee7b7' : '#565a63',
                          lineHeight: 1.5,
                          marginTop: 2,
                        }}>
                          {task.subtitle}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        {!isDone && task.estimatedMinutes > 0 && (
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#8a8f98',
                            whiteSpace: 'nowrap',
                          }}>
                            ~{task.estimatedMinutes}m
                          </span>
                        )}
                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: 999,
                          background: isDone ? 'rgba(16,185,129,.10)' : isGuide ? 'rgba(2,132,199,.08)' : 'rgba(245,158,11,.08)',
                          color: isDone ? '#10b981' : accentColor,
                          whiteSpace: 'nowrap',
                        }}>
                          {isDone ? 'DONE' : isGuide ? 'GUIDE' : 'REVIEW'}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="card"
            style={{ padding: '24px', textAlign: 'center' }}
          >
            <p style={{ color: '#565a63', fontSize: 14, lineHeight: 1.6 }}>
              Set your test date on the <Link to={viewHref('/calendar')} style={{ color: '#0284c7', fontWeight: 700 }}>Calendar</Link> page to generate your day-by-day study tasks.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
