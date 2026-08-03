import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Icon from '../components/AppIcons.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { getExamConfig, getChaptersForExam, calcWeakTopicsForTest } from '../data/examData.js'
import { getExamFromTestId, getTestsForExam } from '../data/tests.js'
import { getAnswerKeyBySection } from '../data/answerKeys.js'
import { loadDashboardViewData } from '../lib/dashboardData.js'
import { resolveViewContext, withExam, withViewUser } from '../lib/viewAs.js'
import { getInitialPreferredExam } from '../lib/examChoice.js'
import { hasUnlockedResources } from '../lib/pretestGate.js'
import { buildAdaptiveSchedule, loadSatTestDate, loadStudyPrefs, normalizeWeakTopics, allChaptersAsWeakTopics } from '../lib/studyPlan.js'

function TaskCard({ task, index, completed = false }) {
  const doneAccent = '#059669'
  const accent = completed
    ? doneAccent
    : task.type === 'guide'
      ? '#0284c7'
      : task.type === 'mistakes'
        ? '#f59e0b'
        : '#0284c7'
  const icon = completed
    ? 'check'
    : task.type === 'guide'
      ? 'guide'
      : task.type === 'mistakes'
        ? 'mistakes'
        : 'results'

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
    >
      <Link
        to={task.href}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          padding: '16px 18px',
          border: completed ? '2px solid rgba(5,150,105,.35)' : '1.5px solid rgba(2,132,199,.18)',
          borderRadius: 12,
          textDecoration: 'none',
          color: completed ? '#059669' : '#16181d',
          background: completed
            ? 'rgba(5,150,105,.06)'
            : 'white',
          boxShadow: completed
            ? '0 2px 8px rgba(5,150,105,.08)'
            : '0 1px 3px rgba(22,24,29,.06)',
          transition: 'all .2s ease',
        }}
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: completed
              ? 'rgba(5,150,105,.15)'
              : accent,
            color: completed ? doneAccent : 'white',
            flexShrink: 0,
            boxShadow: completed ? 'none' : '0 1px 3px rgba(22,24,29,.06)',
          }}
        >
          <Icon name={icon} size={17} />
        </span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: completed ? '#059669' : '#16181d',
              lineHeight: 1.35,
            }}
          >
            {completed && '\u2713 '}
            {task.title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: completed ? '#6ee7b7' : '#565a63',
              lineHeight: 1.5,
              marginTop: 3,
            }}
          >
            {task.subtitle}
          </div>
          {task.estimatedMinutes > 0 && !completed && (
            <div
              style={{
                fontSize: 11,
                color: '#8a8f98',
                marginTop: 4,
                fontWeight: 700,
              }}
            >
              ~{task.estimatedMinutes} min
            </div>
          )}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            background: completed
              ? 'rgba(5,150,105,.12)'
              : '#0284c7',
            color: completed ? '#059669' : 'white',
            flexShrink: 0,
            alignSelf: 'center',
          }}
        >
          {completed ? 'Done' : 'Start'}
          {!completed && <Icon name="arrowRight" size={12} />}
        </span>
      </Link>
    </motion.div>
  )
}

const daySectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], staggerChildren: 0.06 },
  },
}

