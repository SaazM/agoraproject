import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { loadSatTestDate, saveSatTestDate, loadStudyPrefs, saveStudyPrefs, dayLabels, defaultStudyPrefs, UPCOMING_TEST_DATES } from '../lib/studyPlan.js'
import { getExamConfigForTest } from '../data/examData.js'
import Icon from '../components/AppIcons.jsx'

export default function SetupPlan() {
  const { attemptId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id

  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [testDate, setTestDate] = useState('')
  const [prefs, setPrefs] = useState(null)

  const exam = attempt ? getExamConfigForTest(attempt.test_id).exam : null
  const examConfig = attempt ? getExamConfigForTest(attempt.test_id) : null

  // Load attempt
  useEffect(() => {
    if (!supabase || !userId || !attemptId) return
    let cancelled = false
    supabase.from('test_attempts').select('*').eq('id', attemptId).eq('user_id', userId).single()
      .then(({ data }) => {
        if (cancelled) return
        if (!data || !data.completed_at) {
          navigate('/dashboard', { replace: true })
          return
        }
        setAttempt(data)
        const ex = getExamConfigForTest(data.test_id).exam
        setTestDate(loadSatTestDate(userId, ex))
        setPrefs(loadStudyPrefs(userId, ex))
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) navigate('/dashboard', { replace: true })
      })
    return () => { cancelled = true }
  }, [attemptId, userId, navigate])

  function handleContinue() {
    navigate(`/results/${attemptId}`)
  }

  if (loading || !attempt || !exam) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#565a63', fontFamily: 'Fraunces, Georgia, serif' }}>
        Loading…
      </div>
    )
  }

  const days = prefs?.days || defaultStudyPrefs(exam).days
  const anyDaySelected = days.some(Boolean)

  return (
    <div style={{ minHeight: '100vh', background: '#16181d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 560, background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(22,24,29,.06)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '36px 32px 24px', background: '#faf9f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Icon name="calendar" size={22} />
            </div>
            <div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 600, color: '#16181d' }}>
                Set Up Your Study Plan
              </div>
              <div style={{ fontSize: 13, color: '#565a63', marginTop: 2 }}>
                One quick step before your results
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 32px 36px' }}>
          {/* Test Date */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontFamily: 'Fraunces, Georgia, serif', fontSize: 14, fontWeight: 600, color: '#16181d', marginBottom: 8 }}>
              When is your {examConfig.label} test?
            </label>
            <div style={{ fontSize: 13, color: '#565a63', lineHeight: 1.6, marginBottom: 12 }}>
              Enter your official or estimated test date. We'll build a personalized day-by-day plan to get you ready.
            </div>
            <input
              type="date"
              value={testDate}
              onChange={(e) => {
                const value = e.target.value
                setTestDate(value)
                saveSatTestDate(userId, value, exam)
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #cbd5e1',
                borderRadius: 12,
                fontSize: 15,
                background: 'white',
                boxSizing: 'border-box',
                color: '#16181d',
              }}
            />
            {(() => {
              const dates = UPCOMING_TEST_DATES[exam] || []
              const today = new Date().toISOString().slice(0, 10)
              const future = dates.filter(d => d.date >= today)
              if (!future.length) return null
              return (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: '#8a8f98', marginBottom: 6, fontWeight: 700 }}>
                    Upcoming official {examConfig.label} dates:
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {future.map(d => (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => {
                          setTestDate(d.date)
                          saveSatTestDate(userId, d.date, exam)
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 800,
                          border: testDate === d.date ? '2px solid #0284c7' : '1.5px solid #e4e0d5',
                          borderRadius: 8,
                          background: testDate === d.date ? 'rgba(2,132,199,.10)' : 'white',
                          color: testDate === d.date ? '#0284c7' : '#565a63',
                          cursor: 'pointer',
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Available Days */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 14, fontWeight: 600, color: '#16181d', marginBottom: 8 }}>
              Which days can you study?
            </div>
            <div style={{ fontSize: 13, color: '#565a63', lineHeight: 1.6, marginBottom: 12 }}>
              Select the days you're available each week. Your schedule adapts automatically if you miss a day.
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {dayLabels().map((d, i) => {
                const enabled = !!days[i]
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      const next = { ...(prefs || defaultStudyPrefs(exam)) }
                      next.days = [...days]
                      next.days[i] = !next.days[i]
                      setPrefs(next)
                      try { saveStudyPrefs(userId, next, exam) } catch {}
                    }}
                    style={{
                      flex: '1 1 0',
                      minWidth: 56,
                      padding: '12px 6px',
                      fontSize: 13,
                      fontWeight: 800,
                      border: enabled ? '2px solid #0284c7' : '1.5px solid #e4e0d5',
                      borderRadius: 12,
                      background: enabled ? 'rgba(2,132,199,.10)' : 'white',
                      color: enabled ? '#0284c7' : '#8a8f98',
                      cursor: 'pointer',
                      transition: 'all .15s',
                    }}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Continue Button */}
          <button
            className="btn btn-primary"
            onClick={handleContinue}
            disabled={!testDate || !anyDaySelected}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: 16,
              fontWeight: 800,
              borderRadius: 12,
              opacity: (!testDate || !anyDaySelected) ? 0.5 : 1,
            }}
          >
            See My Results →
          </button>

          {(!testDate || !anyDaySelected) && (
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: '#8a8f98' }}>
              {!testDate ? 'Pick a test date to continue' : 'Select at least one study day'}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
