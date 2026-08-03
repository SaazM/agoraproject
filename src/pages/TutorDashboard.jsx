import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import Sidebar from '../components/Sidebar.jsx'
import Icon from '../components/AppIcons.jsx'
import { TESTS, getExamFromTestId } from '../data/tests.js'
import { getAnswerKeyBySection } from '../data/answerKeys.js'
import { ANSWER_KEY } from '../data/testData.js'
import { calcWeakTopicsForTest, getExamConfig, getExamConfigForTest, getQuestionCountForTest, getScoreColumnsForExam, scoreAttemptFromKey } from '../data/examData.js'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { motion } from 'framer-motion'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

/* ── helpers (unchanged) ────────────────────────────────────── */

function toDayKey(iso) {
  try {
    if (!iso) return null
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return null
    return d.toISOString().slice(0, 10)
  } catch { return null }
}

function quantile(sorted, q) {
  if (!sorted?.length) return null
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  return sorted[base] + (pos - base) * (sorted[Math.min(sorted.length - 1, base + 1)] - sorted[base])
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)) }

function normalizeTestId(id) { return (!id || id === 'practice_test_11') ? 'pre_test' : id }

function testLabel(id) {
  const norm = normalizeTestId(id)
  const t = TESTS.find(x => x.id === norm) || TESTS.find(x => x.id === id)
  return t?.label || (norm === 'pre_test' ? 'Pre Test' : (id || 'Test'))
}

function isPreTestId(id) { return normalizeTestId(id) === 'pre_test' }

function attemptTotalScore(a) { return Number(a?.scores?.composite || a?.scores?.total || 0) }

function attemptAccuracyRecord(attempt) {
  const testId = normalizeTestId(attempt?.test_id)
  const exam = getExamFromTestId(testId)
  const totalQuestions = Math.max(1, Number(getQuestionCountForTest(testId) || 0))
  let raw = Number(attempt?.scores?.raw || 0)
  const total = attemptTotalScore(attempt)
  if (!raw && attempt?.answers) {
    try {
      const rescored = scoreAttemptFromKey(testId, attempt.answers, getAnswerKeyBySection(testId) || {})
      raw = Number(rescored?.raw || 0)
    } catch { raw = 0 }
  }
  const percent = raw > 0 ? raw / totalQuestions : 0
  return { exam, raw, total, totalQuestions, percent, display: percent > 0 ? `${Math.round(percent * 100)}% · ${String(exam || 'sat').toUpperCase()} ${total || '—'}` : null }
}

function computeAttemptWeakTopics(attempt) {
  try {
    if (Array.isArray(attempt?.weak_topics) && attempt.weak_topics.length) return attempt.weak_topics
    const tid = normalizeTestId(attempt?.test_id)
    const keyBySection = getAnswerKeyBySection(tid) || (isPreTestId(tid) ? ANSWER_KEY : null)
    if (!keyBySection) return []
    return calcWeakTopicsForTest(tid, attempt?.answers || {}, keyBySection)
  } catch { return [] }
}

function formatTopWeakness(attempt) {
  const weakTopics = computeAttemptWeakTopics(attempt)
  const topWeak = weakTopics?.[0]
  if (!topWeak) return '—'
  const exam = getExamFromTestId(attempt?.test_id)
  const cfg = getExamConfig(exam)
  const chapterMeta = cfg?.chapters?.[topWeak.ch] || {}
  const label = topWeak.name || chapterMeta?.name || topWeak.ch || 'Weak area'
  const domain = topWeak.domain || chapterMeta?.domain || ''
  return `${label}${domain ? ` · ${domain}` : ''}`
}

