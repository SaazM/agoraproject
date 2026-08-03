import { useState, useMemo } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth.jsx'
import Icon from '../components/AppIcons.jsx'
import { getInitialPreferredExam } from '../lib/examChoice.js'
import { getExamConfig, getChaptersForExam } from '../data/examData.js'
import { setUnlockedResources } from '../lib/pretestGate.js'
import { supabase } from '../lib/supabase.js'

const sf = 'Fraunces, Georgia, serif'

const SAT_SECTIONS = [
  { key: 'rw', label: 'Reading & Writing', min: 200, max: 800, placeholder: '200–800' },
  { key: 'math', label: 'Math', min: 200, max: 800, placeholder: '200–800' },
]

const BENEFITS = [
  'Identifies your exact weak topics so your study plan targets what matters most',
  'Unlocks all study resources — guide chapters, practice questions, and mistake tracking',
  'Gives you a true baseline score to measure real improvement over time',
  'Takes the same time as a real test so you build stamina and pacing skills',
]

export default function PriorScore() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const requestedExam = new URLSearchParams(location.search).get('exam')
  const exam = requestedExam === 'sat' ? requestedExam : getInitialPreferredExam(user)
  const examConfig = useMemo(() => getExamConfig(exam), [exam])
  const userId = user?.id

  const [mode, setMode] = useState(null) // null = choosing, 'enter' = entering score, 'skip' = taking pretest
  const [inputMode, setInputMode] = useState('total') // 'total' or 'sections'
  const [totalScore, setTotalScore] = useState('')
  const [sectionScores, setSectionScores] = useState({})
  const [saving, setSaving] = useState(false)

  if (profile?.role === 'tutor') return <Navigate to="/tutor" replace />
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />

  const sections = SAT_SECTIONS
  const totalMin = 400
  const totalMax = 1600
  const totalLabel = 'Total Score (400–1600)'

  function isValidTotal(val) {
    const n = Number(val)
    return val !== '' && !isNaN(n) && n >= totalMin && n <= totalMax
  }

  function isValidSections() {
    return sections.every(s => {
      const val = sectionScores[s.key]
      const n = Number(val)
      return val !== '' && val !== undefined && !isNaN(n) && n >= s.min && n <= s.max
    })
  }

  const canSubmit = inputMode === 'total' ? isValidTotal(totalScore) : isValidSections()

  async function handleSubmitScore() {
    if (!canSubmit || saving) return
    setSaving(true)

    // Build score object
    const scores = {}
    if (inputMode === 'total') {
      scores.total = Number(totalScore)
      // Estimate section scores from total
      scores.rw = Math.round(scores.total / 2 / 10) * 10
      scores.math = scores.total - scores.rw
    } else {
      for (const s of sections) {
        scores[s.key] = Number(sectionScores[s.key])
      }
      scores.total = sections.reduce((sum, s) => sum + Number(sectionScores[s.key] || 0), 0)
    }

    // Build weak_topics = ALL chapters (since we have no real answers, assume everything needs study)
    const allChapters = getChaptersForExam(exam)
    const weakTopics = Object.entries(allChapters || {}).map(([ch, meta]) => ({
      ch,
      count: 5, // high count so every chapter gets priority
      name: meta?.name || ch,
      domain: meta?.domain || '',
    }))

    // Create a real test_attempt with the pre-test ID so it unlocks resources & populates tiles
    const nowIso = new Date().toISOString()
    try {
      if (supabase && userId) {
        const { error: insertError } = await supabase.from('test_attempts').insert({
          user_id: userId,
          test_id: examConfig.preTestId,
          started_at: nowIso,
          completed_at: nowIso,
          scores: { ...scores, source: 'prior_score' },
          weak_topics: weakTopics,
          answers: {},
        })
        if (insertError) {
          console.error('[PriorScore] Failed to save:', insertError.message)
          setSaving(false)
          return
        }

        // Unlock resources immediately
        setUnlockedResources(userId, exam, true)
      }
    } catch (e) {
      console.error('[PriorScore] Failed to save:', e?.message)
      setSaving(false)
      return
    }

    setSaving(false)
    navigate(`/dashboard?exam=${exam}`, { replace: true })
  }

  function handleSkipToPretest() {
    navigate(`/dashboard?exam=${exam}`, { replace: true })
  }

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
        style={{ width: '100%', maxWidth: 640 }}
      >
        {/* Dark header */}
        <div style={{
          background: '#16181d',
          borderRadius: '12px 12px 0 0',
          padding: '36px 36px 28px',
          borderBottom: '2px solid rgba(2,132,199,.25)',
        }}>
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
              <Icon name="results" size={28} style={{ color: 'white' }} />
            </div>
            <div>
              <div style={{ fontFamily: sf, fontSize: 24, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.3px' }}>
                Have you taken the {examConfig.label} before?
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', marginTop: 4, lineHeight: 1.5 }}>
                If you have a past score, you can enter it below. Either way, we strongly recommend taking our pre-test.
              </div>
            </div>
          </div>
        </div>

        {/* White body */}
        <div style={{
          background: 'white',
          borderRadius: '0 0 12px 12px',
          padding: '28px 36px 40px',
          boxShadow: '0 1px 3px rgba(22,24,29,.06)',
        }}>

          {/* ── Recommendation banner ── */}
          <div style={{
            background: 'rgba(16,185,129,.07)',
            border: '1.5px solid rgba(16,185,129,.2)',
            borderRadius: 12,
            padding: '20px 22px',
            marginBottom: 24,
          }}>
            <div style={{
              fontFamily: sf, fontSize: 15, fontWeight: 600, color: '#065f46',
              marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Icon name="sparkle" size={18} style={{ color: '#059669' }} />
              We highly recommend taking the pre-test on AGORA
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {BENEFITS.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#3f434b', lineHeight: 1.6 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: '#059669', color: 'white',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 900, flexShrink: 0, marginTop: 1,
                  }}>
                    &#10003;
                  </span>
                  {b}
                </div>
              ))}
            </div>
          </div>

          {/* ── Choice buttons (initial state) ── */}
          {mode === null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSkipToPretest}
                style={{
                  width: '100%',
                  padding: '18px 22px',
                  fontSize: 16, fontWeight: 600, fontFamily: sf,
                  border: 'none', borderRadius: 12,
                  background: '#0284c7',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  letterSpacing: '-0.2px',
                }}
              >
                <Icon name="test" size={20} style={{ color: 'white' }} />
                Take the Pre-Test (Recommended)
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setMode('enter')}
                style={{
                  width: '100%',
                  padding: '16px 22px',
                  fontSize: 15, fontWeight: 700, fontFamily: sf,
                  border: '2px solid #e4e0d5', borderRadius: 12,
                  background: '#faf9f6',
                  color: '#3f434b',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}
              >
                <Icon name="results" size={18} />
                I have a past {examConfig.label} score to enter
              </motion.button>

              <button
                onClick={handleSkipToPretest}
                style={{
                  background: 'none', border: 'none',
                  fontSize: 13, color: '#8a8f98', cursor: 'pointer',
                  fontFamily: sf, fontWeight: 600,
                  padding: '8px 0', textAlign: 'center',
                }}
              >
                Skip for now &rarr;
              </button>
            </div>
          )}

          {/* ── Score entry form ── */}
          {mode === 'enter' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Important note */}
              <div style={{
                background: 'rgba(2,132,199,.06)',
                border: '1.5px solid rgba(2,132,199,.18)',
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 22,
                fontSize: 13, color: '#0c4a6e', lineHeight: 1.6,
              }}>
                <strong>How it works:</strong> Your past score will appear on your dashboard and unlock all study resources. Since we don't have your answers, your study plan will cover every topic to make sure nothing is missed. Taking the AGORA pre-test later will refine your plan to focus only on your weak areas.
              </div>

              {/* Toggle: total vs sections */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                {[
                  { id: 'total', label: 'Overall Score' },
                  { id: 'sections', label: 'Score by Section' },
                ].map(opt => {
                  const active = inputMode === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setInputMode(opt.id)}
                      style={{
                        flex: 1, padding: '10px 0',
                        fontSize: 13, fontWeight: 600, fontFamily: sf,
                        borderRadius: 10, cursor: 'pointer',
                        border: active ? '2px solid #0284c7' : '1.5px solid #e4e0d5',
                        background: active ? 'rgba(2,132,199,.08)' : 'white',
                        color: active ? '#0284c7' : '#565a63',
                        transition: 'all .2s',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {/* Total score input */}
              {inputMode === 'total' && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    display: 'block', fontFamily: sf, fontSize: 14,
                    fontWeight: 600, color: '#16181d', marginBottom: 8,
                  }}>
                    {totalLabel}
                  </label>
                  <input
                    type="number"
                    value={totalScore}
                    onChange={e => setTotalScore(e.target.value)}
                    min={totalMin}
                    max={totalMax}
                    placeholder={`${totalMin}–${totalMax}`}
                    style={{
                      width: '100%', padding: '14px 16px',
                      border: '2px solid #cbd5e1', borderRadius: 12,
                      fontSize: 18, fontWeight: 600, fontFamily: sf,
                      background: 'white', boxSizing: 'border-box',
                      color: '#16181d', textAlign: 'center',
                    }}
                  />
                </div>
              )}

              {/* Section score inputs */}
              {inputMode === 'sections' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  {sections.map(s => (
                    <div key={s.key}>
                      <label style={{
                        display: 'block', fontFamily: sf, fontSize: 12,
                        fontWeight: 600, color: '#16181d', marginBottom: 6,
                      }}>
                        {s.label}
                      </label>
                      <input
                        type="number"
                        value={sectionScores[s.key] || ''}
                        onChange={e => setSectionScores(prev => ({ ...prev, [s.key]: e.target.value }))}
                        min={s.min}
                        max={s.max}
                        placeholder={s.placeholder}
                        style={{
                          width: '100%', padding: '12px 14px',
                          border: '2px solid #cbd5e1', borderRadius: 12,
                          fontSize: 16, fontWeight: 600, fontFamily: sf,
                          background: 'white', boxSizing: 'border-box',
                          color: '#16181d', textAlign: 'center',
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Computed total for section mode */}
              {inputMode === 'sections' && isValidSections() && (
                <div style={{
                  textAlign: 'center', marginBottom: 20,
                  fontFamily: sf, fontSize: 14, fontWeight: 700, color: '#0284c7',
                }}>
                  {`Total: ${sections.reduce((sum, s) => sum + Number(sectionScores[s.key] || 0), 0)}`}
                </div>
              )}

              {/* Submit & back buttons */}
              <motion.button
                onClick={handleSubmitScore}
                disabled={!canSubmit || saving}
                whileHover={canSubmit ? { scale: 1.02 } : {}}
                whileTap={canSubmit ? { scale: 0.98 } : {}}
                style={{
                  width: '100%', padding: '16px 24px',
                  fontSize: 16, fontWeight: 600, fontFamily: sf,
                  border: 'none', borderRadius: 12,
                  background: canSubmit ? '#0284c7' : '#e4e0d5',
                  color: canSubmit ? 'white' : '#8a8f98',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  boxShadow: canSubmit ? '0 1px 3px rgba(22,24,29,.06)' : 'none',
                  transition: 'all .3s',
                  marginBottom: 10,
                }}
              >
                {saving ? 'Saving...' : 'Save Score & Continue'}
              </motion.button>

              <button
                onClick={() => setMode(null)}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  fontSize: 13, color: '#8a8f98', cursor: 'pointer',
                  fontFamily: sf, fontWeight: 600, padding: '8px 0',
                  textAlign: 'center',
                }}
              >
                &larr; Go back
              </button>
            </motion.div>
          )}

          {/* Helper text */}
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#8a8f98', lineHeight: 1.6 }}>
            {mode === 'enter'
              ? 'Your score will populate your dashboard tiles and unlock all resources. Your study plan will cover all topics.'
              : 'You can always enter a past score later from your dashboard.'}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
