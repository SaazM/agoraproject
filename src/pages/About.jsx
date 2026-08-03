import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Icon from '../components/AppIcons.jsx'
import HandwrittenFirstLine from '../components/HandwrittenFirstLine.jsx'
import { motion } from 'framer-motion'

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const features = [
  {
    icon: 'clock',
    title: 'Timed Practice Tests',
    desc: 'Full-length SAT practice tests with built-in timers, module-by-module pacing, and automatic scoring that mirrors real test conditions.',
  },
  {
    icon: 'guide',
    title: 'Adaptive Study Guide',
    desc: 'Personalized chapter-by-chapter learning with interactive lessons, strategy tips, and targeted practice questions tailored to your weak areas.',
  },
  {
    icon: 'calendar',
    title: 'Smart Calendar & Study Plan',
    desc: 'Set your test date and get a day-by-day adaptive study schedule that balances review, practice, and new material across your available days.',
  },
  {
    icon: 'mistakes',
    title: 'Mistake Notebook',
    desc: 'Every missed question is tracked with hints and explanations. Review and validate each one to ensure you never repeat the same mistake.',
  },
  {
    icon: 'folder',
    title: 'Extra Practice & Tests',
    desc: 'Hundreds of additional practice questions and optional extra tests to sharpen your skills beyond the core curriculum.',
  },
  {
    icon: 'chart',
    title: 'Progress Reports & Score Trends',
    desc: 'Detailed score breakdowns, improvement charts, superscore tracking, and exportable progress reports that show exactly how far you\u2019ve come.',
  },
  {
    icon: 'target',
    title: 'Journey Planner',
    desc: 'A step-by-step roadmap from diagnostic to test day. Track milestones like completing the study guide, reviewing mistakes, and hitting score targets.',
  },
  {
    icon: 'star',
    title: 'College Recruiting',
    desc: 'Explore 780+ colleges with admission chance estimates based on your scores. Filter by region, size, cost, and major to find your best-fit schools.',
  },
  {
    icon: 'test',
    title: 'Test Strategies',
    desc: 'Section-by-section strategy guides with time management tips, elimination techniques, and question-type breakdowns for the SAT.',
  },
  {
    icon: 'settings',
    title: 'Profile & Settings',
    desc: 'Customize your profile picture, manage your account, change your password, and set your school affiliation.',
  },
]

const steps = [
  { num: 1, label: 'Create your account', desc: 'Sign up and optionally set your test date. All study resources are immediately available.' },
  { num: 2, label: 'Take a diagnostic pre-test', desc: 'A full-length timed practice exam identifies your starting point and pinpoints every area that needs work.' },
  { num: 3, label: 'Get your personalized study plan', desc: 'AGORA builds a custom calendar and adaptive study guide based on your weak areas and available time.' },
  { num: 4, label: 'Work through study guide chapters and practice', desc: 'Interactive lessons, targeted drills, and mistake review reinforce concepts until they stick.' },
  { num: 5, label: 'Take extra tests and track improvement', desc: 'Additional practice tests and the score trend chart let you measure growth and adjust your plan.' },
  { num: 6, label: 'Walk into test day confident', desc: 'With weak areas conquered and strategies mastered, you\u2019re ready to hit your goal score.' },
]

const card = {
  background: '#fff',
  border: '1px solid rgba(2,132,199,.1)',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(22,24,29,.06)',
  padding: '36px 32px',
  marginBottom: 28,
}

/* ---------- origin story (from the founder's handwritten note) ---------- */
const STORY_FIRST_LINE = 'In the 6th century BCE, Athens first created its Agora.'
const STORY_AFTER_FIRST_LINE =
  'A place where citizens gathered to discuss philosophy and trade, and to foster one of the earliest democracies in the world. Its existence gave individuals a sense of empowerment and agency to act as active participants in the history they were creating.'
const STORY_P2 =
  'Today, our American Agora is not necessarily a place or a platform, but the institutional checkmark of a college degree. Whether it be financial well-being, retirement capacity, or career outlook, the societal cushion of a college degree remains an important consideration in the pursuit to expand our Agora. This project aids in that endeavor by leveraging AI algorithms to improve students’ SAT scores, making them more competitive for college admission.'

