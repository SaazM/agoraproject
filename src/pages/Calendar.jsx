import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Icon from '../components/AppIcons.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { buildAdaptiveSchedule, loadSatTestDate, saveSatTestDate, loadStudyPrefs, saveStudyPrefs, normalizeWeakTopics, dayLabels, UPCOMING_TEST_DATES } from '../lib/studyPlan.js'
import { getChaptersForExam, getExamConfig, calcWeakTopicsForTest } from '../data/examData.js'
import { getExamFromTestId, getTestsForExam } from '../data/tests.js'
import { getAnswerKeyBySection } from '../data/answerKeys.js'
import { loadDashboardViewData, loadProfileSafe } from '../lib/dashboardData.js'
import { resolveViewContext, withExam, withViewUser } from '../lib/viewAs.js'
import { getInitialPreferredExam } from '../lib/examChoice.js'
import { hasUnlockedResources } from '../lib/pretestGate.js'

/* ─── Helpers ─────────────────────────────────────────── */

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfWeek(date) {
  const d = startOfWeek(date)
  d.setDate(d.getDate() + 6)
  return d
}

function dateKey(d) {
  return new Date(d).toISOString().slice(0, 10)
}

function getMonthDays(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Mon=0 ... Sun=6
}

/* ─── Framer Motion Variants ─────────────────────────── */

const monthSlide = {
  enter: (dir) => ({ x: dir > 0 ? 220 : -220, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: (dir) => ({ x: dir > 0 ? -220 : 220, opacity: 0, transition: { duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] } }),
}

const panelReveal = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.2 } },
}

