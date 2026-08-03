import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { answerMatches, isMultipleChoiceAnswer } from '../data/testData.js'
import { getTestConfig, getExamFromTestId } from '../data/tests.js'
import { getAnswerKeyBySection } from '../data/answerKeys.js'
import { buildAdaptiveSchedule, loadSatTestDate, loadStudyPrefs, dayLabels, normalizeWeakTopics } from '../lib/studyPlan.js'
import BrandLink from '../components/BrandLink.jsx'
import Icon from '../components/AppIcons.jsx'
import TopResourceNav from '../components/TopResourceNav.jsx'
import { getExamConfigForTest, getScoreColumnsForExam, calcWeakTopicsForTest } from '../data/examData.js'
import { loadDashboardViewData } from '../lib/dashboardData.js'
import { resolveViewContext, withExam, withViewUser } from '../lib/viewAs.js'
import { getInitialPreferredExam } from '../lib/examChoice.js'

import Sidebar from '../components/Sidebar.jsx'
import { hasUnlockedResources, setUnlockedResources } from '../lib/pretestGate.js'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function SectionBreakdown({ answers, keyBySection, moduleOrder, modules }) {
  const sections = (moduleOrder || []).map((key) => ({
    key,
    label: `${modules?.[key]?.label || key}${modules?.[key]?.module ? ` — ${modules[key].module}` : ''}`,
    total: Number(modules?.[key]?.questions || 0),
  }))
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
      {sections.map(s => {
        const sAnswers = answers[s.key] || {}
        const key = keyBySection?.[s.key] || {}
        let correct = 0
        Object.entries(sAnswers).forEach(([q, v]) => {
          const right = key?.[q]
          if (!right) return
          const ok = answerMatches(v, right)
          if (ok) correct++
        })
        const answered = Object.keys(sAnswers).length
        const pct = s.total > 0 ? Math.round((correct / s.total) * 100) : 0
        return (
          <div key={s.key} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#565a63', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 600, color: '#16181d' }}>{correct}/{s.total}</div>
            <div style={{ height: 6, background: '#f3f0e9', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444', borderRadius: 3, transition: 'width .8s ease' }} />
            </div>
            <div style={{ fontSize: 12, color: '#8a8f98', marginTop: 4 }}>{pct}% correct · {answered} attempted</div>
          </div>
        )
      })}
    </div>
  )
}

function chapterDisplay(ch, chapters) {
  const meta = chapters?.[ch] || {}
  return meta.code || ch
}

function QuestionReview({ answers, keyBySection, guideHref, moduleOrder, modules, questionChapterMap, chapters }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="eye" size={17} />
        Question-by-Question Review
      </h3>
      {(moduleOrder || []).map(mod => {
        const modAnswers = answers[mod] || {}
        const key = keyBySection?.[mod] || {}
        const chMap = questionChapterMap?.[mod] || {}
        const total = Number(modules?.[mod]?.questions || 0)
        const wrongs = []
        for (let q = 1; q <= total; q++) {
          const given = modAnswers[q]
          const right = key?.[q]
          if (!right) continue
          const isCorrect = given && answerMatches(given, right)
          if (!isCorrect) wrongs.push({ q, given, right, ch: chMap[q] })
        }
        if (wrongs.length === 0) return (
          <div key={mod} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#16181d', marginBottom: 8 }}>
              {modules?.[mod]?.label} — {modules?.[mod]?.module} <span style={{ color: '#10b981' }}>(Perfect)</span>
            </div>
          </div>
        )
        return (
          <div key={mod} style={{ marginBottom: 20 }}>
            <button onClick={() => setExpanded(expanded === mod ? null : mod)}
              style={{ width: '100%', textAlign: 'left', background: '#f7f5ef', border: '1px solid #e4e0d5', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 13, fontWeight: 700 }}>
                {modules?.[mod]?.label} — {modules?.[mod]?.module}
              </span>
              <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 700 }}>
                {wrongs.length} wrong {expanded === mod ? '▲' : '▼'}
              </span>
            </button>
            {expanded === mod && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {wrongs.map(({ q, given, ch }) => {
                  const chData = chapters?.[ch]
                  return (
                    <div key={q} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 15, color: '#dc2626', minWidth: 28 }}>Q{q}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12 }}>
                          Your answer: <strong style={{ color: '#dc2626' }}>{given || '—'}</strong>
                        </div>
                        {chData && (
                          <div style={{ fontSize: 11, color: '#565a63', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Icon name="guide" size={13} />
                            <span>Study Guide:</span>
                            <Link to={guideHref(ch)} style={{ color: '#16181d', fontWeight: 600 }}>
                              {`Chapter ${chapterDisplay(ch, chapters)}`} — {chData.name}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ResultScheduleTaskLink({ task, viewHref }) {
  const done = !!task.completed
  const doneAccent = '#059669'
  const accent = done ? doneAccent : (task.type === 'guide' ? '#16181d' : task.type === 'mistakes' ? '#f59e0b' : '#0284c7')
  const icon = done ? 'check' : (task.type === 'guide' ? 'guide' : task.type === 'mistakes' ? 'mistakes' : 'results')
  return (
    <Link
      to={viewHref(task.href)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 12px',
        border: done ? '1px solid rgba(5,150,105,.3)' : '1px solid #e4e0d5',
        borderRadius: 12,
        textDecoration: 'none',
        color: done ? '#059669' : '#16181d',
        background: done ? 'rgba(5,150,105,.06)' : 'white',
      }}
    >
      <span style={{
        width: 30,
        height: 30,
        borderRadius: 10,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: done ? 'rgba(5,150,105,.15)' : `${accent}14`,
        color: accent,
        flexShrink: 0,
      }}>
        <Icon name={icon} size={15} />
      </span>
      <span style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: done ? '#059669' : '#16181d', lineHeight: 1.35 }}>{done && '✓ '}{task.title}</div>
        <div style={{ fontSize: 12, color: done ? '#6ee7b7' : '#565a63', lineHeight: 1.5, marginTop: 2 }}>{task.subtitle}</div>
      </span>
    </Link>
  )
}

export default function Results() {
  const { attemptId } = useParams()
  const { user, profile } = useAuth()
  const location = useLocation()
  const { viewUserId, isAdminPreview } = resolveViewContext({ userId: user?.id, profile, search: location.search })
  const requestedExam = useMemo(() => String(new URLSearchParams(location.search || '').get('exam') || '').toLowerCase(), [location.search])
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const exam = attempt
    ? getExamConfigForTest(attempt.test_id).exam
    : (requestedExam === 'sat' ? requestedExam : getInitialPreferredExam(user))
  const examConfig = getExamConfigForTest(attempt?.test_id || 'pre_test')
  const [prefs, setPrefs] = useState(() => loadStudyPrefs(viewUserId, exam))
  const [satDate, setSatDate] = useState(() => loadSatTestDate(viewUserId, exam))
  const [studiedMap, setStudiedMap] = useState({})
  const [reviewItems, setReviewItems] = useState({})
  const [allMistakes, setAllMistakes] = useState([])
  // showDatePrompt removed — handled by /setup-plan screen
  const viewHref = (path) => withViewUser(withExam(path, exam), viewUserId, isAdminPreview)
  const readOnlyView = isAdminPreview

  useEffect(() => {
    setPrefs(loadStudyPrefs(viewUserId, exam))
    setSatDate(loadSatTestDate(viewUserId, exam))
  }, [viewUserId, exam])

  useEffect(() => {
    if (!viewUserId) return
    let cancelled = false
    loadDashboardViewData(viewUserId).then((data) => {
      if (cancelled) return
      const chaptersForExam = examConfig.chapters || {}
      const filtered = Object.fromEntries(
        Object.entries(data?.studiedMap || {}).filter(([ch]) => Boolean(chaptersForExam[ch]))
      )
      setStudiedMap(filtered)
      setReviewItems(data?.reviewItems || {})
      setAllMistakes(data?.mistakes || [])
    }).catch(() => {})
    return () => { cancelled = true }
  }, [viewUserId, exam])

  useEffect(() => {
    if (!supabase || !viewUserId) return
    let cancelled = false
    supabase.from('test_attempts').select('*').eq('id', attemptId).eq('user_id', viewUserId).single()
      .then(({ data }) => {
        if (cancelled) return
        const resultExam = getExamConfigForTest(data?.test_id || 'pre_test').exam
        const toDashboard = withViewUser(withExam('/dashboard', resultExam), viewUserId, isAdminPreview)
        if (!data) { navigate(toDashboard); return }
        if (!data.completed_at) { navigate(readOnlyView ? toDashboard : `/test/${attemptId}`); return }
        setAttempt(data)
        if (!readOnlyView) {
          try {
            const key = `agora_viewed_results_v1:${viewUserId}`
            const raw = localStorage.getItem(key)
            const obj = raw ? JSON.parse(raw) : {}
            obj[String(attemptId)] = new Date().toISOString()
            localStorage.setItem(key, JSON.stringify(obj))
          } catch {}
        }
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false)
          navigate(withViewUser(withExam('/dashboard', exam), viewUserId, isAdminPreview))
        }
      })
    return () => {
      cancelled = true
    }
  }, [attemptId, viewUserId, navigate, readOnlyView, exam, isAdminPreview])

  const scores = attempt?.scores || {}
  const currentTestConfig = getTestConfig(attempt?.test_id)
  const answers = attempt?.answers || {}
  const keyBySection = getAnswerKeyBySection(attempt?.test_id)
  const weakTopics = useMemo(() => {
    // Always recompute from raw answers + answer key for accuracy
    if (keyBySection && answers && Object.keys(answers).length) {
      const computed = calcWeakTopicsForTest(attempt?.test_id, answers, keyBySection)
      if (computed.length) return computed
    }
    return normalizeWeakTopics(attempt?.weak_topics || [])
  }, [attempt?.test_id, answers, keyBySection, attempt?.weak_topics])
  const isPriorScore = scores?.source === 'prior_score'
  const isPreTest = (attempt?.test_id === examConfig.preTestId) || (attempt?.test_id === 'practice_test_11' && exam === 'sat') || !attempt?.test_id
  const showResourceNav = hasUnlockedResources(viewUserId, exam) || Boolean(isPreTest && attempt?.completed_at)
  const scoreColumns = getScoreColumnsForExam(exam)
  const reviewCount = useMemo(() => {
    if (!keyBySection) return 0
    let wrong = 0
    for (const [section, key] of Object.entries(keyBySection || {})) {
      for (const [q, right] of Object.entries(key || {})) {
        const given = answers?.[section]?.[q]
        if (given == null || String(given).trim() === '') continue
        const ok = answerMatches(given, right)
        if (!ok) wrong += 1
      }
    }
    return wrong
  }, [answers, keyBySection])

  const reviewTodoCount = useMemo(() => {
    if (!keyBySection) return reviewCount
    let validated = 0
    for (const [section, key] of Object.entries(keyBySection || {})) {
      for (const [q, right] of Object.entries(key || {})) {
        const given = answers?.[section]?.[q]
        if (given == null || String(given).trim() === '') continue
        if (!answerMatches(given, right)) {
          const k = `${attempt?.test_id}:${section}:${q}`
          if (reviewItems?.[k]?.last_correct === true) validated += 1
        }
      }
    }
    return Math.max(0, reviewCount - validated)
  }, [reviewCount, reviewItems, keyBySection, answers, attempt?.test_id])

  // Use ALL mistakes for the exam so review count matches the Mistake Notebook
  const allExamMistakes = useMemo(() =>
    (allMistakes || []).filter((m) => getExamFromTestId(m?.test_id) === exam),
    [allMistakes, exam]
  )
  const allExamValidated = useMemo(() =>
    allExamMistakes.filter((m) => {
      const k = `${m.test_id}:${m.section}:${m.q_num}`
      return reviewItems?.[k]?.last_correct === true
    }).length,
    [allExamMistakes, reviewItems]
  )
  const allExamReviewTodo = Math.max(0, allExamMistakes.length - allExamValidated)

  const journeySchedule = useMemo(() => buildAdaptiveSchedule({
    weakTopics,
    studiedMap,
    reviewCount: allExamReviewTodo,
    totalReviewCount: allExamMistakes.length,
    hasViewedResults: true,
    hasTakenPretest: true,
    prefs,
    testDate: satDate,
    exam,
  }), [weakTopics, studiedMap, allExamReviewTodo, allExamMistakes.length, prefs, satDate, exam])

  const resultDayCards = journeySchedule?.days?.slice(0, 3) || []

  useEffect(() => {
    if (attempt?.completed_at && isPreTest) {
      setUnlockedResources(viewUserId, exam, true)
    }
  }, [attempt?.completed_at, isPreTest, viewUserId, exam])

  // Date prompt and availability are now handled by the /setup-plan screen before results.

  if (loading) return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, height: '100vh', color: '#565a63' }}>
        Loading results…
      </div>
    </div>
  )

  // Domain summary for chart
  const domainCounts = {}
  weakTopics.forEach(t => {
    const d = t.domain || 'Other'
    domainCounts[d] = (domainCounts[d] || 0) + t.count
  })
  const chartData = {
    labels: Object.keys(domainCounts),
    datasets: [{
      label: 'Questions Missed',
      data: Object.values(domainCounts),
      backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'],
      borderRadius: 8,
      borderSkipped: false,
    }]
  }

  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />
      <div className="page fade-up">
        {isAdminPreview && (() => {
          const isTutorUser = profile?.role === "tutor"
          return (
          <div className="card" style={{ marginBottom: 16, background: "#16181d", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{isTutorUser ? "Tutor View" : "Admin View"}</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.88 }}>
                  {"You\u0027re viewing this student\u0027s post-test results in read-only mode."}
                </div>
              </div>
              <Link className="btn btn-outline" to={isTutorUser ? "/tutor" : "/admin"} style={{ color: "white", borderColor: "rgba(255,255,255,.24)", background: "rgba(255,255,255,.08)" }}>
                {isTutorUser ? "Back to Students" : "Back to Admin"}
              </Link>
            </div>
          </div>
          )
        })()}
        {/* Score Hero */}
        <div className="results-score-hero" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', opacity: .6, marginBottom: 8 }}>
            {(currentTestConfig?.label || 'Pre Test')} — Score
          </div>
          <div className="results-total">{scores.composite || scores.total || '—'}</div>
          <div className="results-label">out of 1600</div>
          <div className="section-scores">
            {scoreColumns.filter((column) => column.key !== 'total').map((column, index, arr) => (
              <div key={column.key} style={{ display: 'contents' }}>
                <div className="section-score-item">
                  <div className="section-score-num">{scores[column.key] || '—'}</div>
                  <div className="section-score-lbl">{column.label}</div>
                </div>
                {index < arr.length - 1 ? <div style={{ width: 1, background: 'rgba(255,255,255,.2)' }} /> : null}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 13, opacity: .6 }}>
            {isPriorScore ? 'Entered prior score' : `Completed ${new Date(attempt.completed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          </div>
          {currentTestConfig?.explanationUrl && (
            <div style={{ marginTop: 14 }}>
              <a className="btn btn-outline" href={currentTestConfig.explanationUrl} target="_blank" rel="noreferrer">
                Open Answer Key + Explanations →
              </a>
            </div>
          )}
        </div>

        {isPriorScore && (
          <div className="card" style={{ marginBottom: 24, padding: 20, background: '#faf9f6', border: '1px solid rgba(2,132,199,.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="info" size={18} style={{ color: '#0284c7' }} />
              <div>
                <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 14, color: '#16181d', marginBottom: 2 }}>Prior Score Entry</div>
                <div style={{ fontSize: 13, color: '#565a63', lineHeight: 1.6 }}>
                  This score was manually entered, not taken on the platform. Detailed insights like section breakdowns, weak topics, and question review are only available for tests taken here.
                </div>
              </div>
            </div>
          </div>
        )}

	        {/* Section breakdown */}
	        {!isPriorScore && (keyBySection ? (
	          <SectionBreakdown answers={answers} keyBySection={keyBySection} moduleOrder={examConfig.moduleOrder} modules={examConfig.modules} />
	        ) : (
	          <div className="card" style={{ marginBottom: 24, color: '#565a63', lineHeight: 1.7 }}>
	            Detailed module-by-module review isn't available for this test yet.
	          </div>
	        ))}

	        {/* Weak topics */}
	        {!isPriorScore && isPreTest && weakTopics.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 15, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="warning" size={17} />
              Top Weak Areas
            </h3>
            <p style={{ fontSize: 13, color: '#565a63', marginBottom: 12 }}>
              Focus on these first — they're already prioritized in your study plan.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {weakTopics.slice(0, 5).map((t, i) => (
                <div key={t.ch} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f7f5ef', borderRadius: 10, border: '1px solid #e4e0d5' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: i < 2 ? '#fef2f2' : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: i < 2 ? '#dc2626' : '#f59e0b', flexShrink: 0 }}>{t.count}</div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#16181d' }}>{t.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

	        {/* Domain chart */}
	        {!isPriorScore && isPreTest && Object.keys(domainCounts).length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="chart" size={17} />
              Missed Questions by Domain
            </h3>
            <div style={{ height: 220 }}>
              <Bar data={chartData} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 11 } } },
                  y: { grid: { color: '#eceadf' }, ticks: { font: { family: 'DM Sans', size: 11 } } }
                }
              }} />
            </div>
          </div>
        )}

        {/* Smart Journey Planner */}
        {!isPriorScore && <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 15, fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="calendar" size={17} />
                Smart Journey Planner
              </h3>
              <p style={{ fontSize: 13, color: '#565a63', lineHeight: 1.6 }}>
                Instead of a static weekly plan, your next steps update from this test's weak topics, your availability, and your target {examConfig.label} date.
              </p>
            </div>
            <Link className="btn btn-outline" to={viewHref('/calendar')} style={{ flexShrink: 0 }}>
              Open Full Calendar →
            </Link>
          </div>

          <div style={{ border: '1px solid #e4e0d5', borderRadius: 12, padding: 14, background: '#f7f5ef', marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', fontSize: 12, color: '#565a63' }}>
              {satDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="calendar" size={14} />
                  <span style={{ fontWeight: 600 }}>Test date:</span>
                  <span style={{ color: '#16181d', fontWeight: 700 }}>{new Date(satDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Study days:</span>
                <span style={{ color: '#16181d', fontWeight: 700 }}>
                  {dayLabels().filter((_, i) => prefs?.days?.[i]).join(', ') || 'None set'}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: journeySchedule?.needsMoreTime ? '#92400e' : '#565a63', lineHeight: 1.6 }}>
              {journeySchedule?.needsMoreTime
                ? <>Plan for about <b>{journeySchedule.requiredMinutesPerDay} minutes on each study day</b> to stay on track. You can adjust your date and availability from the <Link to={viewHref('/calendar')} style={{ color: '#0284c7', fontWeight: 700 }}>Calendar</Link>.</>
                : <>This plan updates from your latest results. Missed days roll forward automatically.</>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
            {resultDayCards.map((day, idx) => (
              <div
                key={day.key}
                style={{
                  border: '1px solid #e4e0d5',
                  borderRadius: 12,
                  padding: 14,
                  background: idx === 0 ? '#f3f0e9' : '#f7f5ef',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#16181d' }}>
                      {idx === 0 ? 'Today' : idx === 1 ? 'Following Study Day' : 'Coming Up'}
                    </div>
                    <div style={{ fontSize: 12, color: '#565a63', marginTop: 2 }}>{day.label}</div>
                  </div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: day.focus === 'Reading' ? 'rgba(2,132,199,.12)' : day.focus === 'Math' ? 'rgba(16,185,129,.12)' : 'rgba(138,143,152,.14)',
                    color: day.focus === 'Reading' ? '#2563eb' : day.focus === 'Math' ? '#059669' : '#565a63',
                  }}>
                    {day.focus}
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {day.tasks.length ? day.tasks.map((task) => (
                    <ResultScheduleTaskLink key={task.id} task={task} viewHref={viewHref} />
                  )) : (
                    <div style={{ padding: '12px', border: '1px dashed #cbd5e1', borderRadius: 12, color: '#565a63', fontSize: 12, lineHeight: 1.6 }}>
                      No required tasks for this day. Use it as a catch-up or light review day.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>}

	        {/* Q-by-Q review */}
	        {!isPriorScore && keyBySection && (
            <QuestionReview
              answers={answers}
              keyBySection={keyBySection}
              guideHref={(chapterId) => viewHref(`/guide?chapter=${encodeURIComponent(chapterId)}`)}
              moduleOrder={examConfig.moduleOrder}
              modules={examConfig.modules}
              questionChapterMap={examConfig.questionChapterMap}
              chapters={examConfig.chapters}
            />
          )}

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', paddingBottom: 40 }}>
          <Link to={viewHref('/dashboard')} className="btn btn-primary">
            <Icon name="back" size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
