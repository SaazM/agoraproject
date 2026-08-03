import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Icon from '../components/AppIcons.jsx'
import { getInitialPreferredExam } from '../lib/examChoice.js'
import { getTestsForExam, getExamFromTestId, normalizeTestId } from '../data/tests.js'
import { getExamConfig } from '../data/examData.js'
import { resolveViewContext, withExam, withViewUser } from '../lib/viewAs.js'
import { hasUnlockedResources } from '../lib/pretestGate.js'
import { supabase } from '../lib/supabase.js'

export default function ExtraTests() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const requestedExam = useMemo(() => String(new URLSearchParams(location.search).get('exam') || '').toLowerCase(), [location.search])
  const exam = requestedExam === 'sat' ? requestedExam : getInitialPreferredExam(user)
  const examConfig = useMemo(() => getExamConfig(exam), [exam])
  const examTests = useMemo(() => getTestsForExam(exam), [exam])
  const { viewUserId, isAdminPreview } = useMemo(
    () => resolveViewContext({ userId: user?.id, profile, search: location.search }),
    [user?.id, profile, location.search]
  )
  const readOnlyView = isAdminPreview

  const [loading, setLoading] = useState(true)
  const [attempts, setAttempts] = useState([])
  const [startingTest, setStartingTest] = useState(null)
  const [confirmTestId, setConfirmTestId] = useState(null)

  const extraTests = useMemo(() => examTests.filter(t => t.kind === 'extra'), [examTests])
  const hasTakenPretest = useMemo(() => {
    return attempts.some(a =>
      (a.completed_at || a.scores?.total || a.scores?.composite) &&
      normalizeTestId(a.test_id) === examConfig.preTestId
    )
  }, [attempts, examConfig.preTestId])

  useEffect(() => {
    if (!viewUserId || !supabase) { setLoading(false); return }
    let cancelled = false
    supabase
      .from('test_attempts')
      .select('id, test_id, completed_at, scores, current_module')
      .eq('user_id', viewUserId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) {
          setAttempts((data || []).filter(a => getExamFromTestId(a.test_id) === exam))
          setLoading(false)
        }
      })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [viewUserId, exam])

  const completed = useMemo(() => attempts.filter(a => a.completed_at || a.scores?.total), [attempts])
  const inProgress = useMemo(() => attempts.filter(a => !a.completed_at && !a.scores?.total && a.current_module), [attempts])
  const completedExtra = completed.filter(a => extraTests.some(t => t.id === a.test_id))

  const viewHref = (path) => withViewUser(withExam(path, exam), viewUserId, isAdminPreview)

  async function startNewTest(testId) {
    if (readOnlyView || startingTest || !supabase || !user?.id) return
    setStartingTest(testId)
    try {
      const existing = await supabase
        .from('test_attempts')
        .select('id')
        .eq('user_id', user.id)
        .eq('test_id', testId)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
      if (existing.data?.length) {
        navigate(`/test/${existing.data[0].id}`)
        return
      }
      const { data, error } = await supabase
        .from('test_attempts')
        .insert({ user_id: user.id, test_id: testId })
        .select('id')
        .single()
      if (error) throw error
      navigate(`/test/${data.id}`)
    } catch (err) {
      console.error('Failed to start test:', err)
      setStartingTest(null)
    }
  }

  if (loading) {
    return (
      <div className="app-layout has-sidebar">
        <Sidebar currentExam={exam} />
        <div className="page fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ color: '#8a8f98', fontSize: 15, fontWeight: 500 }}>Loading...</div>
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
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ marginBottom: 28 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: '#16181d',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(22,24,29,.06)',
              }}
            >
              <Icon name="test" size={22} style={{ color: '#fff' }} />
            </motion.div>
            <div>
              <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontWeight: 600, fontSize: 26, color: '#16181d', margin: 0, lineHeight: 1.2 }}>
                Extra Tests
              </h1>
              <div style={{ fontSize: 13, color: '#565a63', marginTop: 4, lineHeight: 1.6 }}>
                Optional {examConfig.label} practice tests to reinforce weak topics and track your improvement over time.
              </div>
            </div>
          </div>
        </motion.div>

        {!hasTakenPretest ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              maxWidth: 520, margin: '40px auto', textAlign: 'center',
              padding: '48px 32px', borderRadius: 12,
              background: '#fff', border: '1.5px solid rgba(2,132,199,.15)',
              boxShadow: '0 1px 3px rgba(22,24,29,.06)',
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 12,
              background: '#d97706',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(22,24,29,.06)', marginBottom: 16,
            }}>
              <Icon name="lock" size={28} style={{ color: '#fff' }} />
            </div>
            <div style={{ fontFamily: "Fraunces, Georgia, serif", fontWeight: 600, fontSize: 18, color: '#16181d', marginBottom: 8 }}>
              Complete your Pre Test first
            </div>
            <div style={{ color: '#565a63', fontSize: 14, lineHeight: 1.7 }}>
              Take the {examConfig.label} Pre Test to unlock extra practice tests.
              They'll help you target weak areas and measure your progress.
            </div>
            <button
              onClick={() => navigate(viewHref('/dashboard'))}
              style={{
                marginTop: 20, padding: '10px 24px', borderRadius: 12, border: 'none',
                background: '#0284c7',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(22,24,29,.06)',
              }}
            >
              Go to Dashboard
            </button>
          </motion.div>
        ) : (
          <>
            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              style={{
                display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20,
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 14px', borderRadius: 12,
                background: 'rgba(2,132,199,.08)', color: '#0284c7',
                fontSize: 12, fontWeight: 600,
              }}>
                {extraTests.length} test{extraTests.length !== 1 ? 's' : ''} available
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 14px', borderRadius: 12,
                background: completedExtra.length > 0 ? 'rgba(16,185,129,.08)' : 'rgba(138,143,152,.08)',
                color: completedExtra.length > 0 ? '#047857' : '#565a63',
                fontSize: 12, fontWeight: 600,
              }}>
                {completedExtra.length}/{extraTests.length} completed
              </span>
            </motion.div>

            {/* Test grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {extraTests.map((t, i) => {
                const done = completed.some(a => a.test_id === t.id)
                const prog = inProgress.find(a => a.test_id === t.id)
                const isConfirming = confirmTestId === t.id
                const isStarting = startingTest === t.id

                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    style={{
                      background: '#fff',
                      borderRadius: 12,
                      border: done ? '1.5px solid rgba(16,185,129,.25)' : '1.5px solid rgba(2,132,199,.12)',
                      padding: '24px',
                      boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                      transition: 'all .2s ease',
                      display: 'flex', flexDirection: 'column', gap: 14,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(22,24,29,.06)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(22,24,29,.06)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12,
                          background: done
                            ? '#10b981'
                            : '#16181d',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Icon name={done ? 'check' : 'test'} size={20} style={{ color: '#fff' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 16, color: '#16181d', lineHeight: 1.3 }}>
                            {t.label}
                          </div>
                          <div style={{ fontSize: 12, color: '#8a8f98', fontWeight: 600, marginTop: 2 }}>
                            {examConfig.label} &middot; Full timed test
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                        background: done ? 'rgba(16,185,129,.1)' : prog ? 'rgba(245,158,11,.1)' : 'rgba(138,143,152,.06)',
                        color: done ? '#10b981' : prog ? '#f59e0b' : '#8a8f98',
                        whiteSpace: 'nowrap',
                      }}>
                        {done ? 'COMPLETED' : prog ? 'IN PROGRESS' : 'OPTIONAL'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 'auto' }}>
                      {prog ? (
                        <button
                          onClick={() => navigate(`/test/${prog.id}`)}
                          disabled={readOnlyView}
                          style={{
                            padding: '10px 20px', borderRadius: 12, border: 'none',
                            background: '#d97706',
                            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                          }}
                        >
                          Resume →
                        </button>
                      ) : !done ? (
                        <>
                          <button
                            onClick={() => setConfirmTestId(isConfirming ? null : t.id)}
                            disabled={readOnlyView || isStarting}
                            style={{
                              padding: '10px 20px', borderRadius: 12, border: 'none',
                              background: '#0284c7',
                              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                              boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                              opacity: readOnlyView ? 0.5 : 1,
                            }}
                          >
                            {isStarting ? 'Starting...' : 'Start Test →'}
                          </button>
                        </>
                      ) : null}
                      {done && (
                        <button
                          onClick={() => {
                            const last = completed.find(a => a.test_id === t.id)
                            if (last) navigate(viewHref(`/results/${last.id}`))
                          }}
                          style={{
                            padding: '10px 20px', borderRadius: 12,
                            border: '1.5px solid rgba(2,132,199,.2)',
                            background: '#fff', color: '#0284c7',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          View Results →
                        </button>
                      )}
                      {!done && !prog && (
                        <a
                          href={t.cbUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '10px 16px', borderRadius: 12,
                            border: '1.5px solid rgba(138,143,152,.2)',
                            background: '#fff', color: '#565a63',
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
                          }}
                        >
                          <Icon name="eye" size={14} /> View on College Board ↗
                        </a>
                      )}
                    </div>

                    {isConfirming && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.25 }}
                        style={{
                          background: 'rgba(2,132,199,.04)',
                          border: '1px solid rgba(2,132,199,.12)',
                          borderRadius: 12, padding: 14,
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#16181d', marginBottom: 6, fontSize: 14 }}>
                          Start this test now?
                        </div>
                        <div style={{ fontSize: 13, color: '#565a63', lineHeight: 1.6 }}>
                          This is a full timed {examConfig.label} test. Once you start, your timer runs. You can pause and resume later.
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                          <button
                            onClick={() => setConfirmTestId(null)}
                            style={{
                              padding: '8px 16px', borderRadius: 10,
                              border: '1.5px solid #e4e0d5', background: '#fff',
                              color: '#3f434b', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => { setConfirmTestId(null); startNewTest(t.id) }}
                            disabled={isStarting}
                            style={{
                              padding: '8px 16px', borderRadius: 10, border: 'none',
                              background: '#0284c7',
                              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                              boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                            }}
                          >
                            {isStarting ? 'Starting...' : 'Start'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {extraTests.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '48px 32px', borderRadius: 12,
                background: '#fff', border: '1.5px dashed rgba(138,143,152,.2)',
                color: '#565a63', fontSize: 14, lineHeight: 1.7,
              }}>
                No extra tests available for {examConfig.label} yet.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
