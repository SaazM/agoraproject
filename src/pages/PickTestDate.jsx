import { useState, useMemo } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth.jsx'
import Icon from '../components/AppIcons.jsx'
import { getInitialPreferredExam } from '../lib/examChoice.js'
import { getExamConfig } from '../data/examData.js'
import { saveSatTestDate, UPCOMING_TEST_DATES } from '../lib/studyPlan.js'

const sf = 'Fraunces, Georgia, serif'

export default function PickTestDate() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const requestedExam = new URLSearchParams(location.search).get('exam')
  const exam = requestedExam === 'sat' ? requestedExam : getInitialPreferredExam(user)
  const examConfig = useMemo(() => getExamConfig(exam), [exam])
  const userId = user?.id

  const [testDate, setTestDate] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)

  if (profile?.role === 'tutor') return <Navigate to="/tutor" replace />
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />

  const today = new Date().toISOString().slice(0, 10)
  const futureDates = (UPCOMING_TEST_DATES[exam] || []).filter(d => d.date >= today)

  function handleSelect(date) {
    setTestDate(date)
    saveSatTestDate(userId, date, exam)
  }

  function handleContinue() {
    if (testDate) saveSatTestDate(userId, testDate, exam)
    navigate(`/prior-score?exam=${exam}`, { replace: true })
  }

  const isCustomDate = testDate && !futureDates.some(d => d.date === testDate)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#16181d',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [.22, 1, .36, 1] }}
        style={{ width: '100%', maxWidth: 620 }}
      >
        {/* ── Dark header card ── */}
        <div style={{
          background: '#16181d',
          borderRadius: '12px 12px 0 0',
          padding: '36px 36px 30px',
          borderBottom: '2px solid rgba(2,132,199,.25)',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <img src="/logo.png" alt="" width={36} height={36} style={{ borderRadius: 8 }} />
            <span style={{ fontFamily: sf, fontSize: 19, fontWeight: 600, color: 'white' }}>
              The Agora <span style={{ color: '#f59e0b' }}>Project</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 12,
              background: '#0284c7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(22,24,29,.06)',
              flexShrink: 0,
            }}>
              <Icon name="calendar" size={28} style={{ color: 'white' }} />
            </div>
            <div>
              <div style={{ fontFamily: sf, fontSize: 26, fontWeight: 600, color: 'white', letterSpacing: '-0.3px' }}>
                When are you taking the {examConfig.label}?
              </div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', marginTop: 5, lineHeight: 1.5 }}>
                This powers your personalized study plan countdown.
              </div>
            </div>
          </div>
        </div>

        {/* ── White body card ── */}
        <div style={{
          background: 'white',
          borderRadius: '0 0 12px 12px',
          padding: '28px 36px 40px',
          boxShadow: '0 1px 3px rgba(22,24,29,.06)',
        }}>
          {/* Upcoming official dates */}
          {futureDates.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontFamily: sf, fontSize: 14, fontWeight: 600, color: '#16181d',
                marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(2,132,199,.12)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="calendar" size={14} style={{ color: '#0284c7' }} />
                </span>
                Upcoming official {examConfig.label} test dates
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                {futureDates.map(d => {
                  const selected = testDate === d.date
                  return (
                    <motion.button
                      key={d.date}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSelect(d.date)}
                      style={{
                        padding: '16px 14px',
                        fontSize: 15,
                        fontWeight: 600,
                        fontFamily: sf,
                        border: selected ? '2.5px solid #0284c7' : '2px solid #e4e0d5',
                        borderRadius: 12,
                        background: selected
                          ? 'rgba(2,132,199,.08)'
                          : '#faf9f6',
                        color: selected ? '#0284c7' : '#1e293b',
                        cursor: 'pointer',
                        transition: 'all .2s ease',
                        textAlign: 'center',
                        position: 'relative',
                        boxShadow: selected
                          ? '0 1px 3px rgba(22,24,29,.06)'
                          : '0 2px 6px rgba(0,0,0,.04)',
                      }}
                    >
                      {selected && (
                        <span style={{
                          position: 'absolute', top: -6, right: -6,
                          width: 22, height: 22, borderRadius: 11,
                          background: '#0284c7',
                          color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 900,
                          boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                        }}>
                          &#10003;
                        </span>
                      )}
                      {d.label}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, marginTop: 4 }}>
            <div style={{ flex: 1, height: 1.5, background: 'linear-gradient(90deg, transparent, #e4e0d5, transparent)' }} />
            <span style={{ fontSize: 12, color: '#8a8f98', fontWeight: 800, letterSpacing: '1px' }}>OR</span>
            <div style={{ flex: 1, height: 1.5, background: 'linear-gradient(90deg, transparent, #e4e0d5, transparent)' }} />
          </div>

          {/* Custom date picker */}
          <div style={{ marginBottom: 30 }}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowCalendar(!showCalendar)}
              style={{
                width: '100%',
                padding: '16px 18px',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: sf,
                border: isCustomDate ? '2.5px solid #0284c7' : '2px solid #e4e0d5',
                borderRadius: 12,
                background: isCustomDate ? 'rgba(2,132,199,.06)' : '#faf9f6',
                color: '#1e293b',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all .2s ease',
                boxShadow: isCustomDate ? '0 1px 3px rgba(22,24,29,.06)' : '0 2px 6px rgba(0,0,0,.04)',
              }}
            >
              <Icon name="calendar" size={18} />
              {isCustomDate
                ? `Custom date: ${new Date(testDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                : 'Choose a different date'}
            </motion.button>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden', marginTop: 10 }}
              >
                <input
                  type="date"
                  value={testDate}
                  min={today}
                  onChange={(e) => handleSelect(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #cbd5e1',
                    borderRadius: 12,
                    fontSize: 15,
                    background: 'white',
                    boxSizing: 'border-box',
                    color: '#16181d',
                    fontFamily: sf,
                  }}
                />
              </motion.div>
            )}
          </div>

          {/* Continue button */}
          <motion.button
            onClick={handleContinue}
            disabled={!testDate}
            whileHover={testDate ? { scale: 1.02 } : {}}
            whileTap={testDate ? { scale: 0.98 } : {}}
            style={{
              width: '100%',
              padding: '18px 24px',
              fontSize: 17,
              fontWeight: 600,
              fontFamily: sf,
              border: 'none',
              borderRadius: 12,
              background: testDate
                ? '#0284c7'
                : '#e4e0d5',
              color: testDate ? 'white' : '#8a8f98',
              cursor: testDate ? 'pointer' : 'not-allowed',
              boxShadow: testDate ? '0 1px 3px rgba(22,24,29,.06)' : 'none',
              transition: 'all .3s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              letterSpacing: '-0.2px',
            }}
          >
            Continue to Dashboard
            <span style={{ fontSize: 20 }}>&rarr;</span>
          </motion.button>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#8a8f98', lineHeight: 1.5 }}>
            You can change this anytime from your Calendar page.
          </div>
        </div>
      </motion.div>
    </div>
  )
}