const taskCard = {
  hidden: { opacity: 0, y: 14 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
}

const dotPop = {
  hidden: { scale: 0 },
  visible: (i) => ({
    scale: 1,
    transition: { delay: i * 0.04, type: 'spring', stiffness: 500, damping: 25 },
  }),
}

/* ─── Task-type color mapping for dots ────────────────── */

function getTaskDotColor(task) {
  const t = (task.title || '').toLowerCase()
  const s = (task.subtitle || '').toLowerCase()
  const combined = t + ' ' + s
  if (combined.includes('test') || combined.includes('practice test') || combined.includes('final')) return '#f97316' // orange for test
  if (combined.includes('review') || combined.includes('mistake') || combined.includes('revisit')) return '#10b981' // green for review
  return '#0284c7' // blue for study (default)
}

/* ─── Styles ──────────────────────────────────────────── */

const S = {
  /* Page header */
  header: {
    marginBottom: 28,
  },
  headerTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    gap: 16, flexWrap: 'wrap',
  },
  title: {
    fontFamily: 'Fraunces, Georgia, serif', fontSize: 26, fontWeight: 600,
    color: '#16181d', letterSpacing: '-0.02em', margin: 0,
  },
  subtitle: {
    marginTop: 6, color: '#565a63', fontSize: 14, lineHeight: 1.6, maxWidth: 520,
  },
  navBtns: {
    display: 'flex', gap: 8, flexWrap: 'wrap',
  },
  navBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 10,
    border: '1px solid #e4e0d5', background: '#fff',
    color: '#3f434b', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', textDecoration: 'none',
    transition: 'all .18s ease',
  },

  /* Settings card */
  settingsCard: {
    background: '#fff', borderRadius: 12,
    border: '1px solid #e5e7eb', padding: '20px 24px',
    marginBottom: 24,
  },
  settingsTitle: {
    fontFamily: 'Fraunces, Georgia, serif', fontSize: 15, fontWeight: 700,
    color: '#16181d', marginBottom: 4,
  },
  settingsDesc: {
    color: '#565a63', fontSize: 13, lineHeight: 1.6, marginBottom: 16,
  },
  settingsRow: {
    display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
  },
  dateInput: {
    padding: '8px 12px', border: '1.5px solid #e4e0d5', borderRadius: 10,
    fontSize: 13, background: 'white', fontFamily: 'inherit',
    outline: 'none', transition: 'border-color .18s',
  },
  dateChip: (active) => ({
    padding: '6px 12px', fontSize: 12, fontWeight: 600,
    border: active ? '2px solid #0284c7' : '1.5px solid #e4e0d5',
    borderRadius: 999, background: active ? 'rgba(2,132,199,.08)' : '#fff',
    color: active ? '#0284c7' : '#565a63',
    cursor: 'pointer', transition: 'all .18s',
  }),
  dayChip: (enabled) => ({
    padding: '7px 14px', fontSize: 12, fontWeight: 600,
    border: enabled ? '1.5px solid rgba(2,132,199,.4)' : '1.5px solid #e4e0d5',
    borderRadius: 999, background: enabled ? 'rgba(2,132,199,.08)' : '#fff',
    color: enabled ? '#0284c7' : '#8a8f98',
    cursor: 'pointer', transition: 'all .18s',
  }),

  /* Calendar container */
  calContainer: {
    background: '#fff', borderRadius: 12,
    border: '1px solid #e5e7eb',
    padding: '24px 28px 28px',
    boxShadow: '0 1px 3px rgba(0,0,0,.04)',
  },

  /* Month nav */
  monthNav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  monthLabel: {
    fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 600,
    color: '#16181d',
  },
  arrowBtn: {
    width: 36, height: 36, borderRadius: '50%',
    border: '1px solid #e5e7eb', background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#3f434b',
    transition: 'all .18s',
    fontSize: 18, fontWeight: 600,
  },

  /* Weekday headers */
  weekRow: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
    borderBottom: '1px solid #f3f0e9', paddingBottom: 10, marginBottom: 6,
  },
  weekLabel: {
    textAlign: 'center', fontSize: 12, fontWeight: 600,
    color: '#8a8f98', textTransform: 'uppercase', letterSpacing: '.4px',
  },

  /* Day grid */
  dayGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 2,
  },

  /* Day cell */
  dayCell: (isSelected, isToday, isInPlan, isTestDate, isCurrentMonth) => ({
    position: 'relative',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: 64, padding: '8px 4px',
    borderRadius: 12,
    cursor: isInPlan ? 'pointer' : 'default',
    background: isSelected ? 'rgba(2,132,199,.07)' : 'transparent',
    transition: 'all .18s ease',
    border: isSelected ? '2px solid #0284c7' : '1px solid #e5e7eb',
    outline: 'none',
    fontFamily: 'inherit',
  }),
  dayNum: (isSelected, isToday, isInPlan, isTestDate, isCurrentMonth) => ({
    width: 38, height: 38,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '50%',
    fontFamily: 'Fraunces, Georgia, serif',
    fontSize: 14, fontWeight: isToday || isSelected ? 700 : 500,
    color: isTestDate
      ? '#fff'
      : isSelected
        ? '#0284c7'
        : isToday
          ? '#0284c7'
          : !isCurrentMonth
            ? '#cbd5e1'
            : isInPlan
              ? '#3f434b'
              : '#d1d5db',
    background: isTestDate
      ? '#f97316'
      : 'transparent',
    border: isToday && !isTestDate
      ? '2px solid #0284c7'
      : 'none',
    transition: 'all .18s ease',
  }),
  dotsRow: {
    display: 'flex', gap: 3, marginTop: 4, justifyContent: 'center',
    minHeight: 6,
  },
  dot: (color) => ({
    width: 5, height: 5, borderRadius: '50%',
    background: color,
  }),

  /* Selected day panel */
  panel: {
    background: '#fff', borderRadius: 12,
    border: '1px solid #e5e7eb', padding: '28px 28px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,.04)',
    marginTop: 20,
  },
  panelHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    gap: 12, marginBottom: 20, flexWrap: 'wrap',
  },
  panelDate: {
    fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 600,
    color: '#16181d',
  },
  panelDay: {
    fontSize: 13, color: '#8a8f98', fontWeight: 500, marginBottom: 2,
  },
  panelTime: {
    fontSize: 13, color: '#565a63', marginTop: 6,
    display: 'flex', alignItems: 'center', gap: 5,
  },
  focusBadge: (focus) => ({
    padding: '5px 14px', borderRadius: 999,
    fontSize: 12, fontWeight: 600,
    background: focus === 'Reading'
      ? 'rgba(2,132,199,.08)'
      : focus === 'Math'
        ? 'rgba(16,185,129,.08)'
        : 'rgba(138,143,152,.08)',
    color: focus === 'Reading'
      ? '#2563eb'
      : focus === 'Math'
        ? '#059669'
        : '#565a63',
  }),
  taskCard: {
    display: 'block',
    textDecoration: 'none',
    color: '#16181d',
    border: '1px solid #f3f0e9',
    borderRadius: 12,
    padding: '16px 18px',
    background: '#fafbfc',
    transition: 'all .18s ease',
  },
  taskTitle: {
    fontWeight: 700, color: '#16181d', marginBottom: 4, fontSize: 14,
  },
  taskSub: {
    fontSize: 13, color: '#565a63', lineHeight: 1.6,
  },
  emptyTask: {
    border: '1.5px dashed #e4e0d5', borderRadius: 12,
    padding: '18px 20px', color: '#8a8f98', fontSize: 13, lineHeight: 1.6,
    textAlign: 'center',
  },

  /* Legend */
  legend: {
    display: 'flex', gap: 18, marginTop: 16, paddingTop: 14,
    borderTop: '1px solid #f3f0e9', flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 12, color: '#565a63',
  },
}