const STORY_VARIANTS = [
  { id: 'ink-line', label: '1 · Real ink, first line', note: 'His actual handwriting, cropped from the note. Rest in type.' },
  { id: 'svg', label: '2 · Traced ink, animated', note: 'Same handwriting traced to vectors — it writes itself on load. Rest in type.' },
  { id: 'font', label: '3 · Handwriting font', note: 'Whole story in a handwriting web font (Caveat). Reflows on any screen.' },
  { id: 'hand-font', label: '4 · Font of his hand', note: 'Stand-in (Nanum Pen Script) for a font built from his real handwriting via Calligraphr. Reflows like type.' },
  { id: 'ink-full', label: '5 · Real ink, whole note', note: 'The full scanned note, untouched — cross-outs and all.' },
]

export function OriginStory() {
  const [variant, setVariant] = useState('ink-line')
  const active = STORY_VARIANTS.find((v) => v.id === variant)
  const handwritingImg = {
    width: '100%',
    maxWidth: 640,
    display: 'block',
    margin: '6px 0 18px',
  }
  const storyBody = { ...sectionSub, fontSize: 15.5 }
  const handFontBody = (family, size, lineHeight) => ({
    fontFamily: family,
    fontSize: size,
    lineHeight,
    color: '#16181d',
  })

  return (
    <motion.div {...fadeIn} transition={{ duration: 0.5, delay: 0.05 }} style={card}>
      <h2 style={sectionTitle}>Our Story</h2>

      {/* temporary style picker */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          margin: '10px 0 6px',
          padding: '12px 14px',
          background: '#f8fafc',
          border: '1px dashed rgba(2,132,199,.35)',
          borderRadius: 10,
        }}
      >
        <span style={{ width: '100%', fontSize: 11.5, letterSpacing: '.6px', textTransform: 'uppercase', color: '#565a63', fontWeight: 700 }}>
          Preview — pick a style
        </span>
        {STORY_VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setVariant(v.id)}
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 12.5,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 999,
              cursor: 'pointer',
              border: variant === v.id ? '1px solid #0284c7' : '1px solid rgba(22,24,29,.15)',
              background: variant === v.id ? '#0284c7' : '#fff',
              color: variant === v.id ? '#fff' : '#3f434b',
            }}
          >
            {v.label}
          </button>
        ))}
        <span style={{ width: '100%', fontSize: 12.5, color: '#565a63', lineHeight: 1.5 }}>{active.note}</span>
      </div>

      <div style={{ marginTop: 16 }}>
        {variant === 'ink-line' && (
          <>
            <img src="/handwriting/first-line.png" alt={STORY_FIRST_LINE} style={handwritingImg} />
            <p style={storyBody}>{STORY_AFTER_FIRST_LINE}</p>
            <p style={{ ...storyBody, marginTop: 12 }}>{STORY_P2}</p>
          </>
        )}

        {variant === 'svg' && (
          <>
            <HandwrittenFirstLine style={{ maxWidth: 640, margin: '6px 0 18px', color: '#16181d' }} />
            <p style={storyBody}>{STORY_AFTER_FIRST_LINE}</p>
            <p style={{ ...storyBody, marginTop: 12 }}>{STORY_P2}</p>
          </>
        )}

        {variant === 'font' && (
          <>
            <p style={{ ...handFontBody('Caveat, cursive', 30, 1.35), margin: '0 0 10px', fontWeight: 600 }}>
              {STORY_FIRST_LINE}
            </p>
            <p style={handFontBody('Caveat, cursive', 22, 1.5)}>{STORY_AFTER_FIRST_LINE}</p>
            <p style={{ ...handFontBody('Caveat, cursive', 22, 1.5), marginTop: 12 }}>{STORY_P2}</p>
          </>
        )}

        {variant === 'hand-font' && (
          <>
            <p style={{ ...handFontBody("'Nanum Pen Script', cursive", 32, 1.3), margin: '0 0 10px' }}>
              {STORY_FIRST_LINE}
            </p>
            <p style={handFontBody("'Nanum Pen Script', cursive", 24, 1.45)}>{STORY_AFTER_FIRST_LINE}</p>
            <p style={{ ...handFontBody("'Nanum Pen Script', cursive", 24, 1.45), marginTop: 12 }}>{STORY_P2}</p>
          </>
        )}

        {variant === 'ink-full' && (
          <img
            src="/handwriting/full-note.png"
            alt={`${STORY_FIRST_LINE} ${STORY_AFTER_FIRST_LINE} ${STORY_P2}`}
            style={{ ...handwritingImg, maxWidth: 720 }}
          />
        )}
      </div>
    </motion.div>
  )
}

