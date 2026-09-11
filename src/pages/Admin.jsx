import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { clearAdminTestingData } from '../lib/studyProgress.js'
import Sidebar from '../components/Sidebar.jsx'
import Icon from '../components/AppIcons.jsx'
import { TESTS, getExamFromTestId } from '../data/tests.js'
import { ANSWER_KEY } from '../data/testData.js'
import { getAnswerKeyBySection } from '../data/answerKeys.js'
import { calcWeakTopicsForTest, getExamConfig, getExamConfigForTest, getQuestionCountForTest, getScoreColumnsForExam, scoreAttemptFromKey } from '../data/examData.js'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { motion } from 'framer-motion'
import ProgramSelect from '../components/ProgramSelect.jsx'
import { fetchPrograms } from '../lib/programs.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

/* ── constants ── */
const FINAL_TEST_ID = 'final_test'
const REGRADER_VERSION = '2026-03-18-01'

/* ── style tokens ── */
const cardStyle = {
  background: '#fff',
  border: '1.5px solid rgba(2,132,199,.12)',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(22,24,29,.06)',
  padding: '28px 28px',
  marginBottom: 20,
}

const sectionHeading = {
  fontFamily: 'Fraunces, Georgia, serif',
  fontSize: 16,
  fontWeight: 600,
  color: '#16181d',
  margin: '0 0 16px 0',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
}

const iconBadge = {
  width: 32,
  height: 32,
  borderRadius: 9,
  background: '#0284c7',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  flexShrink: 0,
}

const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: 11,
  color: '#565a63',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '.5px',
  background: '#f7f5ef',
  borderBottom: '1.5px solid rgba(2,132,199,.10)',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '12px 14px',
  fontSize: 13,
  color: '#3f434b',
}

const statCard = {
  background: '#fff',
  border: '1.5px solid rgba(2,132,199,.12)',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(22,24,29,.06)',
  padding: '18px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: 14,
}

const statIconWrap = {
  width: 42,
  height: 42,
  borderRadius: 12,
  background: 'rgba(2,132,199,.08)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#0284c7',
  flexShrink: 0,
}

const pillBtn = (active) => ({
  padding: '8px 16px',
  border: `1.5px solid ${active ? 'rgba(2,132,199,.35)' : 'rgba(2,132,199,.12)'}`,
  borderRadius: 10,
  background: active ? 'rgba(2,132,199,.08)' : '#fff',
  fontFamily: 'Fraunces, Georgia, serif',
  fontWeight: 600,
  fontSize: 12,
  color: active ? '#0284c7' : '#565a63',
  cursor: 'pointer',
  transition: 'all .2s',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
})

const actionBtn = {
  padding: '7px 14px',
  fontSize: 12,
  fontWeight: 600,
  fontFamily: 'Fraunces, Georgia, serif',
  color: '#16181d',
  background: '#fff',
  border: '1.5px solid rgba(2,132,199,.18)',
  borderRadius: 9,
  cursor: 'pointer',
  transition: 'all .2s',
}

const actionBtnDanger = {
  ...actionBtn,
  borderColor: '#fecaca',
  color: '#b91c1c',
}

const rolePill = (role) => ({
  padding: '3px 10px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  background: role === 'admin' ? '#fef3c7' : role === 'tutor' ? '#dbeafe' : '#f0fdf4',
  color: role === 'admin' ? '#92400e' : role === 'tutor' ? '#1e40af' : '#166534',
})

const examPill = (exam) => ({
  padding: '3px 10px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  background: 'rgba(245,158,11,.12)',
  color: '#b45309',
})

const fadeCard = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } }

/* ── helpers ── */
function toDayKey(iso) {
  try {
    if (!iso) return null
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return null
    return d.toISOString().slice(0, 10)
  } catch {
    return null
  }
}

function quantile(sorted, q) {
  if (!sorted?.length) return null
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  const a = sorted[base]
  const b = sorted[Math.min(sorted.length - 1, base + 1)]
  return a + rest * (b - a)
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
}

function normalizeTestId(id) {
  if (!id || id === 'practice_test_11') return 'pre_test'
  return id
}

function testLabel(id) {
  const norm = normalizeTestId(id)
  const t = TESTS.find(x => x.id === norm) || TESTS.find(x => x.id === id)
  return t?.label || (norm === 'pre_test' ? 'Pre Test' : (id || 'Test'))
}

function isPreTestId(id) {
  const norm = normalizeTestId(id)
  return norm === 'pre_test'
}

function countKey(key) {
  if (!key || typeof key !== 'object') return 0
  const values = Object.values(key)
  if (values.some((value) => value && typeof value === 'object' && !Array.isArray(value))) {
    return values.reduce((sum, value) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return sum
      return sum + Object.keys(value).length
    }, 0)
  }
  return Object.keys(key || {}).length
}

function attemptTotalScore(attempt) {
  const exam = getExamFromTestId(attempt?.test_id)
  return Number(attempt?.scores?.composite || attempt?.scores?.total || 0)
}

function attemptAccuracyRecord(attempt) {
  const testId = normalizeTestId(attempt?.test_id)
  const exam = getExamFromTestId(testId)
  const totalQuestions = Math.max(1, Number(getQuestionCountForTest(testId) || 0))
  let raw = Number(attempt?.scores?.raw || 0)
  let total = attemptTotalScore(attempt)
  if (attempt?.answers && Object.keys(attempt.answers).length) {
    try {
      const rescored = scoreAttemptFromKey(testId, attempt.answers, getAnswerKeyBySection(testId) || {})
      if (rescored) {
        if (!raw) raw = Number(rescored.raw || 0)
        if (!total) total = Number(rescored.composite || rescored.total || 0)
      }
    } catch {
      // answer key not available for this test
    }
  }
  const percent = raw > 0 ? raw / totalQuestions : 0
  return {
    exam,
    raw,
    total,
    totalQuestions,
    percent,
    display: total > 0
      ? `${String(exam || 'sat').toUpperCase()} ${total}`
      : (percent > 0 ? `${Math.round(percent * 100)}% correct` : null),
  }
}

function formatAttemptBreakdown(attempt) {
  const exam = getExamFromTestId(attempt?.test_id)
  const columns = getScoreColumnsForExam(exam).filter((column) => column.key !== 'total')
  return columns
    .map((column) => {
      const value = attempt?.scores?.[column.key]
      return value != null ? `${column.label} ${value}` : null
    })
    .filter(Boolean)
    .join(' · ')
}

function computeAttemptWeakTopics(attempt) {
  try {
    if (Array.isArray(attempt?.weak_topics) && attempt.weak_topics.length) return attempt.weak_topics
    const tid = normalizeTestId(attempt?.test_id)
    const keyBySection = getAnswerKeyBySection(tid) || (isPreTestId(tid) ? ANSWER_KEY : null)
    if (!keyBySection) return []
    return calcWeakTopicsForTest(tid, attempt?.answers || {}, keyBySection)
  } catch {
    return []
  }
}

function formatTopWeakness(attempt) {
  const weakTopics = computeAttemptWeakTopics(attempt)
  const topWeak = weakTopics?.[0]
  if (!topWeak) return '\u2014'
  const exam = getExamFromTestId(attempt?.test_id)
  const cfg = getExamConfig(exam)
  const chapterMeta = cfg?.chapters?.[topWeak.ch] || {}
  const label = topWeak.name || chapterMeta?.name || topWeak.ch || 'Weak area'
  const domain = topWeak.domain || chapterMeta?.domain || ''
  const moduleCode = chapterMeta?.code ? `${chapterMeta.code} \u00b7 ` : ''
  const page = Number.isFinite(Number(topWeak.page ?? chapterMeta?.page)) ? ` (p.${Number(topWeak.page ?? chapterMeta?.page)})` : ''
  return `${moduleCode}${label}${domain ? ` \u00b7 ${domain}` : ''}${page}`
}

function pairedTTest(pairs) {
  if (pairs.length < 2) return null
  const diffs = pairs.map(p => p.post - p.pre)
  const n = diffs.length
  const mean = diffs.reduce((a, b) => a + b, 0) / n
  const variance = diffs.reduce((s, d) => s + Math.pow(d - mean, 2), 0) / (n - 1)
  const sd = Math.sqrt(variance)
  const se = sd / Math.sqrt(n)
  const t = se === 0 ? 0 : mean / se
  const df = n - 1
  const tAbs = Math.abs(t)
  const crit = [
    [1,12.71,63.66],[2,4.303,9.925],[3,3.182,5.841],[4,2.776,4.604],
    [5,2.571,4.032],[6,2.447,3.707],[7,2.365,3.499],[8,2.306,3.355],
    [9,2.262,3.250],[10,2.228,3.169],[15,2.131,2.947],[20,2.086,2.845],
    [30,2.042,2.750],[60,2.000,2.660],[120,1.980,2.617]
  ]
  let cv = crit[crit.length - 1]
  for (const r of crit) { if (df <= r[0]) { cv = r; break } }
  let pLabel, conf, sig
  if (tAbs > cv[2]) { pLabel = 'p < 0.01'; conf = '99%'; sig = true }
  else if (tAbs > cv[1]) { pLabel = 'p < 0.05'; conf = '95%'; sig = true }
  else { pLabel = 'p \u2265 0.05'; conf = '<95%'; sig = false }
  const d = sd === 0 ? 0 : mean / sd
  const ci = 1.96 * se
  return { n, mean, sd, se, t, df, pLabel, conf, sig, d, ci, lo: mean - ci, hi: mean + ci }
}

/* ── chart option presets ── */
const chartFont = { family: 'DM Sans', size: 11 }
const lightGrid = { color: '#eceadf' }
const noGrid = { display: false }

function barOpts({ legend = true, yMin, yMax } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: legend, labels: { font: chartFont } } },
    scales: {
      x: { grid: noGrid, ticks: { font: chartFont } },
      y: { grid: lightGrid, ticks: { font: chartFont }, beginAtZero: yMin == null, ...(yMin != null ? { min: yMin } : {}), ...(yMax != null ? { max: yMax } : {}) },
    },
  }
}