function DaySection({ day, dayLabel, tasks, startIndex }) {
  if (!tasks.length) return null
  return (
    <motion.div
      variants={daySectionVariants}
      initial="hidden"
      animate="visible"
      style={{ marginBottom: 28 }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 13,
            fontWeight: 600,
            color: '#ffffff',
            background: '#16181d',
            padding: '6px 14px',
            borderRadius: 8,
            letterSpacing: '0.03em',
          }}
        >
          {dayLabel}
        </div>
        <div style={{ fontSize: 12, color: '#8a8f98', fontWeight: 600 }}>
          {day.label}
        </div>
        {day.focus && day.focus !== 'Rest' && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 999,
              background:
                day.focus === 'Reading'
                  ? 'rgba(2,132,199,.12)'
                  : day.focus === 'Math'
                    ? 'rgba(16,185,129,.12)'
                    : 'rgba(138,143,152,.14)',
              color:
                day.focus === 'Reading'
                  ? '#2563eb'
                  : day.focus === 'Math'
                    ? '#059669'
                    : '#565a63',
            }}
          >
            {day.focus}
          </span>
        )}
        {day.estimatedMinutes > 0 && (
          <span
            style={{
              fontSize: 11,
              color: '#8a8f98',
              fontWeight: 700,
              marginLeft: 'auto',
            }}
          >
            ~{day.estimatedMinutes} min total
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {tasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            index={startIndex + i}
            completed={!!task.completed}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default function Tasks() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const requestedExam = useMemo(
    () =>
      String(
        new URLSearchParams(location.search).get('exam') || ''
      ).toLowerCase(),
    [location.search]
  )
  const exam =
    requestedExam === 'sat'
      ? requestedExam
      : getInitialPreferredExam(user)

  const { viewUserId, isAdminPreview } = useMemo(
    () =>
      resolveViewContext({
        userId: user?.id,
        profile,
        search: location.search,
      }),
    [user?.id, profile, location.search]
  )

  const examConfig = getExamConfig(exam)
  const examTests = getTestsForExam(exam)
  const chaptersForExam = getChaptersForExam(exam)

  const [attempts, setAttempts] = useState([])
  const [studied, setStudied] = useState({})
  const [mistakes, setMistakes] = useState([])
  const [reviewItems, setReviewItems] = useState({})
  const [loading, setLoading] = useState(true)
  const [satDate, setSatDate] = useState(() =>
    loadSatTestDate(viewUserId, exam)
  )
  const [studyPrefs, setStudyPrefs] = useState(() =>
    loadStudyPrefs(viewUserId, exam)
  )

  useEffect(() => {
    setSatDate(loadSatTestDate(viewUserId, exam))
    setStudyPrefs(loadStudyPrefs(viewUserId, exam))
  }, [viewUserId, exam])

  useEffect(() => {
    if (!user || !viewUserId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await loadDashboardViewData(viewUserId)
        if (cancelled) return
        setAttempts(data?.attempts || [])
        setStudied(data?.studiedMap || {})
        setMistakes(data?.mistakes || [])
        setReviewItems(data?.reviewItems || {})
      } catch {
        if (cancelled) return
        setAttempts([])
        setStudied({})
        setMistakes([])
        setReviewItems({})
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user, viewUserId])

  const viewHref = (path) =>
    withViewUser(withExam(path, exam), viewUserId, isAdminPreview)

  const examAttemptIds = new Set(examTests.map((t) => t.id))
  const examAttempts = attempts.filter((a) => {
    const tid = a?.test_id === 'practice_test_11' ? 'pre_test' : a?.test_id
    return examAttemptIds.has(tid)
  })
  const studiedForExam = Object.fromEntries(
    Object.entries(studied || {}).filter(([chId]) =>
      Boolean(chaptersForExam?.[chId])
    )
  )
  const mistakesForExam = (mistakes || []).filter(
    (m) => getExamFromTestId(m?.test_id) === exam
  )

  const completed = examAttempts.filter(
    (a) => a.completed_at || a.scores?.total
  )
  const latestCompleted = completed.length ? completed[0] : null
  const hasTakenPretest = completed.some(
    (a) => a.test_id === examConfig.preTestId
  )

  const allExamMistakes = mistakesForExam || []
  const allExamValidated = allExamMistakes.filter((m) => {
    const k = `${m.test_id}:${m.section}:${m.q_num}`
    return reviewItems?.[k]?.last_correct === true
  }).length
  const reviewTodoCount = Math.max(
    0,
    allExamMistakes.length - allExamValidated
  )

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

  function deriveWeakTopicsForAttempt(attempt) {
    const keyBySection = getAnswerKeyBySection(attempt?.test_id)
    if (
      keyBySection &&
      attempt?.answers &&
      Object.keys(attempt.answers).length
    ) {
      const computed = calcWeakTopicsForTest(
        attempt.test_id,
        attempt.answers,
        keyBySection
      )
      if (computed.length) return computed
    }
    const normalized = normalizeWeakTopics(attempt?.weak_topics || [])
    if (normalized.length) return normalized
    const list = (mistakes || []).filter(
      (m) =>
        String(m.attempt_id || '') === String(attempt?.id || '') &&
        m.chapter_id
    )
    const counts = {}
    for (const m of list) {
      const ch = String(m.chapter_id)
      counts[ch] = (counts[ch] || 0) + 1
    }
    return Object.entries(counts)
      .map(([ch, count]) => ({
        ...(chaptersForExam?.[ch] || {}),
        ch,
        count,
      }))
      .filter((t) => t.ch && Number(t.count) > 0)
      .sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0))
  }

  const viewedLatestResults = latestCompleted
    ? hasViewedResultsForAttempt(latestCompleted.id)
    : false

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
          const href =
            task.type === 'results'
              ? `/results/${latestCompleted.id}`
              : task.href
          return { ...task, href: viewHref(href) }
        }),
      })),
    }
  }, [
    hasTakenPretest,
    latestCompleted,
    studiedForExam,
    reviewTodoCount,
    viewedLatestResults,
    studyPrefs,
    satDate,
    mistakes,
    exam,
  ])

  // Separate today's tasks from upcoming days
  const todayDay = journeySchedule?.days?.find((d) => d.isToday) || null
  const todayTasks = todayDay?.tasks || []

  const upcomingDays = useMemo(() => {
    if (!journeySchedule?.days) return []
    return journeySchedule.days
      .filter((d) => !d.isToday && d.tasks.length > 0)
  }, [journeySchedule])

  // Compute stats for the header
  const totalTodayTasks = todayTasks.length
  const completedTodayTasks = todayTasks.filter((t) => t.completed).length
  const todayProgress =
    totalTodayTasks > 0
      ? Math.round((completedTodayTasks / totalTodayTasks) * 100)
      : 0

  if (loading) {
    return (
      <div className="app-layout has-sidebar">
        <Sidebar currentExam={exam} />
        <div
          className="page"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#565a63',
          }}
        >
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />
      <motion.div
        className="page fade-up"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ marginBottom: 28 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      '#16181d',
                    color: 'white',
                    boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                  }}
                >
                  <Icon name="task" size={20} />
                </span>
                <h1
                  style={{
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: 24,
                    fontWeight: 600,
                    color: '#16181d',
                    margin: 0,
                  }}
                >
                  Today's Tasks
                </h1>
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: '#565a63',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Your personalized study schedule adapts based on your
                progress. Complete tasks to stay on track for the SAT.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link
                to={viewHref('/calendar')}
                className="btn btn-outline"
                style={{ padding: '8px 14px', fontSize: 12 }}
              >
                <Icon name="calendar" size={14} /> View Calendar
              </Link>
              <Link
                to={viewHref('/dashboard')}
                className="btn btn-outline"
                style={{ padding: '8px 14px', fontSize: 12 }}
              >
                Dashboard
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Tasks view */}
        {journeySchedule && (
          <>
            {/* Today's progress bar */}
            {totalTodayTasks > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="card"
                style={{
                  marginBottom: 24,
                  padding: '16px 20px',
                  background:
                    '#faf9f6',
                  border: '1.5px solid rgba(2,132,199,.15)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#16181d',
                    }}
                  >
                    Today's Progress
                  </span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color:
                        todayProgress === 100 ? '#059669' : '#0284c7',
                    }}
                  >
                    {completedTodayTasks}/{totalTodayTasks} tasks
                    {todayProgress === 100 && ' -- All done!'}
                  </motion.span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: 'rgba(2,132,199,.1)',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, todayProgress)}%`,
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background:
                        todayProgress === 100
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : '#0284c7',
                      borderRadius: 999,
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Needs more time warning */}
            {journeySchedule.needsMoreTime && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                style={{
                  marginBottom: 18,
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(245,158,11,.10)',
                  border: '1px solid rgba(245,158,11,.28)',
                  color: '#92400e',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                Based on your remaining work and availability, plan for{' '}
                <b>
                  about {journeySchedule.requiredMinutesPerDay} minutes
                  on each study day
                </b>{' '}
                to stay on track. If that feels too heavy, add more
                available days or move your test date back.
              </motion.div>
            )}

            {/* Today's tasks */}
            <AnimatePresence mode="wait">
            {todayTasks.length > 0 ? (
              <DaySection
                day={todayDay}
                dayLabel="Today"
                tasks={todayTasks}
                startIndex={0}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="card"
                style={{
                  marginBottom: 28,
                  padding: '28px 20px',
                  textAlign: 'center',
                  background: '#f7f5ef',
                  border: '1.5px dashed #cbd5e1',
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#3f434b',
                    marginBottom: 4,
                  }}
                >
                  No tasks scheduled for today
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#8a8f98',
                    lineHeight: 1.6,
                  }}
                >
                  Use today as a rest or light review day. Check
                  upcoming days below for your next assignments.
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Upcoming days */}
            {upcomingDays.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 18,
                    paddingTop: 6,
                    borderTop: '1px solid #e4e0d5',
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        '#16181d',
                      color: 'white',
                      boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                    }}
                  >
                    <Icon name="calendar" size={15} />
                  </span>
                  <h2
                    style={{
                      fontFamily: 'Fraunces, Georgia, serif',
                      fontSize: 18,
                      fontWeight: 600,
                      color: '#16181d',
                      margin: 0,
                    }}
                  >
                    Upcoming
                  </h2>
                </div>

                {upcomingDays.map((day, idx) => {
                  const dayLabel =
                    idx === 0
                      ? 'Next Study Day'
                      : idx === 1
                        ? 'Following Day'
                        : day.label
                  const taskOffset = todayTasks.length + upcomingDays
                    .slice(0, idx)
                    .reduce((s, d) => s + d.tasks.length, 0)
                  return (
                    <DaySection
                      key={day.key}
                      day={day}
                      dayLabel={dayLabel}
                      tasks={day.tasks}
                      startIndex={taskOffset}
                    />
                  )
                })}
              </motion.div>
            )}

            {/* Schedule info footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              style={{
                marginTop: 8,
                padding: '14px 18px',
                borderRadius: 12,
                background: '#f7f5ef',
                border: '1px solid #e4e0d5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: '#565a63',
                  lineHeight: 1.6,
                  fontWeight: 700,
                }}
              >
                <Icon name="calendar" size={14} />{' '}
                {journeySchedule.hasTestDate
                  ? 'Your calendar runs through 3 days before your test date.'
                  : 'Set a test date to expand the full calendar.'}
                {' '}Missed work automatically rolls into your next available
                study day.
              </div>
              <Link
                to={viewHref('/calendar')}
                className="btn btn-outline"
                style={{ padding: '7px 14px', fontSize: 12 }}
              >
                {satDate
                  ? 'Edit Test Date & Availability'
                  : 'Set Test Date & Availability'}
              </Link>
            </motion.div>
          </>
        )}

        {/* Pretest taken but no schedule (edge case) */}
        {hasTakenPretest && !journeySchedule && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="card"
            style={{
              textAlign: 'center',
              padding: '36px 24px',
              background: '#f7f5ef',
              border: '1.5px solid #e4e0d5',
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#3f434b',
                marginBottom: 6,
              }}
            >
              No tasks available right now
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#8a8f98',
                lineHeight: 1.6,
              }}
            >
              Your schedule will update once your test results are
              processed.
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
