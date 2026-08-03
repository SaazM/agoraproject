import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { motion } from 'framer-motion'
import BrandLink from '../components/BrandLink.jsx'
import Icon from '../components/AppIcons.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { loadDashboardViewData } from '../lib/dashboardData.js'
import { TESTS, getTestsForExam, getExamFromTestId, normalizeTestId } from '../data/tests.js'
import { getAnswerKeyBySection } from '../data/answerKeys.js'
import {
  getChaptersForExam,
  getExamConfig,
  getScoreColumnsForExam,
  scoreAttemptFromKey,
  calcWeakTopicsForTest,
} from '../data/examData.js'
import { resolveViewContext, withExam, withViewUser } from '../lib/viewAs.js'
import { chooseDashboardExam } from '../lib/examChoice.js'
import { getInitialPreferredExam } from '../lib/examChoice.js'
import { getStudiedTopics } from '../lib/studyProgress.js'
import { loadMistakes, loadReviewItems, computeDueCount } from '../lib/mistakesStore.js'
import { toLocalDateKey, computeStreak } from '../lib/progressMetrics.js'
import { encodeReportToQuery } from '../lib/reportShare.js'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

/* ── helpers ─────────────────────────────────────────── */

const cardStyle = {
  border: '1px solid rgba(22,24,29,.10)',
  borderRadius: 12,
  padding: 20,
  background: 'white',
  marginBottom: 18,
}

const headingStyle = {
  fontFamily: 'Fraunces, Georgia, serif',
  fontSize: 15,
  fontWeight: 600,
  marginBottom: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: '#16181d',
  letterSpacing: '0.02em',
}

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
}

const stagger = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.06 },
})

function computeScoresFromAnswers(attempt) {
  try {
    const keyBySection = getAnswerKeyBySection(attempt?.test_id) || null
    if (!keyBySection) return null
    return scoreAttemptFromKey(attempt?.test_id, attempt?.answers || {}, keyBySection)
  } catch {
    return null
  }
}

function computeWeakTopics(attempt) {
  try {
    if (Array.isArray(attempt?.weak_topics) && attempt.weak_topics.length) return attempt.weak_topics
    const tid = normalizeTestId(attempt?.test_id)
    const keyBySection = getAnswerKeyBySection(tid) || {}
    return calcWeakTopicsForTest(tid, attempt?.answers || {}, keyBySection)
  } catch {
    return []
  }
}

function resolveScores(attempt) {
  if (attempt?.scores?.total || attempt?.scores?.composite) return attempt.scores
  if (attempt?.answers && Object.keys(attempt.answers).length) {
    try {
      const testId = attempt.test_id === 'practice_test_11' ? 'pre_test' : attempt.test_id
      const keyBySection = getAnswerKeyBySection(testId)
      if (keyBySection) {
        const rescored = scoreAttemptFromKey(testId, attempt.answers, keyBySection)
        if (rescored?.total || rescored?.composite) return rescored
      }
    } catch {}
  }
  return attempt?.scores || {}
}

/* ── component ───────────────────────────────────────── */

