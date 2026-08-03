import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../components/AppIcons.jsx'

const sf = 'Fraunces, Georgia, serif'

/* ─── Animation variants ─────────────────────────────── */

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.95 }),
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
}

/* ─── Shared helpers ─────────────────────────────────── */

function StepBadge({ number, active }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 12,
      background: active ? '#0284c7' : '#e4e0d5',
      color: active ? 'white' : '#8a8f98',
      fontSize: 15, fontWeight: 600, fontFamily: sf,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all .3s ease',
      boxShadow: active ? '0 1px 3px rgba(22,24,29,.06)' : 'none',
    }}>
      {number}
    </div>
  )
}

function MockWindow({ label, children }) {
  return (
    <motion.div
      variants={fadeUp}
      style={{
        background: 'white',
        border: '1.5px solid rgba(2,132,199,.15)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(22,24,29,.06)',
      }}
    >
      <div style={{
        padding: '8px 16px',
        background: '#faf9f6',
        borderBottom: '1px solid rgba(2,132,199,.1)',
        fontSize: 12, fontWeight: 700, color: '#565a63',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ display: 'flex', gap: 5 }}>
          {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
            <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'inline-block' }} />
          ))}
        </span>
        {label}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </motion.div>
  )
}

function StatBox({ label, value, sub, color }) {
  return (
    <motion.div
      variants={fadeUp}
      style={{
        flex: '1 1 0', minWidth: 100, textAlign: 'center',
        background: 'white', borderRadius: 12,
        border: '1.5px solid rgba(2,132,199,.12)',
        padding: '14px 10px',
        boxShadow: '0 1px 3px rgba(22,24,29,.06)',
      }}
    >
      <div style={{ fontSize: 11, color: '#8a8f98', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color: color || '#16181d', fontFamily: sf, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#8a8f98', marginTop: 1 }}>{sub}</div>}
    </motion.div>
  )
}

/* ─── Step content components ────────────────────────── */

function StepDashboard() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: sf, fontSize: 24, fontWeight: 600, color: '#16181d', margin: '0 0 6px' }}>Your Dashboard</h3>
        <p style={{ fontSize: 15, color: '#565a63', margin: 0, lineHeight: 1.7 }}>
          Your home base shows key stats at a glance. Track your best score, number of completed tests, and current study streak.
        </p>
      </motion.div>

      <MockWindow label="Dashboard">
        {/* Hero mockup */}
        <motion.div variants={fadeUp} style={{
          background: '#16181d',
          borderRadius: 12, padding: '18px 20px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.png" alt="" style={{ width: 28, height: 28 }} />
          </div>
          <div>
            <div style={{ fontFamily: sf, fontSize: 16, fontWeight: 600, color: 'white' }}>The Agora Project</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>Built for speed, focus, and results</div>
          </div>
        </motion.div>

        {/* Score overview mockup */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <StatBox label="Best Score" value="1310" sub="All-time high" />
          <StatBox label="Highest Test" value="1280" sub="Practice 2" />
          <StatBox label="Most Recent" value="1310" sub="Mar 23" />
        </motion.div>

        {/* Resource cards mockup */}
        <motion.div variants={fadeUp}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#565a63', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>Resources</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[
              { label: 'Study Guide', color: '#0284c7', icon: 'guide' },
              { label: 'Strategies', color: '#166534', icon: 'target' },
              { label: 'Practice', color: '#84cc16', icon: 'star' },
              { label: 'Extra Tests', color: '#0284c7', icon: 'test' },
              { label: 'Mistakes', color: '#f59e0b', icon: 'mistakes' },
              { label: 'Report', color: '#8b5cf6', icon: 'chart' },
              { label: 'Journey', color: '#06b6d4', icon: 'calendar' },
              { label: 'Colleges', color: '#16181d', icon: 'students' },
              { label: 'Compare', color: '#dc2626', icon: 'results' },
            ].map(r => (
              <div key={r.label} style={{
                padding: '10px 8px', borderRadius: 8,
                background: '#f7f5ef', border: '1px solid #e4e0d5',
                textAlign: 'center',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: `${r.color}18`, margin: '0 auto 4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={r.icon} size={12} style={{ color: r.color }} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#16181d' }}>{r.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </MockWindow>

      <motion.div variants={fadeUp} style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(2,132,199,.06)', borderRadius: 12, border: '1px solid rgba(2,132,199,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="home" size={15} style={{ color: 'white' }} />
          </div>
          <p style={{ fontSize: 14, color: '#3f434b', margin: 0, lineHeight: 1.7 }}>
            Your dashboard updates in real time as you take tests and study. Every score improvement is tracked automatically.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StepStudyGuide() {
  const chapters = [
    { ch: 'Chapter 1: Algebra Basics', pct: 100, done: true },
    { ch: 'Chapter 2: Geometry', pct: 65, done: false },
    { ch: 'Chapter 3: Data Analysis', pct: 20, done: false },
    { ch: 'Chapter 4: Advanced Math', pct: 0, done: false },
  ]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: sf, fontSize: 24, fontWeight: 600, color: '#16181d', margin: '0 0 6px' }}>Study Guide</h3>
        <p style={{ fontSize: 15, color: '#565a63', margin: 0, lineHeight: 1.7 }}>
          Work through chapters organized by topic. Each chapter includes lessons and practice questions tailored to what you need to learn.
        </p>
      </motion.div>

      <MockWindow label="Study Guide — SAT Math">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {chapters.map((c, i) => (
            <motion.div key={c.ch} variants={fadeUp} custom={i} style={{
              background: 'white', borderRadius: 12,
              border: c.done ? '1.5px solid rgba(16,185,129,.25)' : '1.5px solid rgba(2,132,199,.1)',
              padding: '14px 16px',
              transition: 'all .2s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9,
                    background: c.done ? 'linear-gradient(135deg, #10b981, #059669)' : '#0284c7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 13, fontWeight: 800,
                  }}>
                    {c.done ? '\u2713' : i + 1}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#16181d' }}>{c.ch}</span>
                </div>
                {c.done
                  ? <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,.08)', padding: '3px 10px', borderRadius: 6 }}>COMPLETE</span>
                  : <span style={{ fontSize: 11, fontWeight: 700, color: '#565a63' }}>{c.pct}%</span>
                }
              </div>
              <div style={{ height: 6, background: '#f3f0e9', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${c.pct}%`,
                  background: c.done ? 'linear-gradient(90deg, #10b981, #059669)' : '#0284c7',
                  borderRadius: 99, transition: 'width .6s ease',
                }} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </MockWindow>

      <motion.div variants={fadeUp} style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(2,132,199,.06)', borderRadius: 12, border: '1px solid rgba(2,132,199,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="guide" size={15} style={{ color: 'white' }} />
          </div>
          <p style={{ fontSize: 14, color: '#3f434b', margin: 0, lineHeight: 1.7 }}>
            Chapters are prioritized based on your weak areas. Complete them at your own pace to build mastery before test day.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StepJourney() {
  const steps = [
    { label: 'Take Pre-Test', status: 'done', icon: '\u2713' },
    { label: 'Review Results', status: 'done', icon: '\u2713' },
    { label: 'Study Weak Areas', status: 'active', icon: '3' },
    { label: 'Practice Test', status: 'upcoming', icon: '4' },
    { label: 'Final Review', status: 'upcoming', icon: '5' },
  ]

  const statusColors = {
    done: { bg: 'linear-gradient(135deg, #10b981, #059669)', border: 'rgba(16,185,129,.25)', text: '#10b981', barColor: '#10b981' },
    active: { bg: '#0284c7', border: 'rgba(2,132,199,.3)', text: '#0284c7', barColor: '#0284c7' },
    upcoming: { bg: '#e4e0d5', border: 'rgba(203,213,225,.5)', text: '#8a8f98', barColor: '#e4e0d5' },
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: sf, fontSize: 24, fontWeight: 600, color: '#16181d', margin: '0 0 6px' }}>Smart Journey</h3>
        <p style={{ fontSize: 15, color: '#565a63', margin: 0, lineHeight: 1.7 }}>
          Follow a guided path from your first pre-test through mastery. Each step unlocks the next as you progress.
        </p>
      </motion.div>

      <MockWindow label="Your Learning Journey">
        <div style={{ padding: '10px 0' }}>
          {steps.map((step, i) => {
            const colors = statusColors[step.status]
            const isLast = i === steps.length - 1
            return (
              <motion.div key={step.label} variants={fadeUp} custom={i} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                {/* Timeline line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: colors.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: step.status === 'upcoming' ? '#8a8f98' : 'white',
                    fontSize: 15, fontWeight: 800,
                    boxShadow: step.status === 'active' ? '0 1px 3px rgba(22,24,29,.06)' : 'none',
                    border: step.status === 'active' ? '2px solid rgba(2,132,199,.2)' : 'none',
                  }}>
                    {step.icon}
                  </div>
                  {!isLast && (
                    <div style={{
                      width: 3, flex: 1, minHeight: 20,
                      background: colors.barColor,
                      borderRadius: 99,
                      margin: '4px 0',
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{
                  flex: 1,
                  paddingBottom: isLast ? 0 : 20,
                  paddingTop: 8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 15, fontWeight: 700,
                      color: step.status === 'upcoming' ? '#8a8f98' : '#16181d',
                    }}>
                      {step.label}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 800,
                      padding: '3px 10px', borderRadius: 6,
                      color: colors.text,
                      background: step.status === 'done' ? 'rgba(16,185,129,.08)' : step.status === 'active' ? 'rgba(2,132,199,.08)' : 'rgba(138,143,152,.08)',
                      textTransform: 'uppercase',
                    }}>
                      {step.status === 'done' ? 'Complete' : step.status === 'active' ? 'In Progress' : 'Locked'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </MockWindow>

      <motion.div variants={fadeUp} style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(2,132,199,.06)', borderRadius: 12, border: '1px solid rgba(2,132,199,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="target" size={15} style={{ color: 'white' }} />
          </div>
          <p style={{ fontSize: 14, color: '#3f434b', margin: 0, lineHeight: 1.7 }}>
            The journey adapts to your performance. Complete each step to unlock the next, and watch your progress grow.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StepPractice() {
  const [selected, setSelected] = useState(null)
  const choices = [
    { letter: 'A', text: 'x = 3' },
    { letter: 'B', text: 'x = 4' },
    { letter: 'C', text: 'x = 5' },
    { letter: 'D', text: 'x = 6' },
  ]
  const correctAnswer = 'B'

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: sf, fontSize: 24, fontWeight: 600, color: '#16181d', margin: '0 0 6px' }}>More Practice</h3>
        <p style={{ fontSize: 15, color: '#565a63', margin: 0, lineHeight: 1.7 }}>
          Practice with real-style questions. Pick an answer and get instant feedback with detailed explanations.
        </p>
      </motion.div>

      <MockWindow label="Practice Question — Algebra">
        <motion.div variants={fadeUp}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          }}>
            <div style={{
              padding: '4px 12px', borderRadius: 8,
              background: 'rgba(2,132,199,.08)',
              fontSize: 11, fontWeight: 800, color: '#0284c7',
              border: '1px solid rgba(2,132,199,.15)',
            }}>
              Question 7 of 25
            </div>
            <div style={{
              padding: '4px 12px', borderRadius: 8,
              background: 'rgba(138,143,152,.08)',
              fontSize: 11, fontWeight: 700, color: '#8a8f98',
            }}>
              Algebra
            </div>
          </div>

          <div style={{
            fontSize: 16, color: '#16181d', lineHeight: 1.8,
            padding: '16px 20px', background: '#f7f5ef',
            borderRadius: 12, border: '1px solid #e4e0d5',
            marginBottom: 16,
          }}>
            If 2x + 5 = 13, what is the value of x?
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {choices.map((choice) => {
              const isSelected = selected === choice.letter
              const isCorrect = selected && choice.letter === correctAnswer
              const isWrong = isSelected && choice.letter !== correctAnswer

              let borderColor = 'rgba(2,132,199,.12)'
              let bg = 'white'
              if (isCorrect) { borderColor = '#10b981'; bg = 'rgba(16,185,129,.06)' }
              else if (isWrong) { borderColor = '#ef4444'; bg = 'rgba(239,68,68,.04)' }
              else if (isSelected) { borderColor = '#0284c7'; bg = 'rgba(2,132,199,.04)' }

              return (
                <motion.div
                  key={choice.letter}
                  variants={fadeUp}
                  onClick={() => setSelected(choice.letter)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 12,
                    border: `1.5px solid ${borderColor}`,
                    background: bg,
                    cursor: 'pointer',
                    transition: 'all .2s ease',
                  }}
                  whileHover={{ scale: 1.01, boxShadow: '0 1px 3px rgba(22,24,29,.06)' }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: isCorrect ? 'linear-gradient(135deg, #10b981, #059669)' : isWrong ? '#ef4444' : '#0284c7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 14, fontWeight: 800,
                    opacity: (isSelected || isCorrect) ? 1 : 0.25,
                    transition: 'opacity .2s ease',
                  }}>
                    {isCorrect ? '\u2713' : isWrong ? '\u2717' : choice.letter}
                  </div>
                  <span style={{
                    fontSize: 15, fontWeight: isSelected ? 700 : 500,
                    color: isCorrect ? '#059669' : isWrong ? '#ef4444' : '#3f434b',
                  }}>
                    {choice.text}
                  </span>
                </motion.div>
              )
            })}
          </div>

          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                marginTop: 14,
                padding: '14px 18px',
                borderRadius: 12,
                background: selected === correctAnswer ? 'rgba(16,185,129,.06)' : 'rgba(239,68,68,.04)',
                border: `1px solid ${selected === correctAnswer ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.15)'}`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: selected === correctAnswer ? '#059669' : '#ef4444', marginBottom: 4 }}>
                {selected === correctAnswer ? 'Correct!' : 'Not quite!'}
              </div>
              <div style={{ fontSize: 13, color: '#565a63', lineHeight: 1.6 }}>
                2x + 5 = 13 {'\u2192'} 2x = 8 {'\u2192'} x = 4. The answer is B.
              </div>
            </motion.div>
          )}
        </motion.div>
      </MockWindow>

      <motion.div variants={fadeUp} style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(2,132,199,.06)', borderRadius: 12, border: '1px solid rgba(2,132,199,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="test" size={15} style={{ color: 'white' }} />
          </div>
          <p style={{ fontSize: 14, color: '#3f434b', margin: 0, lineHeight: 1.7 }}>
            Try clicking an answer above! Practice questions work just like this throughout the platform — instant feedback helps you learn faster.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StepProgress() {
  const barData = [
    { label: 'Week 1', height: 30, score: '1230' },
    { label: 'Week 2', height: 45, score: '1260' },
    { label: 'Week 3', height: 60, score: '1280' },
    { label: 'Week 4', height: 75, score: '1310' },
    { label: 'Week 5', height: 90, score: '1340' },
  ]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: sf, fontSize: 24, fontWeight: 600, color: '#16181d', margin: '0 0 6px' }}>Track Your Progress</h3>
        <p style={{ fontSize: 15, color: '#565a63', margin: 0, lineHeight: 1.7 }}>
          See how far you have come with detailed analytics and visual progress charts. Every test tells a story.
        </p>
      </motion.div>

      <MockWindow label="Progress Overview">
        <motion.div variants={fadeUp}>
          {/* Score trend chart */}
          <div style={{ fontSize: 11, fontWeight: 800, color: '#565a63', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Score Trend
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120, marginBottom: 8, padding: '0 4px' }}>
            {barData.map((bar, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${bar.height}%` }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  flex: 1,
                  background: `#0284c7`,
                  borderRadius: '8px 8px 4px 4px',
                  minWidth: 0,
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}
              >
                <div style={{
                  position: 'absolute', top: -20,
                  fontSize: 11, fontWeight: 800, color: '#0284c7',
                  whiteSpace: 'nowrap',
                }}>
                  {bar.score}
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, padding: '0 4px' }}>
            {barData.map((bar, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#8a8f98', fontWeight: 600 }}>
                {bar.label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#565a63', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Skill Breakdown
          </div>
          {[
            { skill: 'Algebra & Functions', pct: 85, color: '#10b981' },
            { skill: 'Geometry & Trig', pct: 70, color: '#0284c7' },
            { skill: 'Data Analysis', pct: 55, color: '#f59e0b' },
            { skill: 'Advanced Math', pct: 40, color: '#ef4444' },
          ].map((item, i) => (
            <div key={item.skill} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#3f434b' }}>{item.skill}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: item.color }}>{item.pct}%</span>
              </div>
              <div style={{ height: 8, background: '#f3f0e9', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  style={{ height: '100%', background: item.color, borderRadius: 99 }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </MockWindow>

      <motion.div variants={fadeUp} style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(2,132,199,.06)', borderRadius: 12, border: '1px solid rgba(2,132,199,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="chart" size={15} style={{ color: 'white' }} />
          </div>
          <p style={{ fontSize: 14, color: '#3f434b', margin: 0, lineHeight: 1.7 }}>
            Your progress page updates after every test. Use it to identify strengths and focus on areas that need the most work.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StepComplete({ onGetStarted, role }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{ textAlign: 'center', paddingTop: 20 }}
    >
      <motion.div
        variants={fadeUp}
        style={{
          width: 80, height: 80, borderRadius: 12,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 1px 3px rgba(22,24,29,.06)',
        }}
      >
        <span style={{ fontSize: 36, color: 'white', fontWeight: 900 }}>{'\u2713'}</span>
      </motion.div>

      <motion.h3 variants={fadeUp} style={{
        fontFamily: sf, fontSize: 32, fontWeight: 600, color: '#16181d',
        margin: '0 0 12px',
      }}>
        You're All Set!
      </motion.h3>

      <motion.p variants={fadeUp} style={{
        fontSize: 16, color: '#565a63', margin: '0 auto 32px',
        maxWidth: 440, lineHeight: 1.7,
      }}>
        {role === 'tutor'
          ? "You're ready to start tracking your students' progress and helping them succeed."
          : "You're ready to start your test prep journey. Take your first pre-test, study smart, and watch your score climb."}
      </motion.p>

      <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { icon: 'home', label: 'Dashboard', desc: 'View your stats' },
          { icon: 'guide', label: 'Study Guide', desc: 'Start learning' },
          { icon: 'test', label: 'Take a Test', desc: 'Dive right in' },
          { icon: 'students', label: 'Colleges', desc: 'Find your fit' },
          { icon: 'target', label: 'Strategies', desc: 'Score higher' },
        ].map((item) => (
          <div key={item.label} style={{
            background: 'white', borderRadius: 12,
            border: '1.5px solid rgba(2,132,199,.12)',
            padding: '20px 24px', width: 140,
            boxShadow: '0 1px 3px rgba(22,24,29,.06)',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: '#0284c7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px',
              color: 'white',
            }}>
              <Icon name={item.icon} size={19} />
            </div>
            <div style={{ fontFamily: sf, fontSize: 14, fontWeight: 600, color: '#16181d', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: '#8a8f98' }}>{item.desc}</div>
          </div>
        ))}
      </motion.div>

      <motion.button
        variants={fadeUp}
        onClick={onGetStarted}
        whileHover={{ scale: 1.03, boxShadow: '0 1px 3px rgba(22,24,29,.06)' }}
        whileTap={{ scale: 0.97 }}
        style={{
          marginTop: 36,
          padding: '16px 48px',
          fontSize: 18, fontWeight: 600, fontFamily: sf,
          color: 'white',
          background: '#d97706',
          border: 'none', borderRadius: 12,
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(22,24,29,.06)',
          transition: 'box-shadow .3s ease',
        }}
      >
        Go to Dashboard
      </motion.button>
    </motion.div>
  )
}

function StepCollegeRecruiting() {
  const schools = [
    { name: 'Stanford University', loc: 'Stanford, CA', accept: '4%', tier: 'Reach', tierColor: '#ef4444', sat: '1510–1570' },
    { name: 'University of Michigan', loc: 'Ann Arbor, MI', accept: '18%', tier: 'Target', tierColor: '#f59e0b', sat: '1360–1510' },
    { name: 'University of Arizona', loc: 'Tucson, AZ', accept: '87%', tier: 'Safety', tierColor: '#10b981', sat: '1060–1290' },
  ]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: sf, fontSize: 24, fontWeight: 600, color: '#16181d', margin: '0 0 6px' }}>College Recruiting</h3>
        <p style={{ fontSize: 15, color: '#565a63', margin: 0, lineHeight: 1.7 }}>
          Explore 775+ colleges and see your estimated admission chances based on your scores. Filter by region, cost, size, major, and more.
        </p>
      </motion.div>

      <MockWindow label="College Recruiting — Your Matches">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          {schools.map((s, i) => (
            <motion.div key={s.name} variants={fadeUp} custom={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px', borderRadius: 12,
              border: '1.5px solid rgba(2,132,199,.1)',
              marginBottom: 8,
              background: 'white',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#16181d' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#8a8f98', marginTop: 2 }}>{s.loc} &middot; SAT {s.sat}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 7,
                  background: `${s.tierColor}15`, color: s.tierColor,
                  fontSize: 11, fontWeight: 800,
                }}>{s.tier}</div>
                <div style={{ fontSize: 11, color: '#8a8f98', marginTop: 2 }}>{s.accept} accept</div>
              </div>
            </motion.div>
          ))}
          <motion.div variants={fadeUp} style={{
            display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10,
          }}>
            {['Region', 'Cost', 'Size', 'Major', 'Match Tier'].map(f => (
              <span key={f} style={{
                padding: '4px 10px', borderRadius: 7,
                background: '#f3f0e9', fontSize: 11, fontWeight: 700, color: '#565a63',
                border: '1px solid #e4e0d5',
              }}>{f}</span>
            ))}
          </motion.div>
        </motion.div>
      </MockWindow>

      <motion.div variants={fadeUp} style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(2,132,199,.06)', borderRadius: 12, border: '1px solid rgba(2,132,199,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="students" size={15} style={{ color: 'white' }} />
          </div>
          <p style={{ fontSize: 14, color: '#3f434b', margin: 0, lineHeight: 1.7 }}>
            Click any school to see detailed info — tuition, test score ranges, acceptance rates, popular majors, and your estimated admission chance.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StepStrategies() {
  const strategies = [
    { title: 'Time Management', desc: 'Learn to pace yourself across all sections', icon: 'clock', color: '#f59e0b' },
    { title: 'Process of Elimination', desc: 'Narrow down choices to boost accuracy', icon: 'target', color: '#0284c7' },
    { title: 'Reading Strategies', desc: 'Active reading techniques for passages', icon: 'guide', color: '#8b5cf6' },
    { title: 'Math Shortcuts', desc: 'Quick formulas and mental math tricks', icon: 'math', color: '#10b981' },
  ]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: sf, fontSize: 24, fontWeight: 600, color: '#16181d', margin: '0 0 6px' }}>Test Strategies</h3>
        <p style={{ fontSize: 15, color: '#565a63', margin: 0, lineHeight: 1.7 }}>
          Master proven strategies to maximize your score. Time management, elimination techniques, and section-specific tips.
        </p>
      </motion.div>

      <MockWindow label="Test Strategies">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {strategies.map((s, i) => (
            <motion.div key={s.title} variants={fadeUp} custom={i} style={{
              padding: '16px 14px', borderRadius: 12,
              border: '1.5px solid rgba(2,132,199,.1)',
              background: 'white',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `${s.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}>
                <Icon name={s.icon} size={16} style={{ color: s.color }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#16181d', marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: '#8a8f98', lineHeight: 1.5 }}>{s.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </MockWindow>

      <motion.div variants={fadeUp} style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(2,132,199,.06)', borderRadius: 12, border: '1px solid rgba(2,132,199,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="target" size={15} style={{ color: 'white' }} />
          </div>
          <p style={{ fontSize: 14, color: '#3f434b', margin: 0, lineHeight: 1.7 }}>
            Each strategy includes practical tips you can apply immediately. Knowing how to approach the test is just as important as knowing the content.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Step definitions ───────────────────────────────── */

const STEPS = [
  { number: 1, title: 'Your Dashboard', icon: 'home' },
  { number: 2, title: 'Study Guide', icon: 'guide' },
  { number: 3, title: 'Smart Journey', icon: 'target' },
  { number: 4, title: 'More Practice', icon: 'test' },
  { number: 5, title: 'Track Progress', icon: 'chart' },
  { number: 6, title: 'College Recruiting', icon: 'students' },
  { number: 7, title: 'Test Strategies', icon: 'target' },
  { number: 8, title: 'All Set!', icon: 'home' },
]

/* ─── Main Component ─────────────────────────────────── */

export default function Welcome() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const exam = params.get('exam') || 'sat'
  const role = profile?.role || 'student'

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const totalSteps = STEPS.length
  const isFirst = step === 0
  const isLast = step === totalSteps - 1

  function handleGetStarted() {
    if (role === 'admin') navigate('/admin', { replace: true })
    else if (role === 'tutor') navigate('/tutor', { replace: true })
    else navigate(`/pick-test-date?exam=${exam}`, { replace: true })
  }

  const goNext = useCallback(() => {
    setDirection(1)
    setStep(s => Math.min(s + 1, totalSteps - 1))
  }, [totalSteps])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setStep(s => Math.max(s - 1, 0))
  }, [])

  const goTo = useCallback((i) => {
    setDirection(i > step ? 1 : -1)
    setStep(i)
  }, [step])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goNext() }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goPrev() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev])

  // Admins already know the platform — skip the welcome tour.
  // (Must come after all hooks: the profile loads asynchronously, so this can
  // flip on a re-render, and an early return above hooks would crash React.)
  if (role === 'admin') return <Navigate to="/admin" replace />

  function renderStepContent() {
    switch (step) {
      case 0: return <StepDashboard />
      case 1: return <StepStudyGuide />
      case 2: return <StepJourney />
      case 3: return <StepPractice />
      case 4: return <StepProgress />
      case 5: return <StepCollegeRecruiting />
      case 6: return <StepStrategies />
      case 7: return <StepComplete onGetStarted={handleGetStarted} role={role} />
      default: return null
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#faf9f6',
    }}>
      {/* ── Hero Section ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          textAlign: 'center',
          paddingTop: 48,
          paddingBottom: 24,
        }}
      >
        <motion.img
          src="/logo.png"
          alt="Agora Logo"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            width: 64, height: 64,
            borderRadius: 12,
            marginBottom: 20,
            boxShadow: '0 1px 3px rgba(22,24,29,.06)',
          }}
        />

        <h1 style={{
          fontFamily: sf,
          fontSize: 36,
          fontWeight: 600,
          color: '#16181d',
          margin: '0 0 10px',
          lineHeight: 1.2,
        }}>
          Welcome to The Agora Project
        </h1>

        <p style={{
          fontSize: 16,
          color: '#565a63',
          margin: '0 auto',
          maxWidth: 460,
          lineHeight: 1.7,
        }}>
          Let's take a quick tour of your new study platform
        </p>
      </motion.div>

      {/* ── Step indicator bar ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, marginBottom: 32, flexWrap: 'wrap',
          }}
        >
          {STEPS.map((s, i) => {
            const isActive = i === step
            const isDone = i < step
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <motion.button
                  onClick={() => goTo(i)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: isActive ? 'auto' : 36, height: 36,
                    borderRadius: 12,
                    padding: isActive ? '0 16px' : 0,
                    background: isActive
                      ? '#0284c7'
                      : isDone
                        ? 'rgba(16,185,129,.12)'
                        : 'white',
                    color: isActive ? 'white' : isDone ? '#10b981' : '#8a8f98',
                    fontSize: 13, fontWeight: 600, fontFamily: sf,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: isActive ? '0 1px 3px rgba(22,24,29,.06)' : '0 2px 8px rgba(0,0,0,.04)',
                    transition: 'all .3s ease',
                    border: isActive ? 'none' : isDone ? '1.5px solid rgba(16,185,129,.2)' : '1.5px solid #e4e0d5',
                  }}
                  aria-label={`Step ${i + 1}: ${s.title}`}
                >
                  {isDone ? '\u2713' : s.number}
                  {isActive && <span style={{ fontSize: 12, fontWeight: 700 }}>{s.title}</span>}
                </motion.button>
                {i < STEPS.length - 1 && (
                  <div style={{
                    width: 24, height: 2,
                    background: i < step ? '#10b981' : '#e4e0d5',
                    borderRadius: 99,
                    transition: 'background .3s ease',
                  }} />
                )}
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* ── Slide content ── */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px', minHeight: 400 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation controls ── */}
      {!isLast && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            maxWidth: 640, margin: '32px auto 0',
            padding: '0 20px 60px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <motion.button
            onClick={goPrev}
            disabled={isFirst}
            whileHover={!isFirst ? { scale: 1.03 } : {}}
            whileTap={!isFirst ? { scale: 0.97 } : {}}
            style={{
              padding: '12px 28px', fontSize: 14, fontWeight: 600,
              fontFamily: sf,
              color: isFirst ? '#cbd5e1' : '#565a63',
              background: 'white',
              border: `1.5px solid ${isFirst ? '#e4e0d5' : 'rgba(2,132,199,.15)'}`,
              borderRadius: 12,
              cursor: isFirst ? 'not-allowed' : 'pointer',
              transition: 'all .2s ease',
              boxShadow: isFirst ? 'none' : '0 2px 8px rgba(0,0,0,.04)',
            }}
          >
            {'\u2190'} Previous
          </motion.button>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === step ? 24 : 8, height: 8,
                  borderRadius: 99, border: 'none', padding: 0,
                  background: i === step
                    ? '#0284c7'
                    : i < step
                      ? '#10b981'
                      : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all .3s ease',
                }}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <motion.button
            onClick={goNext}
            whileHover={{ scale: 1.03, boxShadow: '0 1px 3px rgba(22,24,29,.06)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '12px 32px', fontSize: 14, fontWeight: 600,
              fontFamily: sf,
              color: 'white',
              background: '#d97706',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(22,24,29,.06)',
              transition: 'all .2s ease',
            }}
          >
            Next {'\u2192'}
          </motion.button>
        </motion.div>
      )}

      {/* Final step nav — just a spacer */}
      {isLast && <div style={{ paddingBottom: 60 }} />}

      {/* Keyboard hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          textAlign: 'center',
          paddingBottom: 24,
          fontSize: 12, color: '#8a8f98',
        }}
      >
        Use arrow keys to navigate
      </motion.div>
    </div>
  )
}