const sectionTitle = {
  fontFamily: 'Fraunces, Georgia, serif',
  fontSize: 22,
  fontWeight: 600,
  color: '#16181d',
  marginBottom: 8,
}

const sectionSub = {
  fontSize: 15,
  color: '#3f434b',
  lineHeight: 1.7,
}

export default function About() {
  const { profile } = useAuth()

  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam="sat" />
      <div className="page fade-up">
        {/* ---------- hero ---------- */}
        <motion.div
          {...fadeIn}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', padding: '48px 24px 32px' }}
        >
          <img
            src="/logo.png"
            alt="The Agora Project"
            style={{
              width: 100,
              height: 100,
              objectFit: 'contain',
              marginBottom: 20,
              filter: 'drop-shadow(0 1px 3px rgba(22,24,29,.06))',
            }}
          />
          <h1
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 36,
              fontWeight: 600,
              color: '#16181d',
              margin: '0 0 8px',
            }}
          >
            The Agora Project
          </h1>
          <p
            style={{
              fontSize: 17,
              color: '#565a63',
              fontWeight: 500,
              margin: 0,
            }}
          >
            Built for speed, focus, and results
          </p>
        </motion.div>

        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px 60px' }}>
          {/* "Our Story" section (handwritten-note variants) is built but shelved for now.
              To bring it back, render <OriginStory /> here — see the OriginStory component above. */}

          {/* ---------- what is agora ---------- */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={card}
          >
            <h2 style={sectionTitle}>What is AGORA?</h2>
            <p style={sectionSub}>
              AGORA is an adaptive SAT test-prep platform designed to meet
              every student exactly where they are. It starts with a diagnostic
              test that maps your strengths and weaknesses, then generates a
              fully personalized study plan so you spend time only on what
              matters most.
            </p>
            <p style={{ ...sectionSub, marginTop: 12 }}>
              As you work through practice questions and study guide chapters,
              AGORA continuously tracks your progress, identifies weak areas,
              and provides targeted practice. The result is faster improvement,
              less wasted time, and a clear path to your goal score.
            </p>
          </motion.div>

          {/* ---------- features ---------- */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ marginBottom: 28 }}
          >
            <h2 style={{ ...sectionTitle, marginBottom: 20 }}>Features</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 18,
              }}
            >
              {features.map((f) => (
                <div
                  key={f.title}
                  style={{
                    ...card,
                    marginBottom: 0,
                    padding: '28px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={f.icon} size={22} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#16181d',
                        margin: '0 0 6px',
                      }}
                    >
                      {f.title}
                    </h3>
                    <p style={{ fontSize: 13.5, color: '#565a63', lineHeight: 1.6, margin: 0 }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ---------- how it works ---------- */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={card}
          >
            <h2 style={sectionTitle}>How It Works</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 16 }}>
              {steps.map((s) => (
                <div key={s.num} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#0284c7',
                      color: '#fff',
                      fontFamily: 'Fraunces, Georgia, serif',
                      fontWeight: 600,
                      fontSize: 15,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {s.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontWeight: 700,
                        fontSize: 15,
                        color: '#16181d',
                        margin: '0 0 4px',
                      }}
                    >
                      {s.label}
                    </p>
                    <p style={{ fontSize: 13.5, color: '#565a63', lineHeight: 1.6, margin: 0 }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ---------- for tutors ---------- */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={card}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Icon name="students" size={20} />
              </div>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }}>For Tutors</h2>
            </div>
            <p style={sectionSub}>
              Tutor accounts give educators a bird's-eye view of every assigned
              student's journey. Monitor diagnostic scores, study guide progress,
              practice-test results, and mistake patterns from a single
              dashboard — so you can focus tutoring sessions on the topics that
              will move the needle most.
            </p>
          </motion.div>

          {/* ---------- for administrators ---------- */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={card}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Icon name="admin" size={20} />
              </div>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }}>For Administrators</h2>
            </div>
            <p style={sectionSub}>
              Admin tools let program coordinators manage student rosters,
              assign tutors, and review aggregate performance data across an
              entire cohort. Create accounts in bulk, reset passwords, and
              export reports — everything you need to keep a test-prep program
              running smoothly at scale.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