export default function Report() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = useMemo(() => new URLSearchParams(location.search || ''), [location.search])
  const requestedExam = String(searchParams.get('exam') || '').toLowerCase()

  const { viewUserId, isAdminPreview, isAdmin, isTutor } = useMemo(
    () => resolveViewContext({ userId: user?.id, profile, search: location.search }),
    [user?.id, profile, location.search]
  )
  const targetUser = viewUserId || user?.id
  const canView = (String(targetUser) === String(user?.id)) || isAdmin || isTutor

  const [attempts, setAttempts] = useState([])
  const [postScores, setPostScores] = useState([])
  const [studied, setStudied] = useState({})
  const [studiedRows, setStudiedRows] = useState([])
  const [mistakes, setMistakes] = useState([])
  const [reviewItems, setReviewItems] = useState({})
  const [targetProfile, setTargetProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const chosenExam = chooseDashboardExam({ user, attempts, explicitExam: requestedExam })
  const exam = requestedExam === 'sat' ? requestedExam : chosenExam
  const examConfig = getExamConfig(exam)
  const examTests = getTestsForExam(exam)
  const chaptersForExam = getChaptersForExam(exam)
  const scoreColumns = getScoreColumnsForExam(exam)
  const viewHref = (path) => withViewUser(withExam(path, exam), viewUserId, isAdminPreview)

  /* ── data loading ──────────────────────────────────── */
  useEffect(() => {
    if (!user || !targetUser || !canView) return
    let cancelled = false
    setLoading(true)

    Promise.allSettled([
      loadDashboardViewData(targetUser),
      supabase.from('post_scores').select('*').eq('user_id', targetUser).order('recorded_at', { ascending: false }),
      getStudiedTopics(targetUser),
      loadMistakes(targetUser),
      loadReviewItems(targetUser),
      supabase.from('profiles').select('*').eq('id', targetUser).maybeSingle(),
    ]).then(([dash, ps, st, m, r, pr]) => {
      if (cancelled) return
      const dashData = dash.status === 'fulfilled' ? dash.value : {}
      setAttempts(dashData?.attempts || [])
      setPostScores(ps.status === 'fulfilled' ? (ps.value.data || []) : (dashData?.postScores || []))
      setStudied(dashData?.studiedMap || {})
      setStudiedRows(st.status === 'fulfilled' ? (st.value.rows || []) : (dashData?.studiedRows || []))
      setMistakes(m.status === 'fulfilled' ? (m.value.items || []) : (dashData?.mistakes || []))
      setReviewItems(r.status === 'fulfilled' ? (r.value.items || {}) : (dashData?.reviewItems || {}))
      setTargetProfile(pr.status === 'fulfilled' ? (pr.value.data || null) : null)
      setLoading(false)
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [user, targetUser, canView])

  /* ── derived data (from Overview) ──────────────────── */
  const examAttemptIds = new Set(examTests.map((t) => t.id))
  const examAttempts = attempts.filter((a) => examAttemptIds.has(normalizeTestId(a?.test_id)))
  const completed = examAttempts.filter((a) => a.completed_at || a.scores?.total)
  const completedWithScores = completed
    .map((attempt) => ({
      attempt,
      scores: attempt.scores?.total ? attempt.scores : (computeScoresFromAnswers(attempt) || attempt.scores || {}),
    }))
    .filter((e) => e.scores?.total)

  const studiedForExam = Object.fromEntries(Object.entries(studied || {}).filter(([ch]) => Boolean(chaptersForExam?.[ch])))
  const studiedCount = Object.values(studiedForExam).filter(Boolean).length
  const studiedPct = Math.round((studiedCount / Math.max(1, examConfig.guideCompletionTarget)) * 100)
  const mistakesForExam = (mistakes || []).filter((m) => getExamFromTestId(m?.test_id) === exam)
  const validatedCount = mistakesForExam.filter((m) => {
    const k = `${m.test_id}:${m.section}:${m.q_num}`
    return reviewItems?.[k]?.last_correct === true
  }).length

  const best = completedWithScores.reduce((b, e) => (!b || Number(e.scores.total) > Number(b.scores.total) ? e : b), null)
  const lowest = completedWithScores.reduce((b, e) => (!b || Number(e.scores.total) < Number(b.scores.total) ? e : b), null)
  const recent = completedWithScores[0] || null
  const improvement = recent && lowest ? Number(recent.scores.total) - Number(lowest.scores.total) : null

  const sectionAvgs = useMemo(() => {
    const cols = scoreColumns.filter((c) => c.key !== 'total')
    return cols.map((col) => {
      const vals = completedWithScores.map((e) => Number(e.scores[col.key] || 0)).filter((v) => v > 0)
      const avg = vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null
      return { label: col.label, key: col.key, avg }
    })
  }, [completedWithScores, scoreColumns])

  /* ── derived data (from Report) ────────────────────── */
  const reportData = useMemo(() => {
    const completedForExam = (attempts || []).filter(a => (a.completed_at || a.scores?.total) && getExamFromTestId(a.test_id) === exam)
    const completedPre = completedForExam.filter(a => a.test_id === examConfig.preTestId || (exam === 'sat' && a.test_id === 'practice_test_11'))
    const bestPre = completedPre
      .map(a => {
        const sc = resolveScores(a)
        return Number(sc?.composite || sc?.total || 0)
      })
      .filter(Boolean)
      .reduce((m, v) => Math.max(m, v), 0) || null
    const latestPost = postScores?.[0]?.post_score || null
    const prePostImprovement = bestPre && latestPost ? (latestPost - bestPre) : null
    const studiedChapterCount = (studiedRows || []).filter(r => r.completed && examConfig.chapters?.[r.chapter_id]).length
    const dueReviews = computeDueCount(reviewItems, new Date(), { exam })

    const activityKeys = (() => {
      const set = new Set()
      ;(attempts || []).forEach((a) => {
        const k1 = toLocalDateKey(a.started_at)
        const k2 = toLocalDateKey(a.completed_at)
        if (k1) set.add(k1)
        if (k2) set.add(k2)
      })
      ;(studiedRows || []).filter((r) => examConfig.chapters?.[r.chapter_id]).forEach((r) => {
        const k1 = toLocalDateKey(r.updated_at)
        const k2 = toLocalDateKey(r.completed_at)
        if (k1) set.add(k1)
        if (k2) set.add(k2)
      })
      Object.values(reviewItems || {}).forEach((it) => {
        const k = toLocalDateKey(it?.last_reviewed_at)
        if (k) set.add(k)
      })
      return set
    })()

    const streak = computeStreak(activityKeys)
    const extraTests = TESTS.filter(t => t.kind === 'extra' && t.exam === exam)
    const completedExtra = completedForExam.filter(a => extraTests.some(t => t.id === a.test_id)).length

    return {
      generated_at: new Date().toISOString(),
      student: { name: targetProfile?.full_name || null, email: targetProfile?.email || null },
      summary: {
        best_pretest: bestPre,
        latest_post: latestPost,
        improvement: prePostImprovement,
        studied_count: studiedChapterCount,
        due_reviews: dueReviews,
        streak_current: streak.current,
        streak_best: streak.best,
        completed_extra: completedExtra,
      },
      mistakes: (mistakes || []).filter((m) => getExamFromTestId(m.test_id) === exam).slice(0, 200).map(m => ({
        test: m.test_id,
        section: m.section,
        q: m.q_num,
        chapter: m.chapter_id || null,
        created_at: m.created_at,
        note: m.note || '',
      })),
    }
  }, [attempts, postScores, studiedRows, mistakes, reviewItems, targetProfile?.full_name, targetProfile?.email, exam, examConfig.preTestId])

  const shareUrl = useMemo(() => {
    if (!reportData) return null
    const sharePayload = {
      generated_at: reportData.generated_at,
      student: { name: reportData.student?.name || null },
      summary: reportData.summary,
      series: [],
    }
    try {
      const encoded = encodeReportToQuery(sharePayload)
      return `${window.location.origin}/share?r=${encoded}`
    } catch {
      return null
    }
  }, [reportData])

  /* ── score trend (composite/total) ─────────────────── */
  const trendData = useMemo(() => {
    const sorted = [...completedWithScores].reverse()
    return {
      labels: sorted.map((e) => {
        const t = TESTS.find((x) => x.id === normalizeTestId(e.attempt.test_id))
        return t?.shortLabel || t?.label || 'Test'
      }),
      datasets: [{
        label: 'SAT Total',
        data: sorted.map((e) => Number(e.scores.total || e.scores.composite || 0)),
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2,132,199,.15)',
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: '#0284c7',
      }],
    }
  }, [completedWithScores, exam])

  /* ── section trend (per-section lines) ─────────────── */
  const sectionTrendData = useMemo(() => {
    const sorted = [...completedWithScores].reverse()
    const cols = scoreColumns.filter((c) => c.key !== 'total')
    const colors = ['#2563eb', '#10b981', '#8b5cf6', '#f97316']
    return {
      labels: sorted.map((e) => {
        const t = TESTS.find((x) => x.id === normalizeTestId(e.attempt.test_id))
        return t?.shortLabel || t?.label || 'Test'
      }),
      datasets: cols.map((col, i) => ({
        label: col.label,
        data: sorted.map((e) => Number(e.scores[col.key] || 0)),
        borderColor: colors[i % colors.length],
        backgroundColor: `${colors[i % colors.length]}22`,
        tension: 0.3,
        pointRadius: 4,
      })),
    }
  }, [completedWithScores, scoreColumns])

  /* ── weak topics (aggregated) ──────────────────────── */
  const topWeakTopics = useMemo(() => {
    const counts = {}
    for (const { attempt } of completedWithScores) {
      const weak = computeWeakTopics(attempt)
      for (const topic of weak) {
        const ch = String(topic.ch || '')
        if (!ch) continue
        if (!counts[ch]) counts[ch] = { ...topic, ch, count: 0 }
        counts[ch].count += Number(topic.count || 1)
      }
    }
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 8)
  }, [completedWithScores])

  /* ── test history table ────────────────────────────── */
  const testHistory = useMemo(() => {
    return completedWithScores.map(({ attempt, scores }) => {
      const test = TESTS.find((t) => t.id === normalizeTestId(attempt.test_id))
      return {
        id: attempt.id,
        label: test?.label || 'Test',
        date: attempt.started_at ? new Date(attempt.started_at).toLocaleDateString() : '—',
        total: scores.total || scores.composite || '—',
        sections: scoreColumns.filter((c) => c.key !== 'total').map((c) => ({ label: c.label, val: scores[c.key] || '—' })),
      }
    })
  }, [completedWithScores, scoreColumns])

  const completedAttempts = useMemo(() => (attempts || []).filter(a => a.completed_at || a.scores?.total), [attempts])

  /* ── renders ───────────────────────────────────────── */

  if (!canView) {
    return (
      <div className="app-layout has-sidebar">
        <Sidebar currentExam={exam} />
        <div className="page fade-up">
          <div style={{ ...cardStyle, padding: 18 }}>
            <div style={{ fontWeight: 600, color: '#16181d', marginBottom: 6 }}>Not authorized</div>
            <div style={{ color: '#565a63', fontSize: 13, lineHeight: 1.6 }}>
              This report link is restricted.
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="app-layout has-sidebar">
        <Sidebar currentExam={exam} />
        <div className="page fade-up" style={{ textAlign: 'center', paddingTop: 80, color: '#565a63' }}>
          Building report...
        </div>
      </div>
    )
  }

  const statBoxStyle = { display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }
  const iconBoxStyle = {
    width: 40, height: 40, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(22,24,29,.08)', color: '#16181d',
  }
  const darkIconBoxStyle = { ...iconBoxStyle, background: 'rgba(255,255,255,.15)', color: 'white' }

  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />
      <div className="page fade-up">

        {/* Admin / Tutor preview banner */}
        {isAdminPreview && (
          <motion.div {...stagger(0)} style={{ ...cardStyle, background: '#16181d', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{isTutor ? 'Tutor View' : 'Admin View'}</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.88 }}>
                  {"You're viewing this student's report. Use the result links below to open the same detailed post-test screens they see."}
                </div>
              </div>
              <Link className="btn btn-outline" to={isTutor ? '/tutor' : '/admin'} style={{ color: 'white', borderColor: 'rgba(255,255,255,.24)', background: 'rgba(255,255,255,.08)' }}>
                {isTutor ? 'Back to Students' : 'Back to Admin'}
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── Header ─────────────────────────────────── */}
        <motion.div {...fadeUp} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 600, color: '#16181d', margin: 0, display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '0.01em' }}>
              <Icon name="report" size={22} />
              Progress Report
            </h1>
            <p style={{ color: '#565a63', marginTop: 4, fontSize: 13, lineHeight: 1.6 }}>
              Your complete {exam.toUpperCase()} performance stats and progress
              {reportData?.generated_at && <> &middot; Generated {new Date(reportData.generated_at).toLocaleString()}</>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              className="btn btn-outline"
              onClick={async () => {
                if (!shareUrl) return
                try {
                  await navigator.clipboard.writeText(shareUrl)
                  alert('Share link copied.')
                } catch {
                  window.prompt('Copy the share link:', shareUrl)
                }
              }}
            >
              Copy share link
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'agora-progress-report.json'
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              Download JSON
            </button>
          </div>
        </motion.div>

        {/* ── KPI Stats Grid ─────────────────────────── */}
        <motion.div {...stagger(1)} className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Tests Completed', val: completed.length, icon: 'check', dark: false },
            { label: 'Best Score', val: best ? best.scores.total : '—', icon: 'sparkle', dark: Boolean(best) },
            { label: 'Most Recent', val: recent ? recent.scores.total : '—', icon: 'results', dark: false },
            { label: 'Improvement', val: improvement !== null ? `${improvement > 0 ? '+' : ''}${improvement}` : '—', icon: 'trend', dark: improvement !== null && improvement > 0 },
            ...sectionAvgs.map((s) => ({ label: `Avg ${s.label}`, val: s.avg ?? '—', icon: 'target', dark: false })),
            { label: 'Streak', val: `${reportData.summary.streak_current}d`, icon: 'check', dark: false, sub: `Best ${reportData.summary.streak_best}d` },
            { label: 'Guide Progress', val: `${studiedPct}%`, icon: 'guide', dark: false },
            { label: 'Mistakes Reviewed', val: `${validatedCount}/${mistakesForExam.length}`, icon: 'mistakes', dark: validatedCount === mistakesForExam.length && mistakesForExam.length > 0 },
          ].map((s, idx) => (
            <div key={s.label} className={`stat-box${s.dark ? ' dark' : ''}`} style={{
              ...statBoxStyle,
              ...(s.dark ? {} : idx % 2 === 0
                ? { borderTop: '3px solid #0284c7' }
                : { borderTop: '3px solid #0284c7' }),
            }}>
              <div style={s.dark ? darkIconBoxStyle : idx % 2 === 0
                ? { ...iconBoxStyle, background: 'rgba(2,132,199,.10)', color: '#0284c7' }
                : { ...iconBoxStyle, background: 'rgba(2,132,199,.10)', color: '#0284c7' }
              }>
                <Icon name={s.icon} size={20} />
              </div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-num" style={{ fontSize: 22 }}>{s.val}</div>
                {s.sub && <div className="stat-sub" style={{ fontSize: 11, color: '#8a8f98' }}>{s.sub}</div>}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Pre/Post summary card ──────────────────── */}
        {(reportData.summary.best_pretest || reportData.summary.latest_post) && (
          <motion.div {...stagger(2)} style={cardStyle}>
            <h3 style={headingStyle}>
              <Icon name="results" size={17} />
              Pre / Post Summary
            </h3>
            <div className="stats-grid" style={{ marginBottom: 0 }}>
              {[
                { label: 'Best Pre-Test', val: reportData.summary.best_pretest || '—', sub: 'Pre Test' },
                { label: 'Post-Test', val: reportData.summary.latest_post || '—', sub: 'Most recent' },
                { label: 'Pre-Post Improvement', val: reportData.summary.improvement != null ? `+${reportData.summary.improvement}` : '—', sub: 'Points', dark: !!reportData.summary.improvement },
              ].map(s => (
                <div key={s.label} className={`stat-box${s.dark ? ' dark' : ''}`}>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-num">{s.val}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, color: '#565a63', fontSize: 13 }}>
              Due reviews: {reportData.summary.due_reviews} &middot; Optional tests completed: {reportData.summary.completed_extra}
            </div>
          </motion.div>
        )}

        {/* ── Score Trend Chart ──────────────────────── */}
        {completedWithScores.length >= 2 && (
          <motion.div {...stagger(3)} style={cardStyle}>
            <h3 style={headingStyle}>
              <Icon name="chart" size={17} />
              Score Trend
            </h3>
            <div style={{ height: 220 }}>
              <Line data={trendData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { font: { family: 'DM Sans', size: 12 } } } },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 10 } } },
                  y: { grid: { color: '#eceadf' }, ticks: { font: { family: 'DM Sans', size: 10 } }, beginAtZero: false },
                },
              }} />
            </div>
          </motion.div>
        )}

        {/* ── Section Scores Over Time ───────────────── */}
        {completedWithScores.length >= 2 && sectionAvgs.length > 1 && (
          <motion.div {...stagger(4)} style={cardStyle}>
            <h3 style={headingStyle}>
              <Icon name="results" size={17} />
              Section Scores Over Time
            </h3>
            <div style={{ height: 220 }}>
              <Line data={sectionTrendData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { font: { family: 'DM Sans', size: 11 } } } },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 10 } } },
                  y: { grid: { color: '#eceadf' }, ticks: { font: { family: 'DM Sans', size: 10 } }, beginAtZero: false },
                },
              }} />
            </div>
          </motion.div>
        )}

        {/* ── Weak Topics + Test History (side-by-side) ─ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 18 }}>
          {/* Weak Topics */}
          <motion.div {...stagger(5)} style={{ ...cardStyle, marginBottom: 0 }}>
            <h3 style={headingStyle}>
              <Icon name="mistakes" size={17} />
              Top Weak Areas
            </h3>
            {topWeakTopics.length === 0 && (
              <p style={{ color: '#8a8f98', fontSize: 13 }}>No weak topics detected yet. Complete a test to see your weak areas.</p>
            )}
            {topWeakTopics.map((topic, i) => {
              const chMeta = chaptersForExam?.[topic.ch] || {}
              const label = topic.name || chMeta.name || `Topic ${topic.ch}`
              const domain = topic.domain || chMeta.domain || ''
              return (
                <div key={topic.ch} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                  borderBottom: i < topWeakTopics.length - 1 ? '1px solid #f3f0e9' : 'none',
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(239,68,68,.10)', color: '#ef4444', fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#16181d' }}>{label}</div>
                    {domain && <div style={{ fontSize: 11, color: '#8a8f98' }}>{domain}</div>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', flexShrink: 0 }}>
                    {topic.count} missed
                  </span>
                </div>
              )
            })}
          </motion.div>

          {/* Test History */}
          <motion.div {...stagger(6)} style={{ ...cardStyle, marginBottom: 0 }}>
            <h3 style={headingStyle}>
              <Icon name="test" size={17} />
              Test History
            </h3>
            {testHistory.length === 0 && (
              <p style={{ color: '#8a8f98', fontSize: 13 }}>No completed tests yet.</p>
            )}
            <div style={{ display: 'grid', gap: 8 }}>
              {testHistory.map((t) => (
                <Link
                  key={t.id}
                  to={viewHref(`/results/${t.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                    padding: '10px 12px', border: '1px solid rgba(2,132,199,.15)', borderRadius: 10, textDecoration: 'none', color: '#16181d',
                    background: 'white',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: '#8a8f98' }}>{t.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ fontSize: 18, fontWeight: 600, color: '#16181d' }}>{t.total}</span>
                    {t.sections.map((s) => (
                      <span key={s.label} style={{ fontSize: 11, color: '#565a63', textAlign: 'center' }}>
                        <div style={{ fontWeight: 600 }}>{s.val}</div>
                        <div style={{ fontSize: 9, opacity: 0.7 }}>{s.label}</div>
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Study Guide Progress ───────────────────── */}
        <motion.div {...stagger(7)} style={cardStyle}>
          <h3 style={headingStyle}>
            <Icon name="guide" size={17} />
            Study Guide Progress
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 10, borderRadius: 5, background: '#f3f0e9', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, studiedPct)}%`, height: '100%', borderRadius: 5,
                background: studiedPct >= 100 ? '#059669' : '#0284c7', transition: 'width .5s ease',
              }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: studiedPct >= 100 ? '#059669' : '#16181d', flexShrink: 0 }}>
              {studiedCount}/{examConfig.guideCompletionTarget} modules
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#8a8f98' }}>
            {studiedPct >= 100
              ? 'All study guide modules completed!'
              : `${examConfig.guideCompletionTarget - studiedCount} modules remaining`}
          </div>
        </motion.div>

        {/* ── Mistake Review Progress ────────────────── */}
        <motion.div {...stagger(8)} style={cardStyle}>
          <h3 style={headingStyle}>
            <Icon name="mistakes" size={17} />
            Mistake Review Progress
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 10, borderRadius: 5, background: '#f3f0e9', overflow: 'hidden' }}>
              <div style={{
                width: `${mistakesForExam.length ? Math.min(100, Math.round((validatedCount / mistakesForExam.length) * 100)) : 0}%`,
                height: '100%', borderRadius: 5,
                background: validatedCount === mistakesForExam.length && mistakesForExam.length > 0 ? '#059669' : '#f59e0b',
                transition: 'width .5s ease',
              }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: validatedCount === mistakesForExam.length && mistakesForExam.length > 0 ? '#059669' : '#16181d', flexShrink: 0 }}>
              {validatedCount}/{mistakesForExam.length} reviewed
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#8a8f98' }}>
            {mistakesForExam.length === 0
              ? 'No mistakes recorded yet.'
              : validatedCount === mistakesForExam.length
                ? 'All mistakes reviewed!'
                : `${mistakesForExam.length - validatedCount} mistakes still need review`}
          </div>
        </motion.div>

        {/* ── Detailed Test Results (admin/tutor) ────── */}
        {completedAttempts.length > 0 && (
          <motion.div {...stagger(9)} style={cardStyle}>
            <h3 style={headingStyle}>
              <Icon name="test" size={17} />
              Detailed Test Screens
            </h3>
            <p style={{ fontSize: 13, color: '#565a63', lineHeight: 1.6, marginBottom: 12 }}>
              Open the exact post-test results pages for each completed test.
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              {completedAttempts.slice(0, 8).map((attempt) => {
                const label = TESTS.find(t => t.id === (attempt.test_id === 'practice_test_11' ? 'pre_test' : attempt.test_id))?.label || attempt.test_id
                return (
                  <div key={attempt.id} style={{ border: '1px solid rgba(2,132,199,.15)', borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#16181d' }}>{label}</div>
                      <div style={{ fontSize: 13, color: '#565a63', marginTop: 4 }}>
                        {new Date(attempt.started_at).toLocaleDateString()} &middot; Total {resolveScores(attempt)?.total || resolveScores(attempt)?.composite || '—'}
                      </div>
                    </div>
                    <Link className="btn btn-outline" to={viewHref(`/results/${attempt.id}`)}>
                      Open Results
                    </Link>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Recent Mistakes section removed per user request */}

      </div>
    </div>
  )
}
