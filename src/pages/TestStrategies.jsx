import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Icon from '../components/AppIcons.jsx'
import { getInitialPreferredExam } from '../lib/examChoice.js'

const sf = 'Fraunces, Georgia, serif'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [.22, 1, .36, 1] },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const cardAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [.22, 1, .36, 1] } },
}

/* ═══════════════════════════════════════════
   STRATEGY DATA
   ═══════════════════════════════════════════ */

const SAT_STRATEGIES = {
  overview: {
    title: 'SAT Overview',
    icon: 'test',
    items: [
      { q: 'How long is the SAT?', a: 'The digital SAT is 2 hours and 14 minutes total, split into two main sections. There is no separate experimental section.' },
      { q: 'What are the sections?', a: 'Reading & Writing (two modules, 32 questions each, 64 total) and Math (two modules, 22 questions each, 44 total). Total: 108 questions.' },
      { q: 'How does the adaptive format work?', a: 'Each section has two modules. Your performance on Module 1 determines the difficulty of Module 2. A harder Module 2 means a higher score ceiling — it\'s a good thing.' },
      { q: 'Is there a break?', a: 'Yes — a 10-minute break between the Reading & Writing section and the Math section.' },
      { q: 'What is the scoring range?', a: '400–1600 total. Reading & Writing: 200–800. Math: 200–800. There is no penalty for wrong answers.' },
    ],
  },
  whatToBring: {
    title: 'What to Bring on Test Day',
    icon: 'check',
    items: [
      { q: 'Required items', a: 'Your admission ticket (printed or on phone), a valid photo ID, a fully charged laptop or tablet with the Bluebook app installed, and your charger.' },
      { q: 'Calculator policy', a: 'A built-in Desmos calculator is available on-screen for the entire Math section. You may also bring an approved physical calculator (TI-84, etc.) as a backup.' },
      { q: 'What about pencils?', a: 'The digital SAT is taken on a device — no pencils or paper needed. However, you may bring scratch paper or a pen for notes if your testing center allows it. Some centers provide scratch paper.' },
      { q: 'Snacks and water?', a: 'Bring a snack and water for the break. You can\'t eat during the test, but the 10-minute break is a good time to refuel.' },
    ],
  },
  timing: {
    title: 'Timing Strategy',
    icon: 'clock',
    items: [
      { q: 'Reading & Writing timing', a: 'Each R&W module gives you 32 minutes for 32 questions — about 1 minute per question. Flag hard ones and come back. The passage is short (1–2 paragraphs per question), so don\'t overthink.' },
      { q: 'Math timing', a: 'Each Math module gives you 35 minutes for 22 questions — about 1 minute 35 seconds per question. Earlier questions are usually faster; save time for the harder ones at the end.' },
      { q: 'Using the built-in timer', a: 'Bluebook shows a countdown timer. Check it every 5 questions or so. If you\'re halfway through questions, you should be at or before the halfway time mark.' },
      { q: 'When to move on', a: 'If a question has taken more than 2 minutes, flag it and move on. One hard question isn\'t worth three easier ones.' },
    ],
  },
  guessing: {
    title: 'Guessing & Elimination',
    icon: 'target',
    items: [
      { q: 'Is there a penalty for guessing?', a: 'No. There is no penalty for wrong answers on the SAT. Never leave a question blank — always guess if you\'re unsure.' },
      { q: 'How to eliminate answers', a: 'Try to eliminate at least 2 choices before guessing. Even eliminating 1 wrong answer improves your odds from 25% to 33%. Eliminating 2 gives you a 50/50 shot.' },
      { q: 'Strategic guessing on R&W', a: 'Look for answers that are too extreme, too narrow, or not supported by the passage. The correct answer on the SAT almost always has direct textual evidence.' },
      { q: 'Strategic guessing on Math', a: 'Try plugging answer choices back into the problem (backsolving). Start with choice B or C. If the answer doesn\'t need to be exact, estimate and eliminate.' },
    ],
  },
  navigation: {
    title: 'Skipping & Navigation',
    icon: 'back',
    items: [
      { q: 'Can I go back to questions I skipped?', a: 'Yes — within each module, you can move forward and backward freely. Use the Flag button to mark questions you want to revisit.' },
      { q: 'Can I go back to a previous module?', a: 'No. Once you finish Module 1 and move to Module 2, you cannot return to Module 1. Make sure you\'re satisfied before submitting a module.' },
      { q: 'Best skip strategy', a: 'First pass: answer everything you can quickly. Second pass: tackle flagged questions with remaining time. Final 30 seconds: fill in any blanks with your best guess.' },
    ],
  },
  sectionTips: {
    title: 'Section-Specific Tips',
    icon: 'guide',
    items: [
      { q: 'Reading & Writing tips', a: 'Read the question first, then the passage. The passage is short — read it completely, don\'t skim. For vocabulary-in-context questions, cover the original word and predict what fits. For evidence questions, the answer is always in the text.' },
      { q: 'Math — no calculator mental tricks', a: 'Even though Desmos is available, mental math is faster for simple operations. Know your common fractions-to-decimals conversions, perfect squares up to 15², and basic angle relationships.' },
      { q: 'Math — common traps', a: 'Watch for unit conversions (minutes vs. hours, inches vs. feet). Read what the question actually asks — sometimes they want 2x, not x. Check that your answer makes sense in context.' },
      { q: 'Using Desmos effectively', a: 'Graph both sides of an equation to find intersections. Use tables to test values. Type in the full equation — Desmos solves systems of equations, quadratics, and inequalities instantly.' },
    ],
  },
  mindset: {
    title: 'Test Day Mindset',
    icon: 'sparkle',
    items: [
      { q: 'The night before', a: 'Don\'t cram. Review your weakest formulas for 20 minutes, then stop. Pack everything you need. Set two alarms. Get 7–8 hours of sleep.' },
      { q: 'Morning routine', a: 'Eat a solid breakfast with protein and complex carbs. Arrive 15–30 minutes early. Do a few easy practice problems to warm up your brain.' },
      { q: 'During the test', a: 'If you feel stuck, take 3 deep breaths. Remember that a harder Module 2 is a good sign. Stay focused on the current question — don\'t think about the last one.' },
      { q: 'After a tough section', a: 'Don\'t dwell. The break exists for a reason — use it to reset mentally. Eat your snack, drink water, stretch, and approach Math with fresh eyes.' },
    ],
  },
}

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

