import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

/*
  Editorial direction: the one identity this project owns is the Agora —
  classical, academic. So the page is set like a well-designed course
  catalog rather than a SaaS template: serif display type (Fraunces),
  warm paper, hairline rules, Roman-numeral sections. No cards, no
  gradients, no scroll-triggered theatrics.
*/

const CSS = `
  .ed { background: #faf9f6; color: #16181d; font-family: 'DM Sans', sans-serif; }
  .ed ::selection { background: rgba(2,132,199,.15); }

  .ed-container { max-width: 1040px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 48px); }

  /* ── Nav ── */
  .ed-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 50;
    transition: background .25s ease, border-color .25s ease; border-bottom: 1px solid transparent; }
  .ed-nav.scrolled { background: rgba(250,249,246,.92); backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px); border-bottom-color: #e4e0d5; }
  .ed-nav-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
  .ed-wordmark { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #16181d; }
  .ed-wordmark span { font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 20px; letter-spacing: .2px; }

  .ed-btn { display: inline-flex; align-items: center; gap: 8px; background: #16181d; color: #fff;
    text-decoration: none; font-weight: 600; font-size: 14px; padding: 10px 22px; border-radius: 8px;
    transition: background .18s ease; }
  .ed-btn:hover { background: #2d3138; }
  .ed-btn-lg { padding: 14px 28px; font-size: 15px; }
  .ed-textlink { color: #16181d; text-decoration: none; font-weight: 500; font-size: 14px;
    border-bottom: 1px solid #8a8f98; padding-bottom: 2px; transition: border-color .18s ease, color .18s ease; }
  .ed-textlink:hover { color: #0284c7; border-color: #0284c7; }
  .ed-signin { color: #565a63; text-decoration: none; font-size: 14px; font-weight: 500; margin-right: 18px; }
  .ed-signin:hover { color: #16181d; }
  @media (max-width: 460px) { .ed-signin { display: none; } }

  /* ── Hero ── */
  .ed-hero { padding: clamp(130px, 18vh, 180px) 0 0; }
  .ed-kicker { display: flex; align-items: center; gap: 14px; color: #8a8f98;
    font-size: 12px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 34px; }
  .ed-kicker::before { content: ''; width: 44px; height: 1px; background: #8a8f98; }
  .ed-h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 500;
    font-size: clamp(44px, 7.5vw, 84px); line-height: 1.04; letter-spacing: -1px; margin: 0 0 28px; max-width: 820px; }
  .ed-h1 em { font-style: italic; font-weight: 400; color: #0284c7; }
  .ed-hero-sub { font-size: 17px; line-height: 1.7; color: #565a63; max-width: 440px; margin: 0 0 40px; }
  .ed-hero-cta { display: flex; align-items: center; gap: 26px; flex-wrap: wrap; margin-bottom: clamp(64px, 9vw, 100px); }

  .ed-statrow { border-top: 1px solid #e4e0d5; border-bottom: 1px solid #e4e0d5;
    display: grid; grid-template-columns: repeat(3, 1fr); }
  .ed-stat { padding: 26px 8px 28px; }
  .ed-stat + .ed-stat { border-left: 1px solid #e4e0d5; padding-left: 28px; }
  .ed-stat-num { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: clamp(28px, 4vw, 40px); line-height: 1; }
  .ed-stat-label { color: #8a8f98; font-size: 13px; margin-top: 8px; }
  .ed-statrow-4 { grid-template-columns: repeat(4, 1fr); }
  @media (max-width: 760px) { .ed-statrow-4 { grid-template-columns: 1fr 1fr; }
    .ed-statrow-4 .ed-stat:nth-child(3) { border-left: 0; }
    .ed-statrow-4 .ed-stat:nth-child(n+3) { border-top: 1px solid #e4e0d5; } }
  @media (max-width: 560px) {
    .ed-statrow { grid-template-columns: 1fr; }
    .ed-stat + .ed-stat { border-left: 0; border-top: 1px solid #e4e0d5; padding-left: 8px; }
    .ed-stat { padding: 18px 8px; }
  }

  /* ── Sections ── */
  .ed-section { padding-top: clamp(80px, 11vw, 130px); }
  .ed-label { display: flex; align-items: center; gap: 16px; color: #8a8f98;
    font-size: 12px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; margin: 0 0 22px; }
  .ed-label::after { content: ''; flex: 1; height: 1px; background: #e4e0d5; }
  .ed-h2 { font-family: 'Fraunces', Georgia, serif; font-weight: 500;
    font-size: clamp(30px, 4.5vw, 46px); line-height: 1.08; letter-spacing: -0.5px; margin: 0 0 16px; max-width: 560px; }
  .ed-section-sub { color: #565a63; font-size: 16px; line-height: 1.7; max-width: 460px; margin: 0; }

  /* Split spread: heading column left, content right */
  .ed-spread { display: grid; grid-template-columns: 1fr; gap: 40px; }
  @media (min-width: 800px) {
    .ed-spread { grid-template-columns: minmax(240px, 5fr) 7fr; gap: clamp(40px, 6vw, 90px); }
    .ed-spread-head { position: sticky; top: 96px; align-self: start; }
  }

  /* Coverage */
  .ed-coverage { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(28px, 4vw, 48px); }
  @media (max-width: 640px) { .ed-coverage { grid-template-columns: 1fr; } }
  .ed-coverage h3 { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 24px; margin: 0 0 4px; }
  .ed-topic { display: flex; justify-content: space-between; align-items: baseline; gap: 12px;
    padding: 13px 0; border-bottom: 1px solid #e4e0d5; font-size: 15px; color: #16181d; }
  .ed-topic small { color: #8a8f98; font-size: 11px; letter-spacing: 1.2px; }

  /* Tinted full-bleed band */
  .ed-tint { background: #f3f0e9; border-top: 1px solid #e4e0d5; border-bottom: 1px solid #e4e0d5;
    margin-top: clamp(80px, 11vw, 130px); padding: clamp(64px, 8vw, 96px) 0 clamp(70px, 9vw, 100px); }

  /* Features index */
  .ed-features { display: grid; grid-template-columns: 1fr 1fr; column-gap: clamp(28px, 5vw, 64px); margin-top: 46px; }
  @media (max-width: 640px) { .ed-features { grid-template-columns: 1fr; } }
  .ed-feature { border-top: 1px solid #e4e0d5; padding: 22px 0 26px; }
  .ed-tint .ed-feature { border-top-color: #dcd7c8; }
  .ed-feature-num { font-family: 'Fraunces', Georgia, serif; font-style: italic; color: #8a8f98; font-size: 15px; }
  .ed-feature h3 { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 21px; margin: 6px 0 8px; }
  .ed-feature p { color: #565a63; font-size: 15px; line-height: 1.65; margin: 0; }

  /* Process */
  .ed-steps { margin-top: 46px; }
  .ed-step { display: grid; grid-template-columns: 90px 1fr; gap: 18px; align-items: baseline;
    border-top: 1px solid #e4e0d5; padding: 26px 0; }
  @media (max-width: 560px) { .ed-step { grid-template-columns: 56px 1fr; } }
  .ed-step-num { font-family: 'Fraunces', Georgia, serif; font-weight: 400; font-style: italic;
    font-size: clamp(28px, 4vw, 40px); color: #0284c7; line-height: 1; }
  .ed-step h3 { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 20px; margin: 0 0 6px; }
  .ed-step p { color: #565a63; font-size: 15px; line-height: 1.65; margin: 0; max-width: 520px; }

  /* Dashboard (ink band) */
  .ed-dark { background: #16181d; color: #f4f3ef; margin-top: clamp(80px, 11vw, 130px);
    padding: clamp(70px, 9vw, 100px) 0 clamp(80px, 10vw, 110px); }
  .ed-dark .ed-label { color: rgba(244,243,239,.45); }
  .ed-dark .ed-label::after { background: rgba(244,243,239,.14); }
  .ed-dark .ed-section-sub { color: rgba(244,243,239,.6); }
  .ed-browser { margin-top: 44px; border: 1px solid rgba(244,243,239,.14); border-radius: 10px; overflow: hidden; }
  .ed-browser-bar { display: flex; align-items: center; gap: 6px; padding: 10px 14px;
    border-bottom: 1px solid rgba(244,243,239,.1); }
  .ed-browser-bar i { width: 9px; height: 9px; border-radius: 50%; background: rgba(244,243,239,.18); }
  .ed-browser-url { margin-left: 10px; font-size: 12px; color: rgba(244,243,239,.35); }
  .ed-dash { display: grid; grid-template-columns: repeat(3, 1fr); }
  .ed-dash-cell { padding: 24px; }
  .ed-dash-cell + .ed-dash-cell { border-left: 1px solid rgba(244,243,239,.1); }
  @media (max-width: 640px) {
    .ed-dash { grid-template-columns: 1fr; }
    .ed-dash-cell + .ed-dash-cell { border-left: 0; border-top: 1px solid rgba(244,243,239,.1); }
  }
  .ed-dash-label { font-size: 12px; color: rgba(244,243,239,.45); margin-bottom: 10px; }
  .ed-dash-num { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 34px; line-height: 1; }
  .ed-dash-sub { font-size: 12px; color: rgba(244,243,239,.35); margin-top: 8px; }

  /* About */
  .ed-about { margin-top: 40px; }
  .ed-about p { font-family: 'Fraunces', Georgia, serif; font-weight: 400;
    font-size: clamp(17px, 2vw, 19px); line-height: 1.8; color: #33363d; margin: 0 0 22px; max-width: 640px; }
  .ed-about p:first-of-type::first-letter { font-size: 62px; line-height: .85; float: left;
    padding: 7px 10px 0 0; font-weight: 500; color: #16181d; }

  /* CTA + footer */
  .ed-cta { border-top: 1px solid #e4e0d5; margin-top: clamp(80px, 11vw, 130px);
    padding: clamp(70px, 9vw, 110px) 0; text-align: center; }
  .ed-cta-note { color: #8a8f98; font-size: 13px; margin: 18px 0 0; }
  .ed-footer { border-top: 1px solid #e4e0d5; padding: 28px 0 36px; }
  .ed-footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .ed-footer-inner span { color: #8a8f98; font-size: 13px; }

  /* Entrance (hero only, CSS-driven) */
  @keyframes edRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
  .ed-rise { animation: edRise .6s cubic-bezier(.2,.7,.3,1) both; }
  .ed-rise-2 { animation-delay: .08s; } .ed-rise-3 { animation-delay: .16s; }
  .ed-rise-4 { animation-delay: .24s; } .ed-rise-5 { animation-delay: .38s; }
  @media (prefers-reduced-motion: reduce) { .ed-rise { animation: none; } }
`