function relativeTime(dateStr) {
  if (!dateStr) return 'Never'
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  if (Number.isNaN(then)) return 'Never'
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(dateStr).toLocaleDateString()
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

/* ── style tokens ───────────────────────────────────────────── */

const cardBase = {
  background: '#ffffff',
  borderRadius: 12,
  border: '1px solid rgba(2,132,199,.12)',
  boxShadow: '0 1px 3px rgba(22,24,29,.06)',
}

const kpiCard = {
  ...cardBase,
  textAlign: 'center',
  padding: '20px 16px',
  position: 'relative',
  overflow: 'hidden',
}

const kpiLabel = {
  fontSize: 11,
  color: '#565a63',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '.5px',
  marginBottom: 6,
}

const kpiBig = {
  fontSize: 30,
  fontWeight: 600,
  color: '#16181d',
  fontFamily: 'Fraunces, Georgia, serif',
}

const sectionTitle = {
  fontFamily: 'Fraunces, Georgia, serif',
  fontSize: 15,
  fontWeight: 700,
  color: '#16181d',
  margin: '0 0 16px 0',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

/* ── animation variants ─────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [.22, 1, .36, 1] } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [.22, 1, .36, 1] } },
}

/* ── avatar colors ──────────────────────────────────────────── */

const avatarColors = [
  ['#0ea5e9', '#0284c7'],
  ['#8b5cf6', '#7c3aed'],
  ['#f59e0b', '#d97706'],
  ['#10b981', '#059669'],
  ['#ec4899', '#db2777'],
  ['#ef4444', '#dc2626'],
  ['#06b6d4', '#0891b2'],
  ['#6366f1', '#4f46e5'],
]

function avatarGradient(name) {
  let hash = 0
  for (const ch of (name || '')) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0
  const idx = Math.abs(hash) % avatarColors.length
  return `linear-gradient(135deg, ${avatarColors[idx][0]}, ${avatarColors[idx][1]})`
}

/* ── main component ─────────────────────────────────────────── */

export default function TutorDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const isTutor = profile?.role === 'tutor'
  const [students, setStudents] = useState([])
  const [attempts, setAttempts] = useState([])
  const [postScores, setPostScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('students')
  const [analyticsExam, setAnalyticsExam] = useState('sat')

  const fetchData = useCallback(async () => {
    if (!supabase) return { students: [], attempts: [], postScores: [] }
    // Verify current user is actually a tutor server-side before fetching
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { students: [], attempts: [], postScores: [] }
    const { data: currentProfile } = await supabase.from('profiles').select('role,affiliation').eq('id', user.id).maybeSingle()
    if (!currentProfile || currentProfile.role !== 'tutor') return { students: [], attempts: [], postScores: [] }

    // Only fetch students that share this tutor's affiliation
    const tutorAffiliation = currentProfile.affiliation || ''
    let profileQuery = supabase.from('profiles').select('id,email,full_name,role,affiliation,created_at').eq('role', 'student').order('created_at', { ascending: false })
    if (tutorAffiliation) profileQuery = profileQuery.eq('affiliation', tutorAffiliation)

    const [p] = await Promise.allSettled([profileQuery])
    const studentList = p.status === 'fulfilled' ? (p.value.data || []) : []
    const studentIds = studentList.map(s => s.id)

    // Only fetch attempts and scores for the tutor's students
    if (studentIds.length === 0) return { students: [], attempts: [], postScores: [] }
    const [a, ps] = await Promise.allSettled([
      supabase.from('test_attempts').select('id,user_id,test_id,started_at,completed_at,scores,weak_topics,answers').in('user_id', studentIds).not('completed_at', 'is', null).order('started_at', { ascending: false }).limit(2000),
      supabase.from('post_scores').select('attempt_id,post_score,post_rw,post_math,recorded_at').order('recorded_at', { ascending: false }).limit(5000),
    ])
    // Filter post_scores to only those belonging to the tutor's students' attempts
    const attemptList = a.status === 'fulfilled' ? (a.value.data || []) : []
    const attemptIds = new Set(attemptList.map(at => at.id))
    const allPostScores = ps.status === 'fulfilled' ? (ps.value.data || []) : []
    return {
      students: studentList,
      attempts: attemptList,
      postScores: allPostScores.filter(p => attemptIds.has(p.attempt_id)),
    }
  }, [])

  useEffect(() => {
    if (!supabase) return
    if (profile && !isTutor) { navigate('/dashboard'); return }
    let cancelled = false
    fetchData().then((data) => {
      if (cancelled) return
      setStudents(data.students)
      setAttempts(data.attempts)
      setPostScores(data.postScores)
      setLoading(false)
    }).catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [profile, isTutor, navigate, fetchData])

  // Real-time refresh
  useEffect(() => {
    if (!supabase || !isTutor) return
    let disposed = false, debounce = null
    const refresh = async () => {
      try {
        const data = await fetchData()
        if (disposed) return
        setStudents(data.students)
        setAttempts(data.attempts)
        setPostScores(data.postScores)
      } catch {}
    }
    const queue = () => { clearTimeout(debounce); debounce = setTimeout(refresh, 300) }
    const channelId = `tutor-live:${Date.now()}-${Math.random().toString(36).slice(2)}`
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, queue)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'test_attempts' }, queue)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_scores' }, queue)
      .subscribe()
    const interval = setInterval(refresh, 20000)
    return () => { disposed = true; clearTimeout(debounce); clearInterval(interval); supabase.removeChannel(channel) }
  }, [isTutor, fetchData])

  const studentIds = useMemo(() => new Set(students.map(s => s.id)), [students])
  const filteredAttempts = useMemo(() => attempts.filter(a => studentIds.has(a.user_id)), [attempts, studentIds])

  const computed = useMemo(() => {
    const studentById = new Map(students.map(s => [s.id, s]))
    const bestByUser = new Map()
    const allScoresByUser = new Map()
    const attemptsByUser = new Map()
    const now = Date.now()
    const weekAgo = now - 7 * 86400000
    const testsThisWeekByUser = new Map()
    const lastActiveByUser = new Map()

    for (const a of filteredAttempts) {
      const rec = attemptAccuracyRecord(a)
      const prev = bestByUser.get(a.user_id)
      if (!prev || rec.percent > prev.percent || (rec.percent === prev.percent && rec.total > prev.total)) bestByUser.set(a.user_id, rec)

      // Track all scores for trend
      if (!allScoresByUser.has(a.user_id)) allScoresByUser.set(a.user_id, [])
      allScoresByUser.get(a.user_id).push({ total: attemptTotalScore(a), date: a.completed_at || a.started_at })

      // Track attempts per user
      if (!attemptsByUser.has(a.user_id)) attemptsByUser.set(a.user_id, [])
      attemptsByUser.get(a.user_id).push(a)

      // Count tests completed this week
      const completedTime = new Date(a.completed_at || 0).getTime()
      if (completedTime >= weekAgo) {
        testsThisWeekByUser.set(a.user_id, (testsThisWeekByUser.get(a.user_id) || 0) + 1)
      }

      // Track last active
      const activeTime = new Date(a.completed_at || a.started_at || 0).getTime()
      const existing = lastActiveByUser.get(a.user_id)
      if (!existing || activeTime > existing) lastActiveByUser.set(a.user_id, activeTime)
    }

    // Compute score trend per user (comparing first half to second half of attempts)
    const scoreTrendByUser = new Map()
    for (const [uid, scores] of allScoresByUser) {
      const sorted = scores.filter(s => s.total > 0).sort((a, b) => new Date(a.date) - new Date(b.date))
      if (sorted.length >= 2) {
        const mid = Math.floor(sorted.length / 2)
        const firstHalf = sorted.slice(0, mid)
        const secondHalf = sorted.slice(mid)
        const avgFirst = firstHalf.reduce((s, v) => s + v.total, 0) / firstHalf.length
        const avgSecond = secondHalf.reduce((s, v) => s + v.total, 0) / secondHalf.length
        const diff = avgSecond - avgFirst
        scoreTrendByUser.set(uid, { diff, direction: diff > 10 ? 'up' : diff < -10 ? 'down' : 'flat' })
      }
    }

    // Determine primary exam per user (whichever has more attempts)
    const examByUser = new Map()
    for (const [uid] of attemptsByUser) {
      examByUser.set(uid, 'sat')
    }

    // Compute study progress per user: unique tests taken / total tests available for that exam
    const studyProgressByUser = new Map()
    for (const [uid, userAttempts] of attemptsByUser) {
      const exam = examByUser.get(uid) || 'sat'
      const cfg = getExamConfig(exam)
      const totalTests = cfg?.tests?.length || 1
      const uniqueTests = new Set(userAttempts.map(a => normalizeTestId(a.test_id)))
      studyProgressByUser.set(uid, Math.min(1, uniqueTests.size / totalTests))
    }

    const postByAttemptId = new Map()
    for (const p of postScores) { if (p?.attempt_id && !postByAttemptId.has(p.attempt_id)) postByAttemptId.set(p.attempt_id, p) }

    return { studentById, bestByUser, postByAttemptId, allScoresByUser, attemptsByUser, testsThisWeekByUser, lastActiveByUser, scoreTrendByUser, examByUser, studyProgressByUser }
  }, [students, filteredAttempts, postScores])

  /* ── summary stats ──────────────────────────────────────── */

  const summaryStats = useMemo(() => {
    const now = Date.now()
    const weekAgo = now - 7 * 86400000
    const totalStudents = students.length

    // Average score improvement
    let totalImprovement = 0, improvementCount = 0
    for (const [, trend] of computed.scoreTrendByUser) {
      if (trend.diff !== 0) { totalImprovement += trend.diff; improvementCount++ }
    }
    const avgImprovement = improvementCount > 0 ? totalImprovement / improvementCount : 0

    // Most active student (most tests this week)
    let mostActiveId = null, mostActiveCount = 0
    for (const [uid, count] of computed.testsThisWeekByUser) {
      if (count > mostActiveCount) { mostActiveId = uid; mostActiveCount = count }
    }
    const mostActiveStudent = mostActiveId ? computed.studentById.get(mostActiveId) : null

    // Students needing attention (no activity in 7+ days or zero attempts)
    const needAttention = students.filter(st => {
      const lastActive = computed.lastActiveByUser.get(st.id)
      if (!lastActive) return true
      return lastActive < weekAgo
    })

    // Total tests this week
    let totalTestsWeek = 0
    for (const [, c] of computed.testsThisWeekByUser) totalTestsWeek += c

    return { totalStudents, avgImprovement, mostActiveStudent, mostActiveCount, needAttention, totalTestsWeek }
  }, [students, computed])

  /* ── activity feed ──────────────────────────────────────── */

  const activityFeed = useMemo(() => {
    const items = []
    for (const a of filteredAttempts.slice(0, 50)) {
      const st = computed.studentById.get(a.user_id)
      if (!st) continue
      const total = attemptTotalScore(a)
      items.push({
        id: a.id,
        student: st,
        type: 'test',
        label: testLabel(a.test_id),
        score: total,
        date: a.completed_at || a.started_at,
        exam: getExamFromTestId(normalizeTestId(a.test_id)),
      })
    }
    return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20)
  }, [filteredAttempts, computed])

  /* ── analytics (unchanged logic) ────────────────────────── */

  const analytics = useMemo(() => {
    const examMode = 'sat'
    const scoreColumns = getScoreColumnsForExam(examMode)
    const now = Date.now()
    const recent7 = now - 7 * 86400000
    const recent30 = now - 30 * 86400000
    const allAttempts = filteredAttempts.filter(a => getExamFromTestId(a?.test_id) === examMode)
    const totals = [], sectionBuckets = Object.fromEntries(scoreColumns.filter(c => c.key !== 'total').map(c => [c.key, []]))
    const byTest = new Map(), attemptsByDay = new Map(), completesByDay = new Map()
    const weakByDomain = new Map(), weakByChapter = new Map()
    const activeUsers7 = new Set(), activeUsers30 = new Set()

    for (const a of allAttempts) {
      const tid = normalizeTestId(a.test_id)
      const sc = a.scores || {}
      let total = Number(sc.composite || sc.total || 0)
      const sectionValues = Object.fromEntries(scoreColumns.filter(c => c.key !== 'total').map(c => [c.key, Number(sc[c.key] || sc.sections?.[c.key] || 0)]))
      if (a.answers && Object.keys(a.answers).length && (!total || Object.values(sectionValues).some(v => !v))) {
        try {
          const keyBySection = getAnswerKeyBySection(tid) || (isPreTestId(tid) ? ANSWER_KEY : null)
          if (keyBySection) {
            const computed = scoreAttemptFromKey(tid, a.answers, keyBySection)
            if (computed?.total) {
              if (!total) total = Number(computed.composite || computed.total || 0)
              for (const col of scoreColumns.filter(c => c.key !== 'total')) {
                if (!sectionValues[col.key]) sectionValues[col.key] = Number(computed[col.key] || computed.sections?.[col.key] || 0)
              }
            }
          }
        } catch {}
      }
      const started = new Date(a.started_at || a.completed_at || 0).getTime()
      if (started >= recent7) activeUsers7.add(a.user_id)
      if (started >= recent30) activeUsers30.add(a.user_id)
      if (total) {
        totals.push(total)
        for (const [key, value] of Object.entries(sectionValues)) { if (value) sectionBuckets[key].push(value) }
        const row = byTest.get(tid) || { count: 0, totals: [], sections: Object.fromEntries(Object.keys(sectionBuckets).map(k => [k, []])) }
        row.count += 1; row.totals.push(total)
        for (const [key, value] of Object.entries(sectionValues)) { if (value) row.sections[key].push(value) }
        byTest.set(tid, row)
      }
      const dayS = toDayKey(a.started_at), dayC = toDayKey(a.completed_at)
      if (dayS) attemptsByDay.set(dayS, (attemptsByDay.get(dayS) || 0) + 1)
      if (dayC) completesByDay.set(dayC, (completesByDay.get(dayC) || 0) + 1)
      for (const t of computeAttemptWeakTopics(a)) {
        const c = Number(t?.count || 0)
        if (c > 0) {
          weakByDomain.set(t?.domain || 'Other', (weakByDomain.get(t?.domain || 'Other') || 0) + c)
          if (t?.ch) weakByChapter.set(t.ch, (weakByChapter.get(t.ch) || 0) + c)
        }
      }
    }
    const avg = arr => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null
    const sorted = totals.slice().sort((a, b) => a - b)
    const summary = {
      exam: examMode, active7: activeUsers7.size, active30: activeUsers30.size,
      avgTotal: avg(totals),
      avgSections: Object.fromEntries(Object.entries(sectionBuckets).map(([k, v]) => [k, avg(v)])),
      median: quantile(sorted, 0.5),
    }
    const testRows = Array.from(byTest.entries()).map(([id, row]) => {
      const s = row.totals.slice().sort((a, b) => a - b)
      return { id, label: testLabel(id), count: row.count, avgTotal: avg(row.totals), avgSections: Object.fromEntries(Object.entries(row.sections).map(([k, v]) => [k, avg(v)])), median: quantile(s, 0.5) }
    }).sort((a, b) => b.count - a.count)
    const topDomains = Array.from(weakByDomain.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)
    const topChapters = Array.from(weakByChapter.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10)
    const allDays = Array.from(new Set([...attemptsByDay.keys(), ...completesByDay.keys()])).sort()
    const activitySeries = { labels: allDays, datasets: [
      { label: 'Started', data: allDays.map(d => attemptsByDay.get(d) || 0), borderColor: '#0284c7', backgroundColor: 'rgba(2,132,199,.08)', pointRadius: 2, tension: 0.25, fill: true },
      { label: 'Completed', data: allDays.map(d => completesByDay.get(d) || 0), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.06)', pointRadius: 2, tension: 0.25, fill: true },
    ]}
    const histogram = (() => {
      const starts = [400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600]
      const counts = new Array(starts.length).fill(0)
      for (const t of totals) {
        const cl = clamp(t, 400, 1600)
        const idx = Math.min(starts.length - 1, Math.floor((cl - 400) / 100))
        counts[idx] += 1
      }
      return { labels: starts.map(s => `${s}-${Math.min(1600, s + 99)}`), datasets: [{ label: 'Students', data: counts, backgroundColor: '#0284c7', borderRadius: 6, borderSkipped: false }] }
    })()
    const domainsChart = { labels: topDomains.map(([d]) => d), datasets: [{ label: 'Misses', data: topDomains.map(([, c]) => c), backgroundColor: topDomains.map((_, i) => ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#64748b'][i % 8]), borderRadius: 6, borderSkipped: false }] }
    const chaptersChart = { labels: topChapters.map(([ch]) => `Ch ${ch}`), datasets: [{ label: 'Misses', data: topChapters.map(([, c]) => c), backgroundColor: '#ef4444', borderRadius: 6, borderSkipped: false }] }
    return { summary, testRows, histogram, domainsChart, chaptersChart, activitySeries, scoreColumns }
  }, [filteredAttempts, analyticsExam])

  const tabs = [
    { id: 'students', label: 'Students', icon: 'students' },
    { id: 'results', label: 'Test Results', icon: 'results' },
    { id: 'analytics', label: 'Analytics', icon: 'chart' },
  ]

  if (loading) return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam="sat" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, height: '100vh', color: '#565a63' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#0284c7', margin: '0 auto 12px', animation: 'pulse 1.5s ease-in-out infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="students" size={20} style={{ color: 'white' }} />
          </div>
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 14 }}>Loading dashboard...</span>
        </div>
      </div>
    </div>
  )

  const s = analytics.summary
  const chartOpts = (title, yMax) => ({ responsive: true, plugins: { legend: { display: true, labels: { color: '#565a63', font: { size: 11 } } }, tooltip: { backgroundColor: '#16181d' } }, scales: { x: { ticks: { color: '#8a8f98', font: { size: 10 } }, grid: { display: false } }, y: { beginAtZero: true, max: yMax || undefined, ticks: { color: '#8a8f98', font: { size: 10 } }, grid: { color: '#eceadf' } } } })

  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam="sat" />
      <div className="page fade-up">

        {/* ── Header ──────────────────────────────────────── */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 26, fontWeight: 600, color: '#16181d', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 40, height: 40, borderRadius: 12,
              background: '#0284c7',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', boxShadow: '0 1px 3px rgba(22,24,29,.06)',
            }}>
              <Icon name="students" size={20} />
            </span>
            {profile?.affiliation || 'My Students'}
          </h1>
          <p style={{ fontSize: 14, color: '#565a63', marginTop: 6, marginBottom: 0 }}>
            {students.length} student{students.length !== 1 ? 's' : ''} enrolled
            {summaryStats.totalTestsWeek > 0 && <span> &middot; {summaryStats.totalTestsWeek} test{summaryStats.totalTestsWeek !== 1 ? 's' : ''} this week</span>}
          </p>
        </motion.div>

        {/* ── Summary KPIs ────────────────────────────────── */}
        <motion.div
          initial="hidden" animate="show" variants={containerVariants}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}
        >
          <motion.div variants={cardVariants} style={kpiCard}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#0284c7' }} />
            <div style={kpiLabel}>Total Students</div>
            <div style={kpiBig}>{summaryStats.totalStudents}</div>
          </motion.div>
          <motion.div variants={cardVariants} style={kpiCard}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #10b981, #059669)' }} />
            <div style={kpiLabel}>Avg Score Change</div>
            <div style={{ ...kpiBig, color: summaryStats.avgImprovement > 0 ? '#059669' : summaryStats.avgImprovement < 0 ? '#dc2626' : '#16181d' }}>
              {summaryStats.avgImprovement > 0 ? '+' : ''}{Math.round(summaryStats.avgImprovement) || '—'}
            </div>
          </motion.div>
          <motion.div variants={cardVariants} style={kpiCard}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#d97706' }} />
            <div style={kpiLabel}>Most Active</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#16181d', fontFamily: 'Fraunces, Georgia, serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {summaryStats.mostActiveStudent?.full_name || '—'}
            </div>
            {summaryStats.mostActiveCount > 0 && (
              <div style={{ fontSize: 11, color: '#565a63', marginTop: 2 }}>{summaryStats.mostActiveCount} test{summaryStats.mostActiveCount !== 1 ? 's' : ''} this week</div>
            )}
          </motion.div>
          <motion.div variants={cardVariants} style={kpiCard}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: summaryStats.needAttention.length > 0 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #10b981, #059669)' }} />
            <div style={kpiLabel}>Need Attention</div>
            <div style={{ ...kpiBig, color: summaryStats.needAttention.length > 0 ? '#dc2626' : '#059669' }}>
              {summaryStats.needAttention.length}
            </div>
            <div style={{ fontSize: 11, color: '#8a8f98', marginTop: 2 }}>inactive 7+ days</div>
          </motion.div>
        </motion.div>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 18px', borderRadius: 10,
              border: tab === t.id ? '2px solid #0284c7' : '1.5px solid #e4e0d5',
              cursor: 'pointer', fontFamily: 'Fraunces, Georgia, serif', fontSize: 13, fontWeight: 700,
              background: tab === t.id ? 'rgba(2,132,199,.08)' : 'white',
              color: tab === t.id ? '#0284c7' : '#565a63',
              transition: 'all .2s',
            }}>
              <Icon name={t.icon} size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />{t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════
            STUDENTS TAB
        ═══════════════════════════════════════════════════ */}
        {tab === 'students' && (
          <div>
            {/* Student cards grid */}
            <motion.div
              initial="hidden" animate="show" variants={containerVariants}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 32 }}
            >
              {students.map((st) => {
                const best = computed.bestByUser.get(st.id)
                const userAttempts = computed.attemptsByUser.get(st.id) || []
                const testsWeek = computed.testsThisWeekByUser.get(st.id) || 0
                const lastActive = computed.lastActiveByUser.get(st.id)
                const trend = computed.scoreTrendByUser.get(st.id)
                const exam = computed.examByUser.get(st.id) || 'sat'
                const progress = computed.studyProgressByUser.get(st.id) || 0
                const progressPercent = Math.round(progress * 100)
                const isInactive = !lastActive || (Date.now() - lastActive > 7 * 86400000)

                return (
                  <motion.div key={st.id} variants={cardVariants} style={{
                    ...cardBase,
                    padding: 0,
                    overflow: 'hidden',
                    transition: 'box-shadow .2s, border-color .2s',
                    cursor: 'default',
                  }}
                  whileHover={{ boxShadow: '0 1px 3px rgba(22,24,29,.06)', borderColor: 'rgba(2,132,199,.25)' }}
                  >
                    {/* Card header */}
                    <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(2,132,199,.08)' }}>
                      {/* Avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: avatarGradient(st.full_name || st.email),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontFamily: 'Fraunces, Georgia, serif', fontSize: 15, fontWeight: 600,
                        flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,.12)',
                      }}>
                        {getInitials(st.full_name || st.email)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontSize: 15, color: '#16181d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {st.full_name || '—'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px',
                            padding: '2px 8px', borderRadius: 6,
                            background: 'rgba(2,132,199,.1)',
                            color: '#0284c7',
                          }}>
                            {exam.toUpperCase()}
                          </span>
                          {isInactive && (
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                              background: 'rgba(239,68,68,.08)', color: '#dc2626',
                            }}>
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Tunnel into student button */}
                      <Link to={`/dashboard?user=${st.id}`} style={{
                        padding: '6px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6,
                        background: '#0284c7', color: '#fff',
                        textDecoration: 'none', fontSize: 11, fontWeight: 700, fontFamily: 'Fraunces, Georgia, serif',
                        flexShrink: 0, transition: 'opacity .15s',
                      }} title="View this student's full account">
                        <Icon name="eye" size={13} />
                        View Account
                      </Link>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: '14px 20px 18px' }}>
                      {/* Stats row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                        {/* Best Score */}
                        <div>
                          <div style={{ fontSize: 10, color: '#8a8f98', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 3 }}>Best Score</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 18, fontWeight: 600, color: '#16181d', fontFamily: 'Fraunces, Georgia, serif' }}>
                              {best?.total || '—'}
                            </span>
                            {trend && (
                              <span style={{
                                fontSize: 14,
                                color: trend.direction === 'up' ? '#059669' : trend.direction === 'down' ? '#dc2626' : '#8a8f98',
                                lineHeight: 1,
                              }}>
                                {trend.direction === 'up' ? '\u2191' : trend.direction === 'down' ? '\u2193' : '\u2192'}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Tests Taken */}
                        <div>
                          <div style={{ fontSize: 10, color: '#8a8f98', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 3 }}>Tests</div>
                          <span style={{ fontSize: 18, fontWeight: 600, color: '#16181d', fontFamily: 'Fraunces, Georgia, serif' }}>
                            {userAttempts.length}
                          </span>
                        </div>
                        {/* This Week */}
                        <div>
                          <div style={{ fontSize: 10, color: '#8a8f98', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 3 }}>This Week</div>
                          <span style={{ fontSize: 18, fontWeight: 600, color: testsWeek > 0 ? '#059669' : '#8a8f98', fontFamily: 'Fraunces, Georgia, serif' }}>
                            {testsWeek}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <span style={{ fontSize: 10, color: '#8a8f98', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px' }}>Study Progress</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: progressPercent >= 75 ? '#059669' : progressPercent >= 40 ? '#d97706' : '#565a63' }}>{progressPercent}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: '#f3f0e9', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.8, ease: [.22, 1, .36, 1], delay: 0.3 }}
                            style={{
                              height: '100%', borderRadius: 3,
                              background: progressPercent >= 75
                                ? 'linear-gradient(90deg, #10b981, #059669)'
                                : progressPercent >= 40
                                  ? '#d97706'
                                  : '#8a8f98',
                            }}
                          />
                        </div>
                      </div>

                      {/* Last active */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 11, color: '#8a8f98' }}>
                          <Icon name="clock" size={12} style={{ marginRight: 4, verticalAlign: '-2px' }} />
                          {lastActive ? relativeTime(new Date(lastActive).toISOString()) : 'No activity'}
                        </span>
                        {best?.display && (
                          <span style={{ fontSize: 10, color: '#565a63', fontWeight: 600 }}>{best.display}</span>
                        )}
                      </div>

                      {/* Quick access links */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 10, borderTop: '1px solid rgba(2,132,199,.08)' }}>
                        {[
                          { label: 'Dashboard', icon: 'home', path: '/dashboard' },
                          { label: 'Guide', icon: 'guide', path: '/guide' },
                          { label: 'Mistakes', icon: 'mistakes', path: '/mistakes' },
                          { label: 'Report', icon: 'report', path: '/report' },
                          { label: 'Calendar', icon: 'calendar', path: '/calendar' },
                          { label: 'Tasks', icon: 'tasks', path: '/tasks' },
                        ].map(link => (
                          <Link key={link.label} to={`${link.path}?user=${st.id}`} style={{
                            padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4,
                            background: 'rgba(2,132,199,.06)', color: '#0284c7', textDecoration: 'none',
                            fontSize: 10, fontWeight: 600, transition: 'background .15s',
                          }}>
                            <Icon name={link.icon} size={11} />
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              {!students.length && (
                <motion.div variants={cardVariants} style={{ ...cardBase, padding: 48, textAlign: 'center', color: '#8a8f98', gridColumn: '1 / -1' }}>
                  <Icon name="students" size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 15, fontWeight: 600 }}>No students enrolled yet</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Students with your affiliation will appear here.</div>
                </motion.div>
              )}
            </motion.div>

            {/* Activity Feed */}
            {activityFeed.length > 0 && (
              <motion.div initial="hidden" animate="show" variants={fadeUp}>
                <h3 style={sectionTitle}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: '#0284c7',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 13,
                  }}>
                    <Icon name="activity" size={14} />
                  </span>
                  Recent Activity
                </h3>
                <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
                  {activityFeed.map((item, i) => (
                    <div key={item.id} style={{
                      padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
                      borderBottom: i < activityFeed.length - 1 ? '1px solid rgba(2,132,199,.06)' : 'none',
                      transition: 'background .15s',
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: avatarGradient(item.student.full_name || item.student.email),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontFamily: 'Fraunces, Georgia, serif', fontSize: 11, fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        {getInitials(item.student.full_name || item.student.email)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#16181d' }}>{item.student.full_name || '—'}</span>
                        <span style={{ fontSize: 13, color: '#565a63' }}> completed </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#3f434b' }}>{item.label}</span>
                        {item.score > 0 && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: '#0284c7', marginLeft: 6,
                            padding: '1px 6px', borderRadius: 4, background: 'rgba(2,132,199,.08)',
                          }}>
                            {item.score}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: '#8a8f98', flexShrink: 0 }}>{relativeTime(item.date)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            RESULTS TAB
        ═══════════════════════════════════════════════════ */}
        {tab === 'results' && (
          <motion.div initial="hidden" animate="show" variants={fadeUp} style={cardBase}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: '#3f434b' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(2,132,199,.12)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', color: '#565a63' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Student</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Test</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Total</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Top Weakness</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.slice(0, 200).map((a) => {
                    const st = computed.studentById.get(a.user_id)
                    const total = attemptTotalScore(a)
                    return (
                      <tr key={a.id} style={{ borderBottom: '1px solid #f3f0e9', transition: 'background .15s' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 7,
                              background: avatarGradient(st?.full_name || st?.email),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontFamily: 'Fraunces, Georgia, serif', fontSize: 10, fontWeight: 600,
                              flexShrink: 0,
                            }}>
                              {getInitials(st?.full_name || st?.email)}
                            </div>
                            <span style={{ fontWeight: 600 }}>{st?.full_name || '—'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{testLabel(a.test_id)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: '#8a8f98' }}>{a.completed_at ? new Date(a.completed_at).toLocaleDateString() : '—'}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>{total || '—'}</td>
                        <td style={{ padding: '12px 16px', color: '#565a63', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatTopWeakness(a)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <Link to={`/results/${a.id}?user=${a.user_id}`} style={{ color: '#0284c7', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>View</Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════
            ANALYTICS TAB
        ═══════════════════════════════════════════════════ */}
        {tab === 'analytics' && (
          <motion.div initial="hidden" animate="show" variants={containerVariants} style={{ display: 'grid', gap: 20 }}>
            {/* KPIs */}
            <motion.div variants={cardVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <div style={kpiCard}><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#0284c7' }} /><div style={kpiLabel}>Students</div><div style={kpiBig}>{students.length}</div></div>
              <div style={kpiCard}><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #10b981, #059669)' }} /><div style={kpiLabel}>Active (7d)</div><div style={kpiBig}>{s.active7}</div></div>
              <div style={kpiCard}><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#d97706' }} /><div style={kpiLabel}>Active (30d)</div><div style={kpiBig}>{s.active30}</div></div>
              <div style={kpiCard}><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' }} /><div style={kpiLabel}>Avg Total</div><div style={kpiBig}>{s.avgTotal ? Math.round(s.avgTotal) : '—'}</div></div>
              <div style={kpiCard}><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #ec4899, #db2777)' }} /><div style={kpiLabel}>Median</div><div style={kpiBig}>{s.median ? Math.round(s.median) : '—'}</div></div>
              {analytics.scoreColumns.filter(c => c.key !== 'total').map((col) => (
                <div key={col.key} style={kpiCard}><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #06b6d4, #0891b2)' }} /><div style={kpiLabel}>Avg {col.label}</div><div style={kpiBig}>{s.avgSections?.[col.key] ? Math.round(s.avgSections[col.key]) : '—'}</div></div>
              ))}
            </motion.div>

            {/* Activity */}
            {analytics.activitySeries.labels.length > 0 && (
              <motion.div variants={cardVariants} style={{ ...cardBase, padding: 20 }}><div style={{ ...kpiLabel, marginBottom: 12 }}>Activity Over Time</div><Line data={analytics.activitySeries} options={chartOpts('Activity')} /></motion.div>
            )}

            {/* Score Distribution */}
            <motion.div variants={cardVariants} style={{ ...cardBase, padding: 20 }}><div style={{ ...kpiLabel, marginBottom: 12 }}>Score Distribution</div><Bar data={analytics.histogram} options={chartOpts('Distribution')} /></motion.div>

            {/* Weakness charts */}
            <motion.div variants={cardVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {analytics.domainsChart.labels.length > 0 && (
                <div style={{ ...cardBase, padding: 20 }}><div style={{ ...kpiLabel, marginBottom: 12 }}>Most Missed Domains</div><Bar data={analytics.domainsChart} options={chartOpts('Domains')} /></div>
              )}
              {analytics.chaptersChart.labels.length > 0 && (
                <div style={{ ...cardBase, padding: 20 }}><div style={{ ...kpiLabel, marginBottom: 12 }}>Most Missed Chapters</div><Bar data={analytics.chaptersChart} options={chartOpts('Chapters')} /></div>
              )}
            </motion.div>

            {/* Test summary table */}
            {analytics.testRows.length > 0 && (
              <motion.div variants={cardVariants} style={{ ...cardBase, padding: 20 }}>
                <div style={{ ...kpiLabel, marginBottom: 12 }}>Test Summary</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: '#3f434b' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(2,132,199,.12)', fontSize: 10, textTransform: 'uppercase', color: '#8a8f98' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left' }}>Test</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>Attempts</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>Avg Total</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>Median</th>
                        {analytics.scoreColumns.filter(c => c.key !== 'total').map((col) => (
                          <th key={col.key} style={{ padding: '8px 10px', textAlign: 'center' }}>Avg {col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.testRows.map((row) => (
                        <tr key={row.id} style={{ borderBottom: '1px solid #f3f0e9' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600 }}>{row.label}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.count}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{row.avgTotal ? Math.round(row.avgTotal) : '—'}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.median ? Math.round(row.median) : '—'}</td>
                          {analytics.scoreColumns.filter(c => c.key !== 'total').map((col) => (
                            <td key={col.key} style={{ padding: '8px 10px', textAlign: 'center' }}>{row.avgSections?.[col.key] ? Math.round(row.avgSections[col.key]) : '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