function StrategySection({ section, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <motion.div variants={cardAnim} style={{
      background: '#fff',
      border: '1px solid rgba(2,132,199,.12)',
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(22,24,29,.06)',
      overflow: 'hidden',
      marginBottom: 14,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 14,
          background: open ? 'rgba(2,132,199,.05)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background .2s',
        }}
      >
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: open
            ? '#0284c7'
            : 'rgba(2,132,199,.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'all .2s',
          boxShadow: open ? '0 1px 3px rgba(22,24,29,.06)' : 'none',
        }}>
          <Icon name={section.icon} size={20} style={{ color: open ? 'white' : '#0284c7' }} />
        </div>
        <div style={{ flex: 1, fontFamily: sf, fontSize: 17, fontWeight: 600, color: '#16181d' }}>
          {section.title}
        </div>
        <span style={{
          fontSize: 18, color: '#8a8f98', transition: 'transform .2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          &#9660;
        </span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{ padding: '0 24px 22px' }}
        >
          {section.items.map((item, i) => (
            <div key={i} style={{
              padding: '16px 0',
              borderTop: i === 0 ? '1px solid rgba(2,132,199,.08)' : '1px solid #f3f0e9',
            }}>
              <div style={{
                fontFamily: sf, fontSize: 14, fontWeight: 700, color: '#16181d',
                marginBottom: 6, display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: 'rgba(2,132,199,.10)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 900, color: '#0284c7',
                  flexShrink: 0, marginTop: 1,
                }}>
                  Q
                </span>
                {item.q}
              </div>
              <div style={{
                fontSize: 14, color: '#3f434b', lineHeight: 1.7,
                paddingLeft: 30,
              }}>
                {item.a}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

export default function TestStrategies() {
  const { user } = useAuth()
  const location = useLocation()
  const requestedExam = new URLSearchParams(location.search).get('exam')
  const exam = requestedExam === 'sat' ? requestedExam : getInitialPreferredExam(user)

  const strategies = SAT_STRATEGIES
  const sections = useMemo(() => Object.values(strategies), [strategies])

  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />
      <div className="page fade-up">
        {/* Hero */}
        <motion.div
          {...fadeUp}
          style={{
            background: '#16181d',
            borderRadius: 12,
            padding: '36px 32px',
            marginBottom: 28,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: 'rgba(2,132,199,.15)',
          }} />
          <div style={{
            position: 'absolute', bottom: -20, left: '40%',
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(2,132,199,.1)',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: '#0284c7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(22,24,29,.06)',
              }}>
                <Icon name="target" size={26} style={{ color: 'white' }} />
              </div>
              <div>
                <h1 style={{
                  fontFamily: sf, fontSize: 28, fontWeight: 600,
                  margin: 0, letterSpacing: '-0.3px', color: '#ffffff',
                }}>
                  SAT Test Strategies
                </h1>
                <p style={{
                  margin: '4px 0 0', fontSize: 15,
                  color: 'rgba(255,255,255,.7)', lineHeight: 1.5,
                }}>
                  Everything you need to know before test day — structure, timing, what to bring, and how to maximize your score.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick stats bar */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12, marginBottom: 28,
          }}
        >
          <QuickStat label="Duration" value="2h 14m" icon="clock" />
          <QuickStat label="Questions" value="108" icon="test" />
          <QuickStat label="Sections" value="2" icon="folder" />
          <QuickStat label="Score Range" value="400–1600" icon="chart" />
          <QuickStat label="Wrong Penalty" value="None" icon="check" accent="green" />
        </motion.div>

        {/* Strategy sections */}
        <motion.div variants={stagger} initial="hidden" animate="show">
          {sections.map((section, i) => (
            <StrategySection key={section.title} section={section} defaultOpen={i === 0} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function QuickStat({ label, value, icon, accent }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(2,132,199,.12)',
      borderRadius: 12,
      padding: '18px 16px',
      textAlign: 'center',
      boxShadow: '0 1px 3px rgba(22,24,29,.06)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: accent === 'green'
          ? 'linear-gradient(90deg, #10b981, #059669)'
          : '#0284c7',
      }} />
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: accent === 'green' ? 'rgba(16,185,129,.12)' : 'rgba(2,132,199,.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 8px',
      }}>
        <Icon name={icon} size={16} style={{ color: accent === 'green' ? '#059669' : '#0284c7' }} />
      </div>
      <div style={{ fontFamily: sf, fontSize: 20, fontWeight: 600, color: '#16181d' }}>
        {value}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#565a63', textTransform: 'uppercase', letterSpacing: '.5px', marginTop: 2 }}>
        {label}
      </div>
    </div>
  )
}