/* ═══ DATA ═══ */
const SAT_TOPICS = {
  'Reading & Writing': ['Vocabulary', 'Evidence-Based Reading', 'Grammar Rules', 'Rhetoric'],
  'Math': ['Algebra', 'Problem Solving', 'Advanced Math', 'Geometry', 'Trigonometry'],
}

const FEATURES = [
  { title: 'Adaptive Study Guides', desc: 'Chapter-by-chapter lessons built around your diagnostic results. Covers every SAT section with practice questions that adapt as you improve.' },
  { title: 'Full-Length Practice Tests', desc: 'Timed exams that mirror real test conditions — section breaks, pacing, and automatic scoring included.' },
  { title: 'Study Calendar', desc: 'Pick your test date and available days. The calendar fills itself with exactly what you need to cover.' },
  { title: 'Mistake Notebook', desc: 'Wrong answers stick around. Each one gets an explanation and shows up again until you get it right.' },
  { title: 'Score Breakdowns', desc: 'See exactly where your points come from. Reading, Writing, Math — broken down by topic and difficulty.' },
  { title: 'College Fit Finder', desc: 'Compare your scores against real admission data from 780+ schools. Filter by what matters to you.' },
]

const STATS = [
  ['2,000+', 'Practice Questions'],
  ['7', 'Full Practice Tests'],
  ['780+', 'Colleges Compared'],
  ['100%', 'Free'],
]