/* ─── Component ───────────────────────────────────────── */

export default function CalendarPage() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const requestedExam = useMemo(() => String(new URLSearchParams(location.search || '').get('exam') || '').toLowerCase(), [location.search])
  const exam = requestedExam === 'sat' ? requestedExam : getInitialPreferredExam(user)
  const examConfig = useMemo(() => getExamConfig(exam), [exam])
  const examTests = useMemo(() => getTestsForExam(exam), [exam])
  const chapters = useMemo(() => getChaptersForExam(exam), [exam])
  const { viewUserId, isAdminPreview } = useMemo(
    () => resolveViewContext({ userId: user?.id, profile, search: location.search }),
    [user?.id, profile, location.search]
  )
  const requestedDayKey = useMemo(() => new URLSearchParams(location.search || '').get('day') || '', [location.search])
  const [loading, setLoading] = useState(true)
  const [attempts, setAttempts] = useState([])
  const [studied, setStudied] = useState({})
  const [mistakes, setMistakes] = useState([])
  const [reviewItems, setReviewItems] = useState({})
  const [targetProfile, setTargetProfile] = useState(null)
  const [selectedDayKey, setSelectedDayKey] = useState('')
  const [satDate, setSatDate] = useState(() => loadSatTestDate(viewUserId, exam))
  const [studyPrefs, setStudyPrefs] = useState(() => loadStudyPrefs(viewUserId, exam))
  const availabilityLabels = dayLabels()

  /* Month navigation state */
  const todayDate = useMemo(() => new Date(), [])
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth())
  const [viewYear, setViewYear] = useState(todayDate.getFullYear())
  const [monthDirection, setMonthDirection] = useState(0)

  useEffect(() => {
    const nextDate = loadSatTestDate(viewUserId, exam)
    const nextPrefs = loadStudyPrefs(viewUserId, exam)
    setSatDate(nextDate)
    setStudyPrefs(nextPrefs)
  }, [viewUserId, exam])

  useEffect(() => {
    if (!viewUserId) return
    let cancelled = false
    setLoading(true)

    Promise.allSettled([
      loadDashboardViewData(viewUserId),
      isAdminPreview ? loadProfileSafe(viewUserId) : Promise.resolve(null),
    ]).then(([dataRes, previewRes]) => {
      if (cancelled) return
      const data = dataRes.status === 'fulfilled' ? dataRes.value : null
      const previewProfile = previewRes.status === 'fulfilled' ? previewRes.value : null
      setAttempts(data?.attempts || [])
      setStudied(data?.studiedMap || {})
      setMistakes(data?.mistakes || [])
      setReviewItems(data?.reviewItems || {})
      setTargetProfile(previewProfile || null)
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [viewUserId, isAdminPreview])

  const displayProfile = isAdminPreview ? targetProfile : profile
  const completed = attempts.filter(a => (a.completed_at || a.scores?.total))
  const completedForExam = completed.filter((attempt) => getExamFromTestId(attempt?.test_id) === exam)
  const studiedForExam = useMemo(() => Object.fromEntries(Object.entries(studied || {}).filter(([chapterId]) => Boolean(chapters?.[chapterId]))), [studied, chapters])
  const latestCompleted = completedForExam[0] || null
  const hasTakenPretest = completedForExam.some(a => a.test_id === examConfig.preTestId || (exam === 'sat' && a.test_id === 'practice_test_11'))
  const allExamMistakes = (mistakes || []).filter((m) => getExamFromTestId(m?.test_id) === exam)
  const allExamValidated = allExamMistakes.filter((m) => {
    const key = `${m.test_id}:${m.section}:${m.q_num}`
    return reviewItems?.[key]?.last_correct === true
  }).length
  const reviewTodoCount = Math.max(0, allExamMistakes.length - allExamValidated)

  const deriveWeakTopicsForAttempt = (attempt) => {
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

  const schedule = useMemo(() => {
    if (!latestCompleted || !hasTakenPretest) return null
    return buildAdaptiveSchedule({
      weakTopics: deriveWeakTopicsForAttempt(latestCompleted),
      studiedMap: studiedForExam,
      reviewCount: reviewTodoCount,
      totalReviewCount: allExamMistakes.length,
      hasTakenPretest: true,
      prefs: studyPrefs,
      testDate: satDate,
      exam,
    })
  }, [latestCompleted, hasTakenPretest, studiedForExam, reviewTodoCount, studyPrefs, satDate, mistakes, exam])

  /* Build a map of dateKey -> day for fast lookup */
  const scheduleDayMap = useMemo(() => {
    if (!schedule?.days?.length) return new Map()
    return new Map(schedule.days.map((day) => [day.key, day]))
  }, [schedule])

  /* Build month grid cells */
  const monthCells = useMemo(() => {
    const daysInMonth = getMonthDays(viewYear, viewMonth)
    const firstDow = getFirstDayOfWeek(viewYear, viewMonth)
    const cells = []

    // Previous month fill
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear
    const prevDays = getMonthDays(prevYear, prevMonth)
    for (let i = firstDow - 1; i >= 0; i--) {
      const dayNum = prevDays - i
      const d = new Date(prevYear, prevMonth, dayNum)
      const key = dateKey(d)
      cells.push({ key, date: d, dayNum, isCurrentMonth: false, scheduleDay: scheduleDayMap.get(key) || null })
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d)
      const key = dateKey(date)
      cells.push({ key, date, dayNum: d, isCurrentMonth: true, scheduleDay: scheduleDayMap.get(key) || null })
    }

    // Next month fill to complete the grid (always 6 rows = 42 cells)
    const remaining = 42 - cells.length
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(nextYear, nextMonth, d)
      const key = dateKey(date)
      cells.push({ key, date, dayNum: d, isCurrentMonth: false, scheduleDay: scheduleDayMap.get(key) || null })
    }

    return cells
  }, [viewYear, viewMonth, scheduleDayMap])

  /* Navigate to today's month when schedule first loads (once) */
  const monthInitRef = useRef(false)
  useEffect(() => {
    if (!schedule?.days?.length) return
    if (monthInitRef.current) return
    monthInitRef.current = true
    // If there's a requested day, navigate to that month
    if (requestedDayKey) {
      const parts = requestedDayKey.split('-')
      if (parts.length === 3) {
        setViewYear(parseInt(parts[0]))
        setViewMonth(parseInt(parts[1]) - 1)
      }
      return
    }
    // Otherwise show today's month
    const today = new Date()
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }, [schedule, requestedDayKey])

  useEffect(() => {
    if (!schedule?.days?.length) return
    const requestedDay = schedule.days.find((day) => day.key === requestedDayKey)
    if (requestedDay) {
      setSelectedDayKey(requestedDay.key)
      return
    }
    setSelectedDayKey((prev) => prev || schedule.days[0].key)
  }, [schedule, requestedDayKey])

  const selectedDay = useMemo(() => {
    if (!schedule?.days?.length) return null
    return schedule.days.find((day) => day.key === selectedDayKey) || schedule.days[0] || null
  }, [schedule, selectedDayKey])

  // Arrow key navigation between calendar days
  useEffect(() => {
    if (!schedule?.days?.length) return
    function handleKeyDown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault()
      const days = schedule.days
      const idx = days.findIndex((d) => d.key === selectedDayKey)
      if (idx < 0) return
      const next = e.key === 'ArrowLeft' ? idx - 1 : idx + 1
      if (next >= 0 && next < days.length) {
        const nextDay = days[next]
        setSelectedDayKey(nextDay.key)
        // Navigate view to show the selected day's month
        const d = new Date(nextDay.date)
        setViewYear(d.getFullYear())
        setViewMonth(d.getMonth())
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [schedule, selectedDayKey])

  const homeHref = withViewUser(withExam('/dashboard', exam), viewUserId, isAdminPreview)
  const guideHref = withViewUser(withExam('/guide', exam), viewUserId, isAdminPreview)
  const resultsHref = latestCompleted ? withViewUser(withExam(`/results/${latestCompleted.id}`, exam), viewUserId, isAdminPreview) : homeHref
  const latestResultsLabel = latestCompleted
    ? `${examTests.find((t) => t.id === (latestCompleted.test_id === 'practice_test_11' ? 'pre_test' : latestCompleted.test_id))?.label || 'Latest Test'} Results`
    : 'Latest Results'

  const viewHref = (path) => withViewUser(withExam(path, exam), viewUserId, isAdminPreview)

  function updateJourneyDate(nextDate) {
    if (isAdminPreview) return
    setSatDate(nextDate)
    saveSatTestDate(viewUserId, nextDate, exam)
  }

  function toggleJourneyDay(index) {
    if (isAdminPreview) return
    const fallback = loadStudyPrefs(viewUserId, exam)
    const days = Array.isArray(studyPrefs?.days) ? [...studyPrefs.days] : [...fallback.days]
    days[index] = !days[index]
    const next = { ...(studyPrefs || fallback), days }
    setStudyPrefs(next)
    try { saveStudyPrefs(viewUserId, next, exam) } catch {}
  }

  const goToPrevMonth = useCallback(() => {
    setMonthDirection(-1)
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
  }, [viewMonth])

  const goToNextMonth = useCallback(() => {
    setMonthDirection(1)
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
  }, [viewMonth])

  const goToToday = useCallback(() => {
    const t = new Date()
    setMonthDirection(t.getFullYear() * 12 + t.getMonth() > viewYear * 12 + viewMonth ? 1 : -1)
    setViewYear(t.getFullYear())
    setViewMonth(t.getMonth())
    setSelectedDayKey(dateKey(t))
  }, [viewYear, viewMonth])

  const todayKey = dateKey(todayDate)
  const testDateKey = satDate || ''
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="app-layout has-sidebar">
        <Sidebar currentExam={exam} />
        <div className="page fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: '#8a8f98', fontSize: 15, fontWeight: 500 }}
          >
            Loading calendar...
          </motion.div>
        </div>
      </div>
    )
  }

  /* ─── Main render ─── */
  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />
      <div className="page fade-up">

        {/* Admin preview banner */}
        {isAdminPreview && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: 20, padding: '14px 20px', borderRadius: 12,
              background: '#16181d',
              color: 'white',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Admin View</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.88 }}>
              You are previewing {displayProfile?.full_name || 'this student'}'s adaptive schedule. This view is read-only.
            </div>
          </motion.div>
        )}

        {/* Page header */}
        <div style={S.header}>
          <div style={S.headerTop}>
            <div>
              <h1 style={S.title}>Study Calendar</h1>
              <p style={S.subtitle}>
                Your personalized {examConfig.label} study plan, day by day. Click any date to see scheduled tasks.
              </p>
            </div>
            <div style={S.navBtns}>
              <button style={S.navBtn} onClick={() => navigate(-1)}>
                <Icon name="back" size={15} /> Back
              </button>
              <Link style={S.navBtn} to={homeHref}>
                <Icon name="home" size={15} /> Dashboard
              </Link>
              <Link style={S.navBtn} to={guideHref}>Study Guide</Link>
            </div>
          </div>
        </div>

        {/* Journey settings */}
        {hasTakenPretest && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={S.settingsCard}
          >
            <div style={S.settingsTitle}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <Icon name="settings" size={15} />
                Journey Settings
              </span>
            </div>
            <div style={S.settingsDesc}>
              Set your test date and available study days. Tasks update automatically based on your latest results.
            </div>

            {/* Test date row */}
            <div style={{ ...S.settingsRow, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#565a63', fontWeight: 600, minWidth: 80 }}>Test date</span>
              <input
                type="date"
                value={satDate || ''}
                onChange={(e) => updateJourneyDate(e.target.value)}
                disabled={isAdminPreview}
                style={S.dateInput}
              />
              {!isAdminPreview && (() => {
                const dates = UPCOMING_TEST_DATES[exam] || []
                const today = new Date().toISOString().slice(0, 10)
                const future = dates.filter(d => d.date >= today)
                if (!future.length) return null
                return future.map(d => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => updateJourneyDate(d.date)}
                    style={S.dateChip(satDate === d.date)}
                  >
                    {d.label}
                  </button>
                ))
              })()}
            </div>

            {/* Available days row */}
            <div style={S.settingsRow}>
              <span style={{ fontSize: 12, color: '#565a63', fontWeight: 600, minWidth: 80 }}>Study days</span>
              {availabilityLabels.map((label, index) => {
                const enabled = Boolean(studyPrefs?.days?.[index])
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={isAdminPreview}
                    onClick={() => toggleJourneyDay(index)}
                    style={S.dayChip(enabled)}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {schedule?.needsMoreTime && (
              <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 14, lineHeight: 1.6, fontWeight: 500 }}>
                Plan for about <strong>{schedule.requiredMinutesPerDay} minutes per study day</strong> to stay on track. Add more days or push your test date back if needed.
              </div>
            )}
          </motion.div>
        )}

        {/* Calendar content */}
        {!schedule ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              ...S.calContainer, textAlign: 'center',
              padding: '48px 28px', color: '#565a63',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.3 }}>
              <Icon name="calendar" size={36} />
            </div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 17, fontWeight: 600, color: '#16181d', marginBottom: 8 }}>
              No calendar yet
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 420, margin: '0 auto' }}>
              Take the {examConfig.tests.find((test) => test.id === examConfig.preTestId)?.label || 'Pre Test'} first.
              Your personalized study calendar will appear here with day-by-day tasks.
            </div>
          </motion.div>
        ) : (
          <>
            {/* Month calendar */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              style={S.calContainer}
            >
              {/* Month navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); goToPrevMonth() }}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      border: '1px solid #e5e7eb', background: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#3f434b',
                    }}
                    aria-label="Previous month"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); goToNextMonth() }}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      border: '1px solid #e5e7eb', background: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#3f434b',
                    }}
                    aria-label="Next month"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>

                <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 600, color: '#16181d', pointerEvents: 'none' }}>
                  {monthNames[viewMonth]} {viewYear}
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToToday() }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 10,
                    border: '1px solid #0284c7', background: '#fff',
                    color: '#0284c7', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Today
                </button>
              </div>

              {/* Weekday headers */}
              <div style={S.weekRow}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} style={S.weekLabel}>{d}</div>
                ))}
              </div>

              {/* Day grid */}
              <div style={S.dayGrid}>
                {monthCells.map((cell) => {
                  const isInPlan = Boolean(cell.scheduleDay)
                  const isSelected = selectedDayKey === cell.key
                  const isToday = cell.key === todayKey
                  const isTestDate = cell.key === testDateKey
                  const isCurrentMonth = cell.isCurrentMonth

                  // Determine task dots
                  const dots = []
                  if (cell.scheduleDay?.tasks?.length) {
                    const seen = new Set()
                    for (const task of cell.scheduleDay.tasks) {
                      const c = getTaskDotColor(task)
                      if (!seen.has(c)) {
                        seen.add(c)
                        dots.push(c)
                      }
                      if (dots.length >= 3) break
                    }
                  }

                  return (
                    <button
                      key={cell.key}
                      type="button"
                      onClick={() => {
                        if (isInPlan) setSelectedDayKey(cell.key)
                      }}
                      style={S.dayCell(isSelected, isToday, isInPlan, isTestDate, isCurrentMonth)}
                      onMouseEnter={(e) => {
                        if (!isInPlan) return
                        if (!isSelected) {
                          e.currentTarget.style.background = '#f7f5ef'
                        }
                        const numEl = e.currentTarget.querySelector('.day-num')
                        if (numEl && !isSelected && !isTestDate) {
                          numEl.style.background = '#f3f0e9'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isInPlan) return
                        if (!isSelected) {
                          e.currentTarget.style.background = 'transparent'
                        }
                        const numEl = e.currentTarget.querySelector('.day-num')
                        if (numEl && !isSelected && !isTestDate) {
                          numEl.style.background = 'transparent'
                        }
                      }}
                    >
                      <div
                        className="day-num"
                        style={S.dayNum(isSelected, isToday, isInPlan, isTestDate, isCurrentMonth)}
                      >
                        {cell.dayNum}
                      </div>

                      {/* Task dots */}
                      <div style={S.dotsRow}>
                        {dots.map((color, i) => (
                          <motion.div
                            key={color}
                            custom={i}
                            variants={dotPop}
                            initial="hidden"
                            animate="visible"
                            style={S.dot(color)}
                          />
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div style={S.legend}>
                <div style={S.legendItem}>
                  <div style={{ ...S.dot('#0284c7'), width: 8, height: 8 }} /> Study
                </div>
                <div style={S.legendItem}>
                  <div style={{ ...S.dot('#f97316'), width: 8, height: 8 }} /> Test
                </div>
                <div style={S.legendItem}>
                  <div style={{ ...S.dot('#10b981'), width: 8, height: 8 }} /> Review
                </div>
                <div style={S.legendItem}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: '2px solid #0284c7', background: 'transparent',
                  }} />
                  Today
                </div>
                {testDateKey && (
                  <div style={S.legendItem}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#f97316',
                    }} />
                    Test date
                  </div>
                )}
              </div>
            </motion.div>

            {/* Selected day panel */}
            <AnimatePresence mode="wait">
              {selectedDay && (
                <motion.div
                  key={selectedDayKey}
                  variants={panelReveal}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={S.panel}
                >
                  <div style={S.panelHeader}>
                    <div>
                      <div style={S.panelDay}>
                        {selectedDay.isToday
                          ? 'Today'
                          : selectedDay.date.toLocaleDateString(undefined, { weekday: 'long' })}
                      </div>
                      <div style={S.panelDate}>
                        {selectedDay.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={S.panelTime}>
                        <Icon name="clock" size={14} />
                        {selectedDay.estimatedMinutes
                          ? `${selectedDay.estimatedMinutes} min planned`
                          : 'Light review day'}
                      </div>
                    </div>
                    <div style={S.focusBadge(selectedDay.focus)}>
                      {selectedDay.focus}
                    </div>
                  </div>

                  {/* Task cards */}
                  <div style={{ display: 'grid', gap: 10 }}>
                    {selectedDay.tasks.length ? selectedDay.tasks.map((task, i) => (
                      <motion.div
                        key={task.id}
                        custom={i}
                        variants={taskCard}
                        initial="hidden"
                        animate="visible"
                      >
                        <Link
                          to={viewHref(task.href)}
                          style={S.taskCard}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#0284c7'
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(22,24,29,.06)'
                            e.currentTarget.style.transform = 'translateY(-1px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#f3f0e9'
                            e.currentTarget.style.boxShadow = 'none'
                            e.currentTarget.style.transform = 'translateY(0)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{
                              width: 6, height: 6, borderRadius: '50%', marginTop: 7, flexShrink: 0,
                              background: getTaskDotColor(task),
                            }} />
                            <div>
                              <div style={S.taskTitle}>{task.title}</div>
                              <div style={S.taskSub}>{task.subtitle}</div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )) : (
                      <div style={S.emptyTask}>
                        No scheduled tasks. Use this day for catch-up, light review, or rest.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}