function lineOpts() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { font: chartFont } } },
    scales: {
      x: { grid: noGrid, ticks: { font: chartFont } },
      y: { grid: lightGrid, ticks: { font: chartFont }, beginAtZero: true },
    },
  }
}

/* ══════════════════════════════════════════════
   Component
   ══════════════════════════════════════════════ */
export default function Admin() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const isAdmin = profile?.role === 'admin'

  const [students, setStudents] = useState([])
  const [attempts, setAttempts] = useState([])
  const [postScores, setPostScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('students')
  const [keysByTest, setKeysByTest] = useState({})
  const [testKeyStatus, setTestKeyStatus] = useState({ loading: false, msg: '' })
  const [resettingUserId, setResettingUserId] = useState(null)
  const [resetMsg, setResetMsg] = useState('')
  const [regrading, setRegrading] = useState(false)
  const [analyticsExam, setAnalyticsExam] = useState('sat')
  const [affiliationFilter, setAffiliationFilter] = useState('')
  const [programs, setPrograms] = useState([])
  const [programsAvailable, setProgramsAvailable] = useState(false)
  const [newProgramName, setNewProgramName] = useState('')
  const [programBusy, setProgramBusy] = useState(false)
  const [savingProfileId, setSavingProfileId] = useState(null)

  /* ── data fetching ── */
  const fetchAdminSnapshot = useCallback(async () => {
    // Verify current user is actually admin server-side before fetching any data
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { students: [], attempts: [], postScores: [], keysByTest: {} }
    const { data: currentProfile } = await supabase.from('profiles').select('role,email').eq('id', user.id).maybeSingle()
    if (!currentProfile || currentProfile.role !== 'admin') {
      return { students: [], attempts: [], postScores: [], keysByTest: {} }
    }

    let profileResult = await supabase.from('profiles').select('id,email,full_name,role,affiliation,created_at').order('created_at', { ascending: false })
    if (profileResult.error && !profileResult.data) {
      profileResult = await supabase.from('profiles').select('id,email,full_name,role,created_at').order('created_at', { ascending: false })
    }
    const [a, ps, ak, pr] = await Promise.allSettled([
      supabase.from('test_attempts').select('id,user_id,test_id,started_at,completed_at,scores,weak_topics,answers').not('completed_at', 'is', null).order('started_at', { ascending: false }).limit(2000),
      supabase.from('post_scores').select('attempt_id,post_score,post_rw,post_math,recorded_at').order('recorded_at', { ascending: false }).limit(5000),
      supabase.from('test_answer_keys').select('*'),
      fetchPrograms(),
    ])
    const akMap = {}
    for (const row of (ak.status === 'fulfilled' ? (ak.value.data || []) : [])) akMap[row.test_id] = row.answer_key
    const programsRes = pr.status === 'fulfilled' ? pr.value : { programs: [], available: false }
    return {
      students: profileResult.data || [],
      attempts: a.status === 'fulfilled' ? (a.value.data || []) : [],
      postScores: ps.status === 'fulfilled' ? (ps.value.data || []) : [],
      keysByTest: akMap,
      programs: programsRes.programs,
      programsAvailable: programsRes.available,
    }
  }, [])

  useEffect(() => {
    if (!supabase) return
    if (profile && !isAdmin) {
      navigate('/dashboard')
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      const snapshot = await fetchAdminSnapshot()
      if (cancelled) return
      setStudents(snapshot.students)
      setAttempts(snapshot.attempts)
      setPostScores(snapshot.postScores)
      setKeysByTest(snapshot.keysByTest || {})
      setPrograms(snapshot.programs || [])
      setProgramsAvailable(Boolean(snapshot.programsAvailable))
      setLoading(false)
    }
    load().catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [profile, isAdmin, navigate, fetchAdminSnapshot])

  useEffect(() => {
    if (!supabase || !isAdmin) return
    let disposed = false
    let debounce = null

    const refresh = async () => {
      try {
        const snapshot = await fetchAdminSnapshot()
        if (disposed) return
        setStudents(snapshot.students)
        setAttempts(snapshot.attempts)
        setPostScores(snapshot.postScores)
        setKeysByTest(snapshot.keysByTest || {})
        setPrograms(snapshot.programs || [])
        setProgramsAvailable(Boolean(snapshot.programsAvailable))
      } catch {}
    }

    const queueRefresh = () => {
      clearTimeout(debounce)
      debounce = setTimeout(refresh, 250)
    }

    const channelId = `admin-live:${Date.now()}-${Math.random().toString(36).slice(2)}`
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, queueRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'test_attempts' }, queueRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_scores' }, queueRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mistakes' }, queueRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'studied_topics' }, queueRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'review_items' }, queueRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'test_answer_keys' }, queueRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'programs' }, queueRefresh)
      .subscribe()

    const interval = setInterval(refresh, 15000)

    return () => {
      disposed = true
      clearTimeout(debounce)
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [isAdmin, fetchAdminSnapshot])

  /* ── admin actions ── */
  async function resetStudentData(userId, email) {
    if (!supabase || !isAdmin) return
    const ok = window.confirm(
      `Reset this student's progress?\n\nThis will delete their tests, post-test scores, and study guide progress:\n${email || userId}\n\nTheir login account will still exist.`
    )
    if (!ok) return
    setResettingUserId(userId)
    setResetMsg('')
    try {
      const rpc = await supabase.rpc('admin_reset_user', { target_user_id: userId })
      if (rpc.error) {
        const msg = String(rpc.error.message || '')
        if (msg.toLowerCase().includes('could not find the function') || msg.toLowerCase().includes('admin_reset_user')) {
          const ps = await supabase.from('post_scores').delete().eq('user_id', userId)
          if (ps.error) throw ps.error
          const ta = await supabase.from('test_attempts').delete().eq('user_id', userId)
          if (ta.error) throw ta.error
          const st = await supabase.from('studied_topics').delete().eq('user_id', userId)
          if (st.error && !String(st.error.message || '').includes("Could not find the table 'public.studied_topics'")) throw st.error
          const ms = await supabase.from('mistakes').delete().eq('user_id', userId)
          if (ms.error && !String(ms.error.message || '').toLowerCase().includes('could not find the table')) throw ms.error
          const rv = await supabase.from('review_items').delete().eq('user_id', userId)
          if (rv.error && !String(rv.error.message || '').toLowerCase().includes('could not find the table')) throw rv.error
        } else {
          throw rpc.error
        }
      }
      setResetMsg('Success: student reset complete.')
      const [a, p] = await Promise.all([
        supabase.from('test_attempts').select('id,user_id,test_id,started_at,completed_at,scores,weak_topics,answers').eq('is_sandbox', false).not('completed_at', 'is', null).order('started_at', { ascending: false }).limit(2000),
        supabase.from('post_scores').select('attempt_id,post_score,post_rw,post_math,recorded_at').eq('is_sandbox', false).order('recorded_at', { ascending: false }).limit(5000),
      ])
      setAttempts(a.data || [])
      setPostScores(p.data || [])
    } catch (e) {
      console.error('[Admin] Operation failed:', e?.message)
      setResetMsg('Error: operation failed. Please try again.')
    } finally {
      setResettingUserId(null)
    }
  }

  async function deleteStudentAccount(userId, email) {
    if (!supabase || !isAdmin) return
    const ok = window.confirm(
      `Delete this student's account permanently?\n\nThis will remove their login and delete all their data:\n${email || userId}\n\nThis cannot be undone.`
    )
    if (!ok) return
    setResettingUserId(userId)
    setResetMsg('')
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess?.session?.access_token
      if (!token) throw new Error('Missing session token')
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: userId }),
      })
      const out = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(out?.error || 'Delete failed')
      setResetMsg('Success: student deleted.')
      const p = await supabase.from('profiles').select('id,email,full_name,role,affiliation,created_at').order('created_at', { ascending: false })
      setStudents(p.data || [])
    } catch (e) {
      console.error('[Admin] Delete failed:', e?.message)
      setResetMsg('Error: delete failed. Please try again.')
    } finally {
      setResettingUserId(null)
    }
  }

  /* ── access management: roles + programs ── */
  async function updateProfileField(userId, patch, successMsg) {
    if (!supabase || !isAdmin) return false
    setSavingProfileId(userId)
    setResetMsg('')
    try {
      const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
      if (error) throw error
      setStudents((prev) => prev.map((s) => (s.id === userId ? { ...s, ...patch } : s)))
      if (successMsg) setResetMsg(`Success: ${successMsg}`)
      return true
    } catch (e) {
      console.error('[Admin] Profile update failed:', e?.message)
      setResetMsg(`Error: ${e?.message || 'could not update this account.'}`)
      return false
    } finally {
      setSavingProfileId(null)
    }
  }

  async function changeUserRole(s, nextRole) {
    if (!s || s.role === nextRole) return
    if (s.id === profile?.id) { setResetMsg('Error: you cannot change your own role.'); return }
    const who = s.full_name || s.email || s.id
    if (nextRole === 'admin') {
      const ok = window.confirm(`Make ${who} an ADMIN?\n\nAdmins can see and manage every student in every program.`)
      if (!ok) return
    } else if (nextRole === 'tutor') {
      const program = (s.affiliation || '').trim()
      const ok = window.confirm(
        `Make ${who} a TUTOR?\n\n` +
        (program ? `They will only see students in “${program}”.` : 'They have no program yet — pick one in the Program column or they will see no students.')
      )
      if (!ok) return
    } else {
      const ok = window.confirm(`Change ${who} back to a STUDENT?\n\nThey will lose tutor/admin access immediately.`)
      if (!ok) return
    }
    await updateProfileField(s.id, { role: nextRole }, `${who} is now a ${nextRole}.`)
  }

  async function changeUserProgram(s, nextProgram) {
    if (!s) return
    const clean = String(nextProgram || '').trim().slice(0, 100)
    if ((s.affiliation || '') === clean) return
    const who = s.full_name || s.email || s.id
    await updateProfileField(s.id, { affiliation: clean || null }, clean ? `${who} moved to “${clean}”.` : `${who} removed from their program.`)
  }

  async function addProgram(e) {
    e?.preventDefault?.()
    if (!supabase || !isAdmin) return
    const name = newProgramName.replace(/[<>]/g, '').trim().slice(0, 100)
    if (!name) return
    if (programs.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setResetMsg('Error: that program already exists.')
      return
    }
    setProgramBusy(true)
    setResetMsg('')
    try {
      const { data, error } = await supabase.from('programs').insert({ name }).select('id,name').single()
      if (error) throw error
      setPrograms((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewProgramName('')
      setResetMsg(`Success: added program “${name}”.`)
    } catch (err) {
      console.error('[Admin] Add program failed:', err?.message)
      setResetMsg(`Error: ${err?.message || 'could not add program.'}`)
    } finally {
      setProgramBusy(false)
    }
  }

  async function renameProgram(p) {
    if (!supabase || !isAdmin || !p) return
    const raw = window.prompt(`Rename program “${p.name}” to:`, p.name)
    if (raw == null) return
    const name = raw.replace(/[<>]/g, '').trim().slice(0, 100)
    if (!name || name === p.name) return
    setProgramBusy(true)
    setResetMsg('')
    try {
      const { error } = await supabase.from('programs').update({ name }).eq('id', p.id)
      if (error) throw error
      // The DB trigger moves every student/tutor with the old name to the new one.
      setPrograms((prev) => prev.map((x) => (x.id === p.id ? { ...x, name } : x)).sort((a, b) => a.name.localeCompare(b.name)))
      setStudents((prev) => prev.map((s) => ((s.affiliation || '').trim().toLowerCase() === p.name.trim().toLowerCase() ? { ...s, affiliation: name } : s)))
      if (affiliationFilter.toLowerCase() === p.name.toLowerCase()) setAffiliationFilter(name)
      setResetMsg(`Success: renamed “${p.name}” to “${name}”.`)
    } catch (err) {
      console.error('[Admin] Rename program failed:', err?.message)
      setResetMsg(`Error: ${err?.message || 'could not rename program.'}`)
    } finally {
      setProgramBusy(false)
    }
  }

  async function deleteProgram(p, memberCount) {
    if (!supabase || !isAdmin || !p) return
    if (memberCount > 0) {
      setResetMsg(`Error: “${p.name}” still has ${memberCount} member(s). Move them to another program first.`)
      return
    }
    const ok = window.confirm(`Delete program “${p.name}”?`)
    if (!ok) return
    setProgramBusy(true)
    setResetMsg('')
    try {
      const { error } = await supabase.from('programs').delete().eq('id', p.id)
      if (error) throw error
      setPrograms((prev) => prev.filter((x) => x.id !== p.id))
      setResetMsg(`Success: deleted program “${p.name}”.`)
    } catch (err) {
      console.error('[Admin] Delete program failed:', err?.message)
      setResetMsg(`Error: ${err?.message || 'could not delete program.'}`)
    } finally {
      setProgramBusy(false)
    }
  }

  async function resetMyData() {
    if (!supabase || !isAdmin || !profile?.id) return
    const ok = window.confirm('Reset your admin testing data?\n\nThis will delete your tests, scores, and study progress.')
    if (!ok) return
    setResettingUserId(profile.id)
    setResetMsg('')
    try {
      const rpc = await supabase.rpc('reset_my_data')
      if (rpc.error) {
        const msg = String(rpc.error.message || '')
        if (msg.toLowerCase().includes('could not find the function') || msg.toLowerCase().includes('reset_my_data')) {
          const ps = await supabase.from('post_scores').delete().eq('user_id', profile.id)
          if (ps.error) throw ps.error
          const ta = await supabase.from('test_attempts').delete().eq('user_id', profile.id)
          if (ta.error) throw ta.error
          const st = await supabase.from('studied_topics').delete().eq('user_id', profile.id)
          if (st.error && !String(st.error.message || '').includes("Could not find the table 'public.studied_topics'")) throw st.error
          const ms = await supabase.from('mistakes').delete().eq('user_id', profile.id)
          if (ms.error && !String(ms.error.message || '').toLowerCase().includes('could not find the table')) throw ms.error
          const rv = await supabase.from('review_items').delete().eq('user_id', profile.id)
          if (rv.error && !String(rv.error.message || '').toLowerCase().includes('could not find the table')) throw rv.error
        } else {
          throw rpc.error
        }
      }
      await clearAdminTestingData(profile.id)
      setResetMsg('Success: your data was reset.')
      setTimeout(() => { window.location.assign('/dashboard') }, 400)
    } catch (e) {
      console.error('[Admin] Operation failed:', e?.message)
      setResetMsg('Error: operation failed. Please try again.')
    } finally {
      setResettingUserId(null)
    }
  }

  async function runRegrade({ silent = false } = {}) {
    if (!supabase || !isAdmin || regrading) return
    setRegrading(true)
    if (!silent) setResetMsg('')
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess?.session?.access_token
      if (!token) throw new Error('Missing session token')
      const res = await fetch('/api/admin/regrade-tests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const out = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(out?.error || 'Regrade failed')
      const msg = `Success: regraded ${out.updated || 0} of ${out.scanned || 0} completed attempts.`
      if (!silent) setResetMsg(msg)
      try { localStorage.setItem(`agora_regrader_version:${profile?.id || 'admin'}`, REGRADER_VERSION) } catch {}
      const [a, p] = await Promise.all([
        supabase.from('test_attempts').select('id,user_id,test_id,started_at,completed_at,scores,weak_topics,answers').not('completed_at', 'is', null).order('started_at', { ascending: false }).limit(2000),
        supabase.from('post_scores').select('attempt_id,post_score,post_rw,post_math,recorded_at').order('recorded_at', { ascending: false }).limit(5000),
      ])
      setAttempts(a.data || [])
      setPostScores(p.data || [])
    } catch (e) {
      console.error('[Admin] Regrade failed:', e?.message)
      if (!silent) setResetMsg('Error: regrade failed. Please try again.')
    } finally {
      setRegrading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin || !profile?.id) return
    try {
      const key = `agora_regrader_version:${profile.id}`
      const seen = localStorage.getItem(key)
      if (seen === REGRADER_VERSION) return
      runRegrade({ silent: true })
    } catch {
      runRegrade({ silent: true })
    }
  }, [isAdmin, profile?.id])

  /* ── computed / memo ── */
  const computed = useMemo(() => {
    const studentById = new Map(students.map(s => [s.id, s]))
    const attemptsByUser = new Map()
    const bestPreByUser = new Map()
    const bestExtraByUser = new Map()
    const bestByUser = new Map()
    const extraIds = new Set(TESTS.filter(t => t.kind === 'extra').map(t => t.id))
    for (const a of attempts) {
      const list = attemptsByUser.get(a.user_id) || []
      list.push(a)
      attemptsByUser.set(a.user_id, list)
      const totalAny = attemptAccuracyRecord(a)
      const prevBest = bestByUser.get(a.user_id)
      if (!prevBest || totalAny.percent > prevBest.percent || (totalAny.percent === prevBest.percent && totalAny.total > prevBest.total))
        bestByUser.set(a.user_id, totalAny)
      const isPre = a.test_id === 'pre_test' || a.test_id === 'practice_test_11' || !a.test_id
      if (isPre) {
        const total = attemptTotalScore(a)
        const prev = bestPreByUser.get(a.user_id) || 0
        if (total > prev) bestPreByUser.set(a.user_id, total)
      }
      if (extraIds.has(a.test_id) && (a.completed_at || a.scores?.total)) {
        const total = attemptTotalScore(a)
        const prev = bestExtraByUser.get(a.user_id) || 0
        if (total > prev) bestExtraByUser.set(a.user_id, total)
      }
    }
    const postByAttemptId = new Map()
    for (const p of postScores) {
      if (!p?.attempt_id) continue
      if (!postByAttemptId.has(p.attempt_id)) postByAttemptId.set(p.attempt_id, p)
    }
    const pairsPost = []
    for (const a of attempts) {
      const post = postByAttemptId.get(a.id)
      if (!post) continue
      const pre = Number(a.scores?.composite || a.scores?.total || 0)
      if (!pre || !post.post_score) continue
      const student = studentById.get(a.user_id)
      pairsPost.push({ pre, post: post.post_score, name: student?.full_name || 'Unknown' })
    }
    const pairsOptional = []
    for (const [userId, pre] of bestPreByUser.entries()) {
      const post = bestExtraByUser.get(userId)
      if (!pre || !post) continue
      const student = studentById.get(userId)
      pairsOptional.push({ pre, post, name: student?.full_name || 'Unknown' })
    }
    return { studentById, attemptsByUser, bestByUser, bestPreByUser, bestExtraByUser, postByAttemptId, pairsPost, pairsOptional }
  }, [students, attempts, postScores])

  const pairs = computed.pairsPost
  const pairsOpt = computed.pairsOptional
  const stats = pairedTTest(pairs)
  const avgImprovement = pairs.length > 0 ? Math.round(pairs.reduce((s, p) => s + (p.post - p.pre), 0) / pairs.length) : null
  const statsOpt = pairedTTest(pairsOpt)
  const avgImprovementOpt = pairsOpt.length > 0 ? Math.round(pairsOpt.reduce((s, p) => s + (p.post - p.pre), 0) / pairsOpt.length) : null

  const chartData = pairs.length > 0 ? {
    labels: pairs.map(p => p.name?.split(' ')[0] || '?'),
    datasets: [
      { label: 'Pre-Test', data: pairs.map(p => p.pre), backgroundColor: '#8a8f98', borderRadius: 6, borderSkipped: false },
      { label: 'Post-Test', data: pairs.map(p => p.post), backgroundColor: '#0284c7', borderRadius: 6, borderSkipped: false },
    ]
  } : null

  const gainData = pairs.length > 0 ? {
    labels: pairs.map(p => p.name?.split(' ')[0] || '?'),
    datasets: [{
      label: 'Point Gain',
      data: pairs.map(p => p.post - p.pre),
      backgroundColor: pairs.map(p => p.post >= p.pre ? '#10b981' : '#ef4444'),
      borderRadius: 6, borderSkipped: false,
    }]
  } : null

  const chartDataOpt = pairsOpt.length > 0 ? {
    labels: pairsOpt.map(p => p.name?.split(' ')[0] || '?'),
    datasets: [
      { label: 'Pre-Test', data: pairsOpt.map(p => p.pre), backgroundColor: '#8a8f98', borderRadius: 6, borderSkipped: false },
      { label: 'Best Optional', data: pairsOpt.map(p => p.post), backgroundColor: '#0284c7', borderRadius: 6, borderSkipped: false },
    ]
  } : null

  const gainDataOpt = pairsOpt.length > 0 ? {
    labels: pairsOpt.map(p => p.name?.split(' ')[0] || '?'),
    datasets: [{
      label: 'Point Gain',
      data: pairsOpt.map(p => p.post - p.pre),
      backgroundColor: pairsOpt.map(p => p.post >= p.pre ? '#10b981' : '#ef4444'),
      borderRadius: 6, borderSkipped: false,
    }]
  } : null

  const tabs = [
    { id: 'students', label: 'Students', icon: 'students' },
    { id: 'results', label: 'Test Results', icon: 'results' },
    { id: 'analytics', label: 'Analytics', icon: 'chart' },
    { id: 'affiliations', label: 'Programs', icon: 'students' },
    { id: 'impact', label: 'Proof of Impact', icon: 'report' },
    { id: 'tests', label: 'Tests', icon: 'test' },
  ]

  /* ── affiliation data ── */
  const affiliationData = useMemo(() => {
    const affiliations = new Map()
    const unaffiliated = { name: 'Unaffiliated', students: [], studentIds: new Set() }
    // Every configured program shows up even with zero members.
    for (const p of programs) {
      const key = p.name.trim().toLowerCase()
      if (!affiliations.has(key)) affiliations.set(key, { name: p.name, program: p, students: [], tutors: [], studentIds: new Set() })
    }
    for (const s of students) {
      if (s.role === 'admin') continue
      const aff = (s.affiliation || '').trim()
      if (!aff) {
        if (s.role === 'tutor') { unaffiliated.tutors = unaffiliated.tutors || []; unaffiliated.tutors.push(s); continue }
        unaffiliated.students.push(s)
        unaffiliated.studentIds.add(s.id)
        continue
      }
      const key = aff.toLowerCase()
      if (!affiliations.has(key)) affiliations.set(key, { name: aff, program: null, students: [], tutors: [], studentIds: new Set() })
      if (s.role === 'tutor') { affiliations.get(key).tutors.push(s); continue }
      affiliations.get(key).students.push(s)
      affiliations.get(key).studentIds.add(s.id)
    }
    const result = []
    for (const [, group] of affiliations) {
      const groupAttempts = attempts.filter(a => group.studentIds.has(a.user_id))
      const totals = groupAttempts.map(a => Number(a.scores?.composite || a.scores?.total || 0)).filter(t => t > 0)
      const sorted = totals.slice().sort((a, b) => a - b)
      const avg = totals.length ? totals.reduce((s, v) => s + v, 0) / totals.length : null
      result.push({ name: group.name, program: group.program, tutors: group.tutors, studentCount: group.students.length, attemptCount: groupAttempts.length, avgScore: avg, median: sorted.length ? quantile(sorted, 0.5) : null, studentIds: group.studentIds })
    }
    result.sort((a, b) => b.studentCount - a.studentCount)
    if (unaffiliated.students.length > 0) {
      const groupAttempts = attempts.filter(a => unaffiliated.studentIds.has(a.user_id))
      const totals = groupAttempts.map(a => Number(a.scores?.composite || a.scores?.total || 0)).filter(t => t > 0)
      const sorted = totals.slice().sort((a, b) => a - b)
      const avg = totals.length ? totals.reduce((s, v) => s + v, 0) / totals.length : null
      result.push({ name: 'Unaffiliated', program: null, tutors: unaffiliated.tutors || [], studentCount: unaffiliated.students.length, attemptCount: groupAttempts.length, avgScore: avg, median: sorted.length ? quantile(sorted, 0.5) : null, studentIds: unaffiliated.studentIds, isUnaffiliated: true })
    }
    return result
  }, [students, attempts, programs])

  const affiliationNames = useMemo(() => affiliationData.map(a => a.name), [affiliationData])

  const filteredStudents = useMemo(() => {
    if (!affiliationFilter) return students
    if (affiliationFilter === '__unaffiliated__') return students.filter(s => !(s.affiliation || '').trim())
    const key = affiliationFilter.toLowerCase()
    return students.filter(s => (s.affiliation || '').toLowerCase() === key)
  }, [students, affiliationFilter])

  const filteredStudentIds = useMemo(() => new Set(filteredStudents.map(s => s.id)), [filteredStudents])

  const filteredAttempts = useMemo(() => {
    if (!affiliationFilter) return attempts
    return attempts.filter(a => filteredStudentIds.has(a.user_id))
  }, [attempts, affiliationFilter, filteredStudentIds])

  /* ── analytics ── */
  const analytics = useMemo(() => {
    const examMode = 'sat'
    const analyticsExamConfig = getExamConfig(examMode)
    const analyticsScoreColumns = getScoreColumnsForExam(examMode)
    const now = Date.now()
    const daysAgo = (n) => now - n * 24 * 60 * 60 * 1000
    const recent7 = daysAgo(7)
    const recent30 = daysAgo(30)

    const allAttempts = (filteredAttempts || []).filter((attempt) => getExamFromTestId(attempt?.test_id) === examMode)
    const totals = []
    const totalsPre = []
    const totalsExtra = []
    const totalsFinal = []
    const sectionBuckets = Object.fromEntries(
      analyticsScoreColumns.filter((column) => column.key !== 'total').map((column) => [column.key, []])
    )

    const byTest = new Map()
    const attemptsByDay = new Map()
    const completesByDay = new Map()
    const weakByDomain = new Map()
    const weakByChapter = new Map()
    const activeUsers7 = new Set()
    const activeUsers30 = new Set()

    const computeScaledFromAnswers = (attempt) => {
      try {
        const tid = normalizeTestId(attempt?.test_id)
        const keyBySection = getAnswerKeyBySection(tid) || (isPreTestId(tid) ? ANSWER_KEY : null)
        if (!keyBySection) return null
        const scaled = scoreAttemptFromKey(tid, attempt?.answers || {}, keyBySection)
        return scaled?.total ? scaled : null
      } catch { return null }
    }

    for (const a of allAttempts) {
      const tid = normalizeTestId(a.test_id)
      if (getExamFromTestId(tid) !== examMode) continue
      const sc = a.scores || {}
      let total = Number(sc.composite || sc.total || 0)
      const sectionValues = Object.fromEntries(
        analyticsScoreColumns.filter((column) => column.key !== 'total').map((column) => [column.key, Number(sc[column.key] || sc.sections?.[column.key] || 0)])
      )
      const started = new Date(a.started_at || a.completed_at || 0).getTime()

      if (a.answers && Object.keys(a.answers || {}).length && (!total || Object.values(sectionValues).some((value) => !value))) {
        const comp = computeScaledFromAnswers(a)
        if (comp) {
          if (!total) total = Number(comp.composite || comp.total || 0)
          for (const column of analyticsScoreColumns.filter((entry) => entry.key !== 'total')) {
            if (!sectionValues[column.key]) sectionValues[column.key] = Number(comp[column.key] || comp.sections?.[column.key] || 0)
          }
        }
      }

      if (started && started >= recent7) activeUsers7.add(a.user_id)
      if (started && started >= recent30) activeUsers30.add(a.user_id)

      if (total) {
        totals.push(total)
        for (const [key, value] of Object.entries(sectionValues)) { if (value) sectionBuckets[key].push(value) }
        if (isPreTestId(tid)) totalsPre.push(total)
        else if (tid === analyticsExamConfig.finalTestId || (examMode === 'sat' && tid === FINAL_TEST_ID)) totalsFinal.push(total)
        else totalsExtra.push(total)

        const row = byTest.get(tid) || { count: 0, totals: [], sections: Object.fromEntries(Object.keys(sectionBuckets).map((key) => [key, []])) }
        row.count += 1
        row.totals.push(total)
        for (const [key, value] of Object.entries(sectionValues)) { if (value) row.sections[key].push(value) }
        byTest.set(tid, row)
      }

      const dayStarted = toDayKey(a.started_at)
      const dayCompleted = toDayKey(a.completed_at)
      if (dayStarted) attemptsByDay.set(dayStarted, (attemptsByDay.get(dayStarted) || 0) + 1)
      if (dayCompleted) completesByDay.set(dayCompleted, (completesByDay.get(dayCompleted) || 0) + 1)

      const wt = computeAttemptWeakTopics(a)
      for (const t of wt) {
        const domain = t?.domain || 'Other'
        const ch = t?.ch || null
        const c = Number(t?.count || 0)
        if (c > 0) {
          weakByDomain.set(domain, (weakByDomain.get(domain) || 0) + c)
          if (ch) weakByChapter.set(ch, (weakByChapter.get(ch) || 0) + c)
        }
      }
    }

    const totalsSorted = totals.slice().sort((a, b) => a - b)
    const avg = (arr) => arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length) : null

    const summary = {
      exam: examMode,
      active7: activeUsers7.size,
      active30: activeUsers30.size,
      avgTotal: avg(totals),
      avgSections: Object.fromEntries(Object.entries(sectionBuckets).map(([key, values]) => [key, avg(values)])),
      median: quantile(totalsSorted, 0.5),
      p25: quantile(totalsSorted, 0.25),
      p75: quantile(totalsSorted, 0.75),
      avgPre: avg(totalsPre),
      avgExtra: avg(totalsExtra),
      avgFinal: avg(totalsFinal),
    }

    const testRows = Array.from(byTest.entries()).map(([id, row]) => {
      const totalsS = row.totals.slice().sort((a, b) => a - b)
      return {
        id, label: testLabel(id), count: row.count,
        avgTotal: avg(row.totals),
        avgSections: Object.fromEntries(Object.entries(row.sections || {}).map(([key, values]) => [key, avg(values)])),
        median: quantile(totalsS, 0.5),
      }
    }).sort((a, b) => (b.count - a.count) || String(a.label).localeCompare(String(b.label)))

    const topDomains = Array.from(weakByDomain.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)
    const topChapters = Array.from(weakByChapter.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10)

    const allDays = Array.from(new Set([...attemptsByDay.keys(), ...completesByDay.keys()])).sort()
    const activitySeries = {
      labels: allDays,
      datasets: [
        { label: 'Attempts started', data: allDays.map(d => attemptsByDay.get(d) || 0), borderColor: '#0284c7', backgroundColor: 'rgba(2,132,199,.08)', pointRadius: 2, tension: 0.25, fill: true },
        { label: 'Attempts completed', data: allDays.map(d => completesByDay.get(d) || 0), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.06)', pointRadius: 2, tension: 0.25, fill: true },
      ],
    }

    const histogram = (() => {
      const starts = [400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600]
      const counts = new Array(starts.length).fill(0)
      for (const t of totals) {
        const cl = clamp(t, 400, 1600)
        const idx = Math.min(starts.length - 1, Math.floor((cl - 400) / 100))
        counts[idx] += 1
      }
      return {
        labels: starts.map((start) => `${start}-${Math.min(1600, start + 99)}`),
        datasets: [{ label: 'Students', data: counts, backgroundColor: 'rgba(2,132,199,.7)', borderRadius: 6, borderSkipped: false }]
      }
    })()

    const byTestChart = {
      labels: testRows.map(r => r.label),
      datasets: [
        { label: 'Avg Total', data: testRows.map(r => (Number.isFinite(Number(r.avgTotal)) ? Math.round(r.avgTotal) : null)), backgroundColor: '#0c4a6e', borderRadius: 6, borderSkipped: false },
        ...analyticsScoreColumns.filter((column) => column.key !== 'total').map((column, index) => ({
          label: `Avg ${column.label}`,
          data: testRows.map((row) => (Number.isFinite(Number(row.avgSections?.[column.key])) ? Math.round(row.avgSections[column.key]) : null)),
          backgroundColor: ['#0ea5e9', '#f59e0b', '#8b5cf6', '#10b981'][index % 4],
          borderRadius: 6, borderSkipped: false,
        })),
      ],
    }

    const domainsChart = {
      labels: topDomains.map(([d]) => d),
      datasets: [{ label: 'Misses', data: topDomains.map(([, c]) => c), backgroundColor: topDomains.map((_, i) => ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#64748b'][i % 8]), borderRadius: 6, borderSkipped: false }]
    }

    const chaptersChart = {
      labels: topChapters.map(([ch]) => `Ch ${ch}`),
      datasets: [{ label: 'Misses', data: topChapters.map(([, c]) => c), backgroundColor: '#ef4444', borderRadius: 6, borderSkipped: false }]
    }

    return { summary, testRows, histogram, byTestChart, domainsChart, chaptersChart, activitySeries, topChapters, topDomains, scoreColumns: analyticsScoreColumns }
  }, [filteredAttempts, analyticsExam])

  /* ═══════════ RENDER ═══════════ */

  if (loading) return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam="sat" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, height: '100vh', color: '#565a63', fontFamily: 'Fraunces, Georgia, serif', fontSize: 14 }}>
        Loading...
      </div>
    </div>
  )

  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam="sat" />

      <div className="page fade-up">
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}
        >
          <div>
            <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 26, fontWeight: 600, color: '#16181d', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ ...iconBadge, width: 38, height: 38, borderRadius: 11, boxShadow: '0 1px 3px rgba(22,24,29,.06)' }}>
                <Icon name="admin" size={18} />
              </span>
              Admin Panel
            </h1>
            <p style={{ fontSize: 13, color: '#565a63', marginTop: 6, marginBottom: 0 }}>
              Manage students, tutors, and platform activity
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button style={actionBtn} onClick={() => runRegrade({ silent: false })} disabled={regrading}>
              {regrading ? 'Regrading...' : 'Regrade Attempts'}
            </button>
            <button style={actionBtn} onClick={resetMyData} disabled={resettingUserId === profile?.id}>
              {resettingUserId === profile?.id ? 'Resetting...' : 'Reset My Data'}
            </button>
          </div>
        </motion.div>

        {/* ── Summary stats row ── */}
        <motion.div {...fadeCard} transition={{ duration: 0.35, delay: 0.05 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}
        >
          {[
            { label: 'Total Registered', val: students.length, icon: 'students' },
            { label: 'Students', val: students.filter(s => s.role !== 'admin' && s.role !== 'tutor').length, icon: 'students' },
            { label: 'Tutors', val: students.filter(s => s.role === 'tutor').length, icon: 'students' },
            { label: 'Completed Tests', val: attempts.length, icon: 'check' },
            { label: 'Paired Records', val: pairs.length, icon: 'chart' },
            { label: 'Avg Improvement', val: avgImprovement !== null ? `+${avgImprovement} pts` : '\u2014', icon: 'trend', highlight: !!avgImprovement },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.06 * i }}
              style={{ ...statCard, ...(s.highlight ? { borderColor: 'rgba(16,185,129,.25)', background: 'rgba(16,185,129,.03)' } : {}) }}
            >
              <div style={statIconWrap}>
                <Icon name={s.icon} size={20} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#565a63', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px' }}>{s.label}</div>
                <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 600, color: '#16181d', marginTop: 2 }}>{s.val}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Tab navigation ── */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto',
          borderBottom: '1.5px solid rgba(2,132,199,.10)', paddingBottom: 0,
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              ...pillBtn(tab === t.id),
              border: 'none',
              borderBottom: `3px solid ${tab === t.id ? '#0284c7' : 'transparent'}`,
              borderRadius: '8px 8px 0 0',
              paddingBottom: 10,
              background: tab === t.id ? 'rgba(2,132,199,.06)' : 'transparent',
            }}>
              <Icon name={t.icon} size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Status message ── */}
        {resetMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              marginBottom: 16, fontSize: 13, fontWeight: 700, padding: '10px 16px', borderRadius: 10,
              background: resetMsg.toLowerCase().startsWith('success:') ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)',
              color: resetMsg.toLowerCase().startsWith('success:') ? '#059669' : '#dc2626',
              border: `1px solid ${resetMsg.toLowerCase().startsWith('success:') ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)'}`,
            }}
          >
            {resetMsg}
          </motion.div>
        )}

        {/* ══════════════════════════════
            TAB: Students
            ══════════════════════════════ */}
        {tab === 'students' && (
          <motion.div {...fadeCard} transition={{ duration: 0.3 }} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
              <h3 style={sectionHeading}>
                <span style={iconBadge}><Icon name="students" size={16} /></span>
                All Students
                <span style={{ fontSize: 12, color: '#8a8f98', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>({filteredStudents.length})</span>
              </h3>
              {affiliationNames.length > 0 && (
                <select
                  value={affiliationFilter}
                  onChange={(e) => setAffiliationFilter(e.target.value)}
                  style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px solid rgba(2,132,199,.15)', fontSize: 12, fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, background: '#fff', color: '#16181d', cursor: 'pointer' }}
                >
                  <option value="">All programs</option>
                  {affiliationData.filter(a => !a.isUnaffiliated).map((a) => (
                    <option key={a.name} value={a.name}>{a.name}</option>
                  ))}
                  {affiliationData.some(a => a.isUnaffiliated) && (
                    <option value="__unaffiliated__">Unaffiliated</option>
                  )}
                </select>
              )}
            </div>

            <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(2,132,199,.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Role', 'Program', 'Joined', 'Tests', 'Best Score', 'Actions'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => {
                    const userAttempts = computed.attemptsByUser.get(s.id) || []
                    const best = computed.bestByUser.get(s.id) || null
                    const isSelf = s.id === profile?.id
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(2,132,199,.06)', transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(2,132,199,.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#16181d' }}>
                          <Link to={`/dashboard?user=${encodeURIComponent(s.id)}`} style={{ color: '#16181d', textDecoration: 'none' }}>
                            {s.full_name || '\u2014'}
                          </Link>
                        </td>
                        <td style={{ ...tdStyle, color: '#565a63' }}>{s.email}</td>
                        <td style={tdStyle}>
                          {isSelf ? (
                            <span style={rolePill(s.role)}>{s.role}</span>
                          ) : (
                            <select
                              aria-label={`Role for ${s.email}`}
                              value={s.role}
                              disabled={savingProfileId === s.id}
                              onChange={(e) => changeUserRole(s, e.target.value)}
                              style={{ ...rolePill(s.role), border: '1.5px solid rgba(2,132,199,.15)', cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                              <option value="student">student</option>
                              <option value="tutor">tutor</option>
                              <option value="admin">admin</option>
                            </select>
                          )}
                        </td>
                        <td style={{ ...tdStyle, color: '#565a63' }}>
                          {s.role === 'admin' ? (
                            <span style={{ color: '#8a8f98' }}>All programs</span>
                          ) : !programsAvailable ? (
                            <span title="Run supabase-schema.sql to enable editing">{s.affiliation || '\u2014'}</span>
                          ) : (
                            <ProgramSelect
                              value={s.affiliation || ''}
                              onChange={(v) => changeUserProgram(s, v)}
                              programs={programs}
                              disabled={savingProfileId === s.id}
                              noneLabel="— none —"
                              style={{ padding: '5px 8px', borderRadius: 8, border: '1.5px solid rgba(2,132,199,.15)', fontSize: 12, background: '#fff', color: '#16181d', minWidth: 160, fontFamily: 'inherit' }}
                            />
                          )}
                        </td>
                        <td style={{ ...tdStyle, color: '#565a63' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{userAttempts.length}</td>
                        <td style={{ ...tdStyle, fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, color: '#16181d' }} title={best ? `${best.raw}/${best.totalQuestions} correct` : undefined}>
                          {best?.display || '\u2014'}
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                            <button style={{ ...actionBtn, padding: '5px 10px', opacity: resettingUserId === s.id ? 0.5 : 1 }}
                              disabled={resettingUserId === s.id} onClick={() => resetStudentData(s.id, s.email)}>
                              {resettingUserId === s.id ? 'Resetting...' : 'Reset'}
                            </button>
                            <Link to={`/dashboard?user=${encodeURIComponent(s.id)}`} style={{ ...actionBtn, padding: '5px 10px', textDecoration: 'none', display: 'inline-block' }}>
                              View
                            </Link>
                            <Link to={`/report?user=${encodeURIComponent(s.id)}`} style={{ ...actionBtn, padding: '5px 10px', textDecoration: 'none', display: 'inline-block' }}>
                              Report
                            </Link>
                            {!isSelf && (
                              <button style={{ ...actionBtnDanger, padding: '5px 10px' }}
                                disabled={resettingUserId === s.id} onClick={() => deleteStudentAccount(s.id, s.email)}>
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════
            TAB: Test Results
            ══════════════════════════════ */}
        {tab === 'results' && (
          <motion.div {...fadeCard} transition={{ duration: 0.3 }} style={cardStyle}>
            <h3 style={sectionHeading}>
              <span style={iconBadge}><Icon name="results" size={16} /></span>
              All Completed Tests
              <span style={{ fontSize: 12, color: '#8a8f98', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>({attempts.length})</span>
            </h3>

            <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(2,132,199,.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
                <thead>
                  <tr>
                    {['Student', 'Exam', 'Test', 'Date', 'Breakdown', 'Total', 'Post-Test', 'Gain', 'Top Weakness', 'Actions'].map((h, i) => (
                      <th key={i} style={thStyle}>{h === 'Actions' ? '' : h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attempts.map(a => {
                    const student = computed.studentById.get(a.user_id)
                    const post = computed.postByAttemptId.get(a.id)
                    const exam = getExamFromTestId(a.test_id)
                    const total = attemptTotalScore(a)
                    const gain = post ? post.post_score - total : null
                    return (
                      <tr key={a.id} style={{ borderBottom: '1px solid rgba(2,132,199,.06)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(2,132,199,.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#16181d' }}>
                          <Link to={`/dashboard?user=${encodeURIComponent(a.user_id)}`} style={{ color: '#16181d', textDecoration: 'none' }}>
                            {student?.full_name || 'Unknown'}
                          </Link>
                        </td>
                        <td style={tdStyle}><span style={examPill(exam)}>{exam.toUpperCase()}</span></td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#16181d' }}>{testLabel(a.test_id)}</td>
                        <td style={{ ...tdStyle, color: '#565a63' }}>{new Date(a.started_at).toLocaleDateString()}</td>
                        <td style={{ ...tdStyle, fontSize: 12, color: '#3f434b' }}>{formatAttemptBreakdown(a) || '\u2014'}</td>
                        <td style={{ ...tdStyle, fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 15, color: '#16181d' }}>{total || '\u2014'}</td>
                        <td style={{ ...tdStyle, fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, color: '#059669' }}>{post?.post_score || '\u2014'}</td>
                        <td style={{ ...tdStyle, fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, color: gain > 0 ? '#059669' : gain < 0 ? '#dc2626' : '#565a63' }}>
                          {gain !== null ? `${gain > 0 ? '+' : ''}${gain}` : '\u2014'}
                        </td>
                        <td style={{ ...tdStyle, fontSize: 12, color: '#3f434b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {formatTopWeakness(a)}
                        </td>
                        <td style={tdStyle}>
                          <Link to={`/results/${a.id}?user=${encodeURIComponent(a.user_id)}`} style={{ ...actionBtn, padding: '5px 10px', textDecoration: 'none', display: 'inline-block' }}>
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════
            TAB: Analytics
            ══════════════════════════════ */}
        {tab === 'analytics' && (
          <div style={{ display: 'grid', gap: 20 }}>
            {/* Exam toggle */}
            <motion.div {...fadeCard} transition={{ duration: 0.3 }} style={cardStyle}>
              <h3 style={sectionHeading}>
                <span style={iconBadge}><Icon name="chart" size={16} /></span>
                Program Analytics
              </h3>
              <p style={{ color: '#565a63', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Review completed SAT attempts across the program.
              </p>
            </motion.div>

            {/* KPI grid */}
            <motion.div {...fadeCard} transition={{ duration: 0.35, delay: 0.05 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 14 }}
            >
              {[
                { label: 'Active (7d)', val: analytics.summary.active7, sub: 'Students with a test this week', icon: 'activity' },
                { label: 'Active (30d)', val: analytics.summary.active30, sub: 'Students with a test this month', icon: 'calendar' },
                { label: 'Avg Total', val: analytics.summary.avgTotal ? Math.round(analytics.summary.avgTotal) : '\u2014', sub: 'Across all tests', icon: 'chart' },
                ...analytics.scoreColumns.filter((column) => column.key !== 'total').slice(0, 3).map((column, index) => ({
                  label: `Avg ${column.label}`,
                  val: analytics.summary.avgSections?.[column.key] ? Math.round(analytics.summary.avgSections[column.key]) : '\u2014',
                  sub: 'Section average',
                  icon: index === 0 ? 'guide' : index === 1 ? 'math' : 'results',
                })),
                { label: 'Median', val: analytics.summary.median ? Math.round(analytics.summary.median) : '\u2014', sub: 'Total score', icon: 'target' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.04 * i }} style={statCard}>
                  <div style={statIconWrap}><Icon name={s.icon} size={20} /></div>
                  <div>
                    <div style={{ fontSize: 11, color: '#565a63', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px' }}>{s.label}</div>
                    <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 600, color: '#16181d', marginTop: 2 }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: '#8a8f98', marginTop: 1 }}>{s.sub}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Activity over time */}
            <motion.div {...fadeCard} transition={{ duration: 0.3, delay: 0.1 }} style={cardStyle}>
              <h3 style={sectionHeading}>
                <span style={iconBadge}><Icon name="calendar" size={16} /></span>
                Activity Over Time
              </h3>
              <div style={{ height: 220 }}>
                <Line data={analytics.activitySeries} options={lineOpts()} />
              </div>
            </motion.div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
              <motion.div {...fadeCard} transition={{ duration: 0.3, delay: 0.12 }} style={cardStyle}>
                <h3 style={sectionHeading}>
                  <span style={iconBadge}><Icon name="chart" size={16} /></span>
                  Score Distribution
                </h3>
                <div style={{ height: 220 }}>
                  <Bar data={analytics.histogram} options={barOpts({ legend: false })} />
                </div>
              </motion.div>

              <motion.div {...fadeCard} transition={{ duration: 0.3, delay: 0.14 }} style={cardStyle}>
                <h3 style={sectionHeading}>
                  <span style={iconBadge}><Icon name="final" size={16} /></span>
                  Averages by Test
                </h3>
                <div style={{ height: 220 }}>
                  <Bar data={analytics.byTestChart} options={barOpts({ yMin: 200, yMax: 1600 })} />
                </div>
              </motion.div>
            </div>

            {/* Weakness charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
              <motion.div {...fadeCard} transition={{ duration: 0.3, delay: 0.16 }} style={cardStyle}>
                <h3 style={sectionHeading}>
                  <span style={iconBadge}><Icon name="warning" size={16} /></span>
                  Most Missed Domains
                </h3>
                <div style={{ height: 240 }}>
                  <Bar data={analytics.domainsChart} options={barOpts({ legend: false })} />
                </div>
              </motion.div>

              <motion.div {...fadeCard} transition={{ duration: 0.3, delay: 0.18 }} style={cardStyle}>
                <h3 style={sectionHeading}>
                  <span style={iconBadge}><Icon name="guide" size={16} /></span>
                  Most Missed Chapters
                </h3>
                <div style={{ height: 240 }}>
                  <Bar data={analytics.chaptersChart} options={barOpts({ legend: false })} />
                </div>
              </motion.div>
            </div>

            {/* Test summary table */}
            <motion.div {...fadeCard} transition={{ duration: 0.3, delay: 0.2 }} style={cardStyle}>
              <h3 style={sectionHeading}>
                <span style={iconBadge}><Icon name="results" size={16} /></span>
                Test Summary
              </h3>
              <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(2,132,199,.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Test', 'Attempts', 'Avg Total', 'Median', ...analytics.scoreColumns.filter((column) => column.key !== 'total').map((column) => `Avg ${column.label}`)].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.testRows.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(2,132,199,.06)' }}>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#16181d' }}>{r.label}</td>
                        <td style={tdStyle}>{r.count}</td>
                        <td style={{ ...tdStyle, fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}>{r.avgTotal ? Math.round(r.avgTotal) : '\u2014'}</td>
                        <td style={tdStyle}>{r.median ? Math.round(r.median) : '\u2014'}</td>
                        {analytics.scoreColumns.filter((column) => column.key !== 'total').map((column) => (
                          <td key={`${r.id}-${column.key}`} style={tdStyle}>
                            {r.avgSections?.[column.key] ? Math.round(r.avgSections[column.key]) : '\u2014'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

        {/* ══════════════════════════════
            TAB: Affiliations
            ══════════════════════════════ */}
        {tab === 'affiliations' && (
          <div style={{ display: 'grid', gap: 20 }}>
            {/* Program management: this is where tutor logins get scoped */}
            <motion.div {...fadeCard} transition={{ duration: 0.3 }} style={cardStyle}>
              <h3 style={sectionHeading}>
                <span style={iconBadge}><Icon name="students" size={16} /></span>
                Programs &amp; tutor access
              </h3>
              <p style={{ fontSize: 13, color: '#565a63', margin: '0 0 16px', lineHeight: 1.6 }}>
                Students pick a program when they sign up. Each tutor login is attached to one program and can only see that program's students; this admin account sees everyone.
                To give someone tutor access: have them sign up normally, then on the <strong>Students</strong> tab set their Role to <strong>tutor</strong> and pick their Program.
              </p>
              {!programsAvailable ? (
                <div style={{ fontSize: 13, color: '#b45309', background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 10, padding: '10px 14px' }}>
                  The <code>programs</code> table isn't installed yet. Run <code>supabase-schema.sql</code> in the Supabase SQL Editor to enable the program list.
                </div>
              ) : (
                <>
                  <form onSubmit={addProgram} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    <input
                      aria-label="New program name"
                      value={newProgramName}
                      onChange={(e) => setNewProgramName(e.target.value)}
                      placeholder="New program name (e.g. CitySquash)"
                      maxLength={100}
                      style={{ flex: '1 1 260px', padding: '8px 12px', borderRadius: 9, border: '1.5px solid rgba(2,132,199,.15)', fontSize: 13, background: '#fff', color: '#16181d' }}
                    />
                    <button type="submit" style={actionBtn} disabled={programBusy || !newProgramName.trim()}>
                      {programBusy ? 'Saving...' : 'Add program'}
                    </button>
                  </form>
                  <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(2,132,199,.08)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                      <thead>
                        <tr>
                          {['Program', 'Students', 'Tutors', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {programs.length === 0 && (
                          <tr><td colSpan={4} style={{ ...tdStyle, color: '#8a8f98', textAlign: 'center' }}>No programs yet. Add one above.</td></tr>
                        )}
                        {programs.map((p) => {
                          const group = affiliationData.find(a => !a.isUnaffiliated && a.name.trim().toLowerCase() === p.name.trim().toLowerCase())
                          const tutors = group?.tutors || []
                          const memberCount = (group?.studentCount || 0) + tutors.length
                          return (
                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(2,132,199,.06)' }}>
                              <td style={{ ...tdStyle, fontWeight: 700, color: '#16181d' }}>{p.name}</td>
                              <td style={tdStyle}>
                                <button type="button" style={{ ...actionBtn, padding: '4px 10px' }} onClick={() => { setAffiliationFilter(p.name); setTab('students') }}>
                                  {group?.studentCount || 0} · view
                                </button>
                              </td>
                              <td style={{ ...tdStyle, color: '#565a63' }}>
                                {tutors.length === 0
                                  ? <span style={{ color: '#b45309' }}>No tutor yet</span>
                                  : tutors.map(t => <div key={t.id}>{t.full_name || t.email}{t.full_name ? <span style={{ color: '#8a8f98' }}> · {t.email}</span> : null}</div>)}
                              </td>
                              <td style={tdStyle}>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  <button type="button" style={{ ...actionBtn, padding: '5px 10px' }} disabled={programBusy} onClick={() => renameProgram(p)}>Rename</button>
                                  <button type="button" style={{ ...actionBtnDanger, padding: '5px 10px', opacity: memberCount > 0 ? 0.5 : 1 }} disabled={programBusy || memberCount > 0}
                                    title={memberCount > 0 ? 'Move its students and tutors to another program first' : undefined}
                                    onClick={() => deleteProgram(p, memberCount)}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </motion.div>

            {affiliationData.length === 0 ? (
              <motion.div {...fadeCard} transition={{ duration: 0.3 }} style={{ ...cardStyle, textAlign: 'center', padding: 48, color: '#565a63' }}>
                No students have joined a program yet.
              </motion.div>
            ) : (
              <>
                {/* Comparison chart */}
                <motion.div {...fadeCard} transition={{ duration: 0.3 }} style={cardStyle}>
                  <h3 style={sectionHeading}>
                    <span style={iconBadge}><Icon name="students" size={16} /></span>
                    Program Comparison
                  </h3>
                  <div style={{ height: 260 }}>
                    <Bar
                      data={{
                        labels: affiliationData.map(a => a.name),
                        datasets: [
                          { label: 'Students', data: affiliationData.map(a => a.studentCount), backgroundColor: '#0284c7', borderRadius: 6, borderSkipped: false },
                          { label: 'Test Attempts', data: affiliationData.map(a => a.attemptCount), backgroundColor: '#10b981', borderRadius: 6, borderSkipped: false },
                        ],
                      }}
                      options={barOpts()}
                    />
                  </div>
                </motion.div>

                {/* Average score chart */}
                {affiliationData.some(a => a.avgScore) && (
                  <motion.div {...fadeCard} transition={{ duration: 0.3, delay: 0.05 }} style={cardStyle}>
                    <h3 style={sectionHeading}>
                      <span style={iconBadge}><Icon name="chart" size={16} /></span>
                      Average Score by Program
                    </h3>
                    <div style={{ height: 260 }}>
                      <Bar
                        data={{
                          labels: affiliationData.filter(a => a.avgScore).map(a => a.name),
                          datasets: [{
                            label: 'Avg Score',
                            data: affiliationData.filter(a => a.avgScore).map(a => Math.round(a.avgScore)),
                            backgroundColor: affiliationData.filter(a => a.avgScore).map((_, i) => ['#0c4a6e', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#ef4444'][i % 8]),
                            borderRadius: 6, borderSkipped: false,
                          }],
                        }}
                        options={barOpts({ legend: false })}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Per-affiliation cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {affiliationData.map((aff, i) => (
                    <motion.div key={aff.name}
                      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.04 * i }}
                      style={{ ...cardStyle, cursor: 'pointer', marginBottom: 0, borderLeft: aff.isUnaffiliated ? '3px solid #8a8f98' : `3px solid #0284c7` }}
                      onClick={() => { setAffiliationFilter(aff.isUnaffiliated ? '__unaffiliated__' : aff.name); setTab('students') }}
                    >
                      <h4 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#16181d', margin: '0 0 14px 0' }}>{aff.name}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {[
                          { label: 'Students', val: aff.studentCount },
                          { label: 'Tests', val: aff.attemptCount },
                          { label: 'Avg Score', val: aff.avgScore ? Math.round(aff.avgScore) : '\u2014' },
                        ].map(stat => (
                          <div key={stat.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: '#565a63', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 600, color: '#16181d', fontFamily: 'Fraunces, Georgia, serif' }}>{stat.val}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 10, fontSize: 11, color: '#8a8f98', textAlign: 'center' }}>
                        {aff.median ? `Median: ${Math.round(aff.median)}` : ''} {'\u00b7'} Click to filter
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════
            TAB: Proof of Impact
            ══════════════════════════════ */}
        {tab === 'impact' && (
          <div style={{ display: 'grid', gap: 20 }}>
            {pairs.length < 2 ? (
              <motion.div {...fadeCard} transition={{ duration: 0.3 }} style={{ ...cardStyle, textAlign: 'center', padding: '56px 28px' }}>
                <div style={{ marginBottom: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 54, height: 54, borderRadius: 12, background: 'rgba(2,132,199,.08)', color: '#0284c7' }}>
                  <Icon name="clock" size={28} />
                </div>
                <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#3f434b', marginBottom: 6, fontSize: 16, fontWeight: 600 }}>Need at least 2 paired records</h3>
                <p style={{ color: '#565a63', fontSize: 13, margin: 0 }}>Currently {pairs.length} student(s) with both pre and post scores. Add post-test scores in the database to generate the impact report.</p>
              </motion.div>
            ) : (
              <>
                {/* Pre vs Post chart */}
                <motion.div {...fadeCard} transition={{ duration: 0.3 }} style={cardStyle}>
                  <h3 style={sectionHeading}>
                    <span style={iconBadge}><Icon name="chart" size={16} /></span>
                    Score Comparison: Pre vs Post
                  </h3>
                  <div style={{ height: 260 }}>
                    <Bar data={chartData} options={barOpts({ yMin: Math.min(...pairs.map(p => Math.min(p.pre, p.post))) - 50, yMax: Math.max(...pairs.map(p => Math.max(p.pre, p.post))) + 50 })} />
                  </div>
                </motion.div>

                {/* Point Gain chart */}
                <motion.div {...fadeCard} transition={{ duration: 0.3, delay: 0.05 }} style={cardStyle}>
                  <h3 style={sectionHeading}>
                    <span style={iconBadge}><Icon name="trend" size={16} /></span>
                    Point Gain Per Student
                  </h3>
                  <div style={{ height: 180 }}>
                    <Bar data={gainData} options={barOpts({ legend: false })} />
                  </div>
                </motion.div>

                {/* T-test stats */}
                <motion.div {...fadeCard} transition={{ duration: 0.3, delay: 0.1 }} style={cardStyle}>
                  <h3 style={sectionHeading}>
                    <span style={iconBadge}><Icon name="math" size={16} /></span>
                    Paired T-Test Statistics
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                    {stats && [
                      { l: 'Sample (n)', v: stats.n },
                      { l: 'Mean Gain', v: `${stats.mean.toFixed(1)} pts` },
                      { l: 'Std Deviation', v: stats.sd.toFixed(1) },
                      { l: 'Std Error', v: stats.se.toFixed(1) },
                      { l: 'T-Statistic', v: stats.t.toFixed(3) },
                      { l: 'Degrees of Freedom', v: stats.df },
                      { l: 'P-Value (two-tailed)', v: stats.pLabel },
                      { l: "Cohen's d", v: stats.d.toFixed(2) },
                    ].map(s => (
                      <div key={s.l} style={{ background: 'rgba(2,132,199,.04)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(2,132,199,.08)' }}>
                        <div style={{ fontSize: 10, color: '#565a63', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 4 }}>{s.l}</div>
                        <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontSize: 15, color: '#16181d' }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  {stats && (
                    <div style={{ marginTop: 14, fontSize: 13, color: '#3f434b', background: 'rgba(2,132,199,.04)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(2,132,199,.08)' }}>
                      95% Confidence Interval: [{stats.lo >= 0 ? '+' : ''}{stats.lo.toFixed(0)}, {stats.hi >= 0 ? '+' : ''}{stats.hi.toFixed(0)}] points improvement
                    </div>
                  )}
                </motion.div>

                {/* Proof box */}
                {stats && (
                  <motion.div {...fadeCard} transition={{ duration: 0.3, delay: 0.15 }} className="proof-box">
                    {stats.sig ? (
                      <>
                        <div className="proof-verified">Proof of Impact -- Statistically Verified</div>
                        <div className="proof-statement">
                          "Our students improved by an average of {Math.round(stats.mean)} points."
                        </div>
                        <div style={{ fontSize: 15, opacity: .9, marginBottom: 16 }}>
                          "There is a {stats.conf} probability this improvement was caused by our program, not chance ({stats.pLabel})."
                        </div>
                        <div className="proof-stats">
                          Cohen's d = {stats.d.toFixed(2)} ({stats.d > 0.8 ? 'Large' : stats.d > 0.5 ? 'Medium' : 'Small'} effect size) {'\u00b7'}
                          CI{'\u2089\u2085'}: [{stats.lo >= 0 ? '+' : ''}{stats.lo.toFixed(0)}, {stats.hi >= 0 ? '+' : ''}{stats.hi.toFixed(0)}] {'\u00b7'}
                          n = {stats.n} students {'\u00b7'}
                          t({stats.df}) = {stats.t.toFixed(3)}, {stats.pLabel}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>More data needed</div>
                        <div style={{ fontSize: 14, opacity: .8 }}>
                          With n={stats.n} students, the result has not yet reached statistical significance ({stats.pLabel}).
                          Continue collecting post-test scores to build the evidence base.
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </>
            )}

            {/* Optional practice proof */}
            {pairsOpt.length < 2 ? (
              <motion.div {...fadeCard} transition={{ duration: 0.3, delay: 0.2 }} style={{ ...cardStyle, textAlign: 'center', padding: '44px 28px' }}>
                <div style={{ marginBottom: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 12, background: 'rgba(2,132,199,.08)', color: '#0284c7' }}>
                  <Icon name="refresh" size={24} />
                </div>
                <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#3f434b', marginBottom: 6, fontSize: 16, fontWeight: 600 }}>Optional practice proof needs more data</h3>
                <p style={{ color: '#565a63', fontSize: 13, margin: 0 }}>Currently {pairsOpt.length} student(s) have both a pre-test score and at least one optional test score.</p>
              </motion.div>
            ) : (
              <>
                <motion.div {...fadeCard} transition={{ duration: 0.3, delay: 0.2 }} style={cardStyle}>
                  <h3 style={sectionHeading}>
                    <span style={iconBadge}><Icon name="chart" size={16} /></span>
                    Score Comparison: Pre vs Best Optional
                  </h3>
                  <div style={{ height: 260 }}>
                    <Bar data={chartDataOpt} options={barOpts({ yMin: Math.min(...pairsOpt.map(p => Math.min(p.pre, p.post))) - 50, yMax: Math.max(...pairsOpt.map(p => Math.max(p.pre, p.post))) + 50 })} />
                  </div>
                </motion.div>

                <motion.div {...fadeCard} transition={{ duration: 0.3, delay: 0.25 }} style={cardStyle}>
                  <h3 style={sectionHeading}>
                    <span style={iconBadge}><Icon name="trend" size={16} /></span>
                    Point Gain Per Student (Optional)
                  </h3>
                  <div style={{ height: 180 }}>
                    <Bar data={gainDataOpt} options={barOpts({ legend: false })} />
                  </div>
                </motion.div>

                <motion.div {...fadeCard} transition={{ duration: 0.3, delay: 0.3 }} style={cardStyle}>
                  <h3 style={sectionHeading}>
                    <span style={iconBadge}><Icon name="math" size={16} /></span>
                    Paired T-Test (Optional)
                  </h3>
                  {statsOpt && (
                    <div style={{ fontSize: 13, color: '#3f434b', lineHeight: 1.7 }}>
                      n={statsOpt.n} {'\u00b7'} mean gain {statsOpt.mean.toFixed(1)} {'\u00b7'} {statsOpt.pLabel} {'\u00b7'} Cohen's d {statsOpt.d.toFixed(2)} {'\u00b7'} avg gain {avgImprovementOpt} points
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════
            TAB: Tests
            ══════════════════════════════ */}
        {tab === 'tests' && (
          <motion.div {...fadeCard} transition={{ duration: 0.3 }} style={cardStyle}>
            <h3 style={sectionHeading}>
              <span style={iconBadge}><Icon name="test" size={16} /></span>
              Test Setup
            </h3>
            <p style={{ fontSize: 13, color: '#565a63', lineHeight: 1.6, margin: '0 0 18px 0' }}>
              Answer keys live on this site; the tests themselves are linked from the official College Board practice-test PDFs.
            </p>

            <div style={{ display: 'grid', gap: 12 }}>
              {TESTS.map((t, idx) => {
                const builtIn = getAnswerKeyBySection(t.id)
                const stored = keysByTest?.[t.id] || null
                const bundledPdf = (!builtIn && !stored && t.akUrl) ? 'Bundled AK PDF (auto)' : null
                const builtInCount = countKey(builtIn)
                const storedCount = countKey(stored)
                return (
                  <motion.div key={t.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.03 * idx }}
                    style={{ border: '1.5px solid rgba(2,132,199,.10)', borderRadius: 12, padding: '16px 18px', background: '#fff' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#16181d', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontFamily: 'Fraunces, Georgia, serif', fontSize: 14 }}>
                          <span>{t.label}</span>
                          <span style={examPill(t.exam || 'sat')}>{(t.exam || 'sat').toUpperCase()}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#8a8f98', marginTop: 5 }}>
                          Answer key: {builtIn
                            ? `Built-in (${builtInCount} answers)`
                            : (stored ? `Loaded (${storedCount} answers)` : (bundledPdf || 'Not set'))}
                          {stored && builtIn && storedCount !== builtInCount && (
                            <span style={{ marginLeft: 8, color: '#dc2626', fontWeight: 600 }}>(DB has {storedCount})</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {t.akUrl && (
                          <a style={{ ...actionBtn, textDecoration: 'none', display: 'inline-block' }} href={t.akUrl} target="_blank" rel="noreferrer">
                            {t.explanationUrl ? 'AK + Explanations' : 'Open AK'}
                          </a>
                        )}
                        {builtIn && storedCount > 0 && storedCount !== builtInCount && (
                          <button style={actionBtn} disabled={testKeyStatus.loading}
                            onClick={async () => {
                              setTestKeyStatus({ loading: true, msg: `Fixing ${t.label} answer key to ${builtInCount}...` })
                              try {
                                const up = await supabase.from('test_answer_keys').upsert({ test_id: t.id, answer_key: builtIn, updated_at: new Date().toISOString() })
                                if (up.error) throw up.error
                                setKeysByTest(prev => ({ ...(prev || {}), [t.id]: builtIn }))
                                setTestKeyStatus({ loading: false, msg: `Success: fixed ${t.label} (${builtInCount} answers)` })
                              } catch (e) {
                                setTestKeyStatus({ loading: false, msg: `Error: ${e?.message || 'Could not fix key'}` })
                              }
                            }}
                          >
                            Fix to {builtInCount}
                          </button>
                        )}
                        {t.akUrl && (
                          <button style={actionBtn} disabled={testKeyStatus.loading}
                            onClick={async () => {
                              setTestKeyStatus({ loading: true, msg: `Importing ${t.label} answer key...` })
                              try {
                                const toSave = getAnswerKeyBySection(t.id)
                                if (!toSave) throw new Error('No built-in answer key for this test.')
                                const up = await supabase.from('test_answer_keys').upsert({ test_id: t.id, answer_key: toSave, updated_at: new Date().toISOString() })
                                if (up.error) throw up.error
                                setKeysByTest(prev => ({ ...(prev || {}), [t.id]: toSave }))
                                setTestKeyStatus({ loading: false, msg: `Success: imported ${t.label} (${countKey(toSave)} answers)` })
                              } catch (e) {
                                const msg = String(e?.message || 'Import failed')
                                const hint = msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('not authorized')
                                  ? ' (Tip: run the Supabase schema + make sure your account has role=admin in profiles.)'
                                  : ''
                                setTestKeyStatus({ loading: false, msg: `Error: ${msg}${hint}` })
                              }
                            }}
                          >
                            Import bundled AK
                          </button>
                        )}
                        <a style={{ ...actionBtn, textDecoration: 'none', display: 'inline-block' }} href={t.cbUrl} target="_blank" rel="noreferrer">
                          Open on College Board
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {testKeyStatus.msg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{
                  marginTop: 14, fontSize: 12, fontWeight: 700, padding: '10px 16px', borderRadius: 10,
                  background: testKeyStatus.msg.toLowerCase().startsWith('success:') ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)',
                  color: testKeyStatus.msg.toLowerCase().startsWith('success:') ? '#059669' : '#dc2626',
                  border: `1px solid ${testKeyStatus.msg.toLowerCase().startsWith('success:') ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)'}`,
                }}
              >
                {testKeyStatus.loading ? 'Working: ' : ''}{testKeyStatus.msg}
              </motion.div>
            )}

            <div style={{ marginTop: 14, fontSize: 12, color: '#565a63' }}>
              Final Test page: <Link to="/final" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>Open</Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