const STEPS = [
  { title: 'Take a diagnostic', desc: 'A practice test pinpoints your starting score and the specific topics that need attention.' },
  { title: 'Follow your plan', desc: 'A study calendar fills in based on your test date, target score, and the areas where you lost the most points.' },
  { title: 'Practice and review', desc: 'Work through targeted questions. Every mistake gets tracked and re-tested until the concept sticks.' },
  { title: 'Show up prepared', desc: 'Take a final practice test, review your growth, and walk into the real thing knowing what to expect.' },
]

/* ═══ MAIN PAGE ═══ */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const pageRef = useRef(null)

  useEffect(() => {
    const el = pageRef.current
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 40)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={pageRef} className="ed" style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', scrollBehavior: 'smooth' }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav className={`ed-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="ed-container ed-nav-inner">
          <Link to="/" className="ed-wordmark">
            <img src="/logo.png" alt="" style={{ width: 34, height: 34, borderRadius: 8 }} />
            <span>The Agora Project</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/login" className="ed-signin">Sign in</Link>
            <Link to="/login?signup=1" className="ed-btn">Get started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="ed-hero">
        <div className="ed-container">
          <p className="ed-kicker ed-rise">Built by students · 100% free</p>
          <h1 className="ed-h1 ed-rise ed-rise-2">
            SAT prep that <em>actually works</em>
          </h1>
          <p className="ed-hero-sub ed-rise ed-rise-3">
            Take a diagnostic. Get a study plan. Practice the topics where you actually lose points. Track everything.
          </p>
          <div className="ed-hero-cta ed-rise ed-rise-4">
            <Link to="/login?signup=1" className="ed-btn ed-btn-lg">Start now</Link>
            <a href="#how-it-works" className="ed-textlink">How it works ↓</a>
          </div>
          <div className="ed-statrow ed-rise ed-rise-5">
            <div className="ed-stat">
              <div className="ed-stat-num">1420</div>
              <div className="ed-stat-label">Practice score</div>
            </div>
            <div className="ed-stat">
              <div className="ed-stat-num">+420</div>
              <div className="ed-stat-label">Improvement</div>
            </div>
            <div className="ed-stat">
              <div className="ed-stat-num">14 days</div>
              <div className="ed-stat-label">Study streak</div>
            </div>
          </div>
        </div>
      </header>

      {/* I — COVERAGE */}
      <section className="ed-section">
        <div className="ed-container ed-spread">
          <div className="ed-spread-head">
            <p className="ed-label">I · Coverage</p>
            <h2 className="ed-h2">What we cover</h2>
            <p className="ed-section-sub">Every section of the SAT, broken down by topic.</p>
          </div>
          <div className="ed-coverage">
            {Object.entries(SAT_TOPICS).map(([name, topics]) => (
              <div key={name}>
                <h3>{name}</h3>
                {topics.map(topic => (
                  <div key={topic} className="ed-topic">{topic}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* II — FEATURES */}
      <section className="ed-tint" id="features">
        <div className="ed-container">
          <p className="ed-label">II · Features</p>
          <h2 className="ed-h2">How AGORA helps you improve</h2>
          <p className="ed-section-sub">One platform. Every tool you need.</p>
          <div className="ed-features">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="ed-feature">
                <span className="ed-feature-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* III — PROCESS */}
      <section className="ed-section" id="how-it-works">
        <div className="ed-container">
          <p className="ed-label">III · Process</p>
          <h2 className="ed-h2">How it works</h2>
          <p className="ed-section-sub">Four steps. No fluff.</p>
          <div className="ed-steps">
            {STEPS.map((s, i) => (
              <div key={s.title} className="ed-step">
                <span className="ed-step-num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="ed-section">
        <div className="ed-container">
          <div className="ed-statrow ed-statrow-4">
            {STATS.map(([num, label]) => (
              <div key={label} className="ed-stat">
                <div className="ed-stat-num">{num}</div>
                <div className="ed-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IV — PREVIEW */}
      <section className="ed-dark">
        <div className="ed-container">
          <p className="ed-label">IV · Preview</p>
          <h2 className="ed-h2" style={{ color: '#f4f3ef' }}>Your dashboard</h2>
          <p className="ed-section-sub">See your scores, weak areas, and next steps all in one place.</p>
          <div className="ed-browser">
            <div className="ed-browser-bar">
              <i /><i /><i />
              <span className="ed-browser-url">theagoraproject.app/dashboard</span>
            </div>
            <div className="ed-dash">
              <div className="ed-dash-cell">
                <div className="ed-dash-label">Current Score</div>
                <div className="ed-dash-num">1380</div>
                <div className="ed-dash-sub">+120 from baseline</div>
              </div>
              <div className="ed-dash-cell">
                <div className="ed-dash-label">Study Progress</div>
                <div className="ed-dash-num">67%</div>
              </div>
              <div className="ed-dash-cell">
                <div className="ed-dash-label">Streak</div>
                <div className="ed-dash-num">14 days</div>
                <div className="ed-dash-sub">Keep going</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* V — ABOUT */}
      <section className="ed-section">
        <div className="ed-container">
          <p className="ed-label">V · About Us</p>
          <h2 className="ed-h2">Why we built this</h2>
          <div className="ed-about">
            <p>
              In the 6th century BCE, Athens first created its Agora. A place where citizens gathered to discuss philosophy and trade, and to foster one of the earliest democracies in the world. Its existence gave individuals a sense of empowerment and agency to act as active participants in the history they were creating.
            </p>
            <p>
              Today our American Agora is not necessarily a place or a platform, but the institutional checkmark of a college degree. Whether it be financial well-being, retirement capacity, or career outlook, the societal cushion of a college degree remains an important consideration in the pursuit to expand our Agora.
            </p>
            <p>
              This project aids in that endeavor by leveraging AI algorithms to improve students' SAT scores, making them more competitive for college admission.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ed-cta">
        <div className="ed-container">
          <h2 className="ed-h2" style={{ margin: '0 auto 16px', maxWidth: 'none' }}>Take a free diagnostic today</h2>
          <p className="ed-section-sub" style={{ margin: '0 auto 28px' }}>Find out where you stand, get a personalized study plan, and start improving.</p>
          <Link to="/login?signup=1" className="ed-btn ed-btn-lg">Get started</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ed-footer">
        <div className="ed-container ed-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.png" alt="" style={{ width: 20, height: 20, borderRadius: 5 }} />
            <span>The Agora Project</span>
          </div>
          <span>Built by students, for students.</span>
        </div>
      </footer>
    </div>
  )
}
