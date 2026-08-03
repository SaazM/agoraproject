import { useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth.jsx'
import { getInitialPreferredExam } from '../lib/examChoice.js'
import Sidebar from '../components/Sidebar.jsx'
import Icon from '../components/AppIcons.jsx'

/* ════════════════════════════════════════════════════════════
   Formula & Rule Sheet Data
   ════════════════════════════════════════════════════════════ */

const SAT_MATH = [
  {
    title: 'Linear Equations',
    items: [
      { label: 'Slope-Intercept Form', formula: 'y = mx + b', note: 'm = slope, b = y-intercept' },
      { label: 'Point-Slope Form', formula: 'y − y₁ = m(x − x₁)', note: 'Use when you have a point and slope' },
      { label: 'Slope Formula', formula: 'm = (y₂ − y₁) / (x₂ − x₁)', note: 'Rise over run between two points' },
      { label: 'Standard Form', formula: 'Ax + By = C', note: 'A, B, C are integers; A ≥ 0' },
      { label: 'Parallel Lines', formula: 'Same slope, different y-intercept', note: 'm₁ = m₂' },
      { label: 'Perpendicular Lines', formula: 'Slopes are negative reciprocals', note: 'm₁ × m₂ = −1' },
    ],
  },
  {
    title: 'Quadratics & Polynomials',
    items: [
      { label: 'Quadratic Formula', formula: 'x = (−b ± √(b² − 4ac)) / 2a', note: 'Solves ax² + bx + c = 0' },
      { label: 'Discriminant', formula: 'D = b² − 4ac', note: 'D > 0: two real solutions, D = 0: one, D < 0: none' },
      { label: 'Vertex Form', formula: 'y = a(x − h)² + k', note: 'Vertex at (h, k)' },
      { label: 'Vertex of Standard Form', formula: 'x = −b / 2a', note: 'Then plug x back in for y' },
      { label: 'Difference of Squares', formula: 'a² − b² = (a + b)(a − b)' },
      { label: 'Perfect Square Trinomial', formula: 'a² ± 2ab + b² = (a ± b)²' },
      { label: 'Sum of Roots', formula: '−b / a', note: 'For ax² + bx + c = 0' },
      { label: 'Product of Roots', formula: 'c / a', note: 'For ax² + bx + c = 0' },
    ],
  },
  {
    title: 'Geometry',
    items: [
      { label: 'Area of Triangle', formula: 'A = ½bh' },
      { label: 'Area of Rectangle', formula: 'A = lw' },
      { label: 'Area of Circle', formula: 'A = πr²' },
      { label: 'Circumference', formula: 'C = 2πr = πd' },
      { label: 'Arc Length', formula: 's = (θ/360) × 2πr', note: 'θ in degrees' },
      { label: 'Sector Area', formula: 'A = (θ/360) × πr²', note: 'θ in degrees' },
      { label: 'Pythagorean Theorem', formula: 'a² + b² = c²', note: 'c is the hypotenuse' },
      { label: '30-60-90 Triangle', formula: 'x : x√3 : 2x', note: 'Short leg : Long leg : Hypotenuse' },
      { label: '45-45-90 Triangle', formula: 'x : x : x√2', note: 'Leg : Leg : Hypotenuse' },
      { label: 'Distance Formula', formula: 'd = √((x₂−x₁)² + (y₂−y₁)²)' },
      { label: 'Midpoint Formula', formula: 'M = ((x₁+x₂)/2, (y₁+y₂)/2)' },
    ],
  },
  {
    title: 'Circles',
    items: [
      { label: 'Standard Form', formula: '(x − h)² + (y − k)² = r²', note: 'Center (h, k), radius r' },
      { label: 'Central Angle = Arc', formula: 'Central angle = intercepted arc' },
      { label: 'Inscribed Angle', formula: 'Inscribed angle = ½ intercepted arc' },
    ],
  },
  {
    title: 'Volume & 3D',
    items: [
      { label: 'Rectangular Prism', formula: 'V = lwh' },
      { label: 'Cylinder', formula: 'V = πr²h' },
      { label: 'Cone', formula: 'V = ⅓πr²h' },
      { label: 'Sphere', formula: 'V = ⁴⁄₃πr³' },
      { label: 'Pyramid', formula: 'V = ⅓Bh', note: 'B = area of base' },
    ],
  },
  {
    title: 'Statistics & Probability',
    items: [
      { label: 'Mean', formula: 'x̄ = Σx / n', note: 'Sum of values divided by count' },
      { label: 'Median', formula: 'Middle value when sorted', note: 'Average of two middle values if even count' },
      { label: 'Range', formula: 'Max − Min' },
      { label: 'Standard Deviation', formula: 'Measures spread from the mean', note: 'Low SD = clustered, High SD = spread out' },
      { label: 'Probability', formula: 'P(A) = favorable outcomes / total outcomes' },
      { label: 'Expected Value', formula: 'E(X) = Σ(x × P(x))' },
    ],
  },
  {
    title: 'Exponents & Radicals',
    items: [
      { label: 'Product Rule', formula: 'aᵐ × aⁿ = aᵐ⁺ⁿ' },
      { label: 'Quotient Rule', formula: 'aᵐ / aⁿ = aᵐ⁻ⁿ' },
      { label: 'Power Rule', formula: '(aᵐ)ⁿ = aᵐⁿ' },
      { label: 'Zero Exponent', formula: 'a⁰ = 1', note: 'Where a ≠ 0' },
      { label: 'Negative Exponent', formula: 'a⁻ⁿ = 1/aⁿ' },
      { label: 'Fractional Exponent', formula: 'a^(m/n) = ⁿ√(aᵐ)' },
      { label: 'Exponential Growth', formula: 'y = a(1 + r)ᵗ', note: 'a = initial, r = rate, t = time' },
      { label: 'Exponential Decay', formula: 'y = a(1 − r)ᵗ' },
    ],
  },
  {
    title: 'Ratios, Proportions & Percents',
    items: [
      { label: 'Percent Change', formula: '((New − Old) / Old) × 100' },
      { label: 'Proportion', formula: 'a/b = c/d → ad = bc', note: 'Cross-multiply' },
      { label: 'Direct Variation', formula: 'y = kx', note: 'k is the constant of variation' },
      { label: 'Inverse Variation', formula: 'y = k/x', note: 'Product xy = k is constant' },
    ],
  },
]

const SAT_GRAMMAR = [
  {
    title: 'Subject-Verb Agreement',
    items: [
      { label: 'Basic Rule', formula: 'Singular subject → singular verb; Plural subject → plural verb' },
      { label: 'Prepositional Phrases', formula: 'Ignore phrases between subject and verb', note: '"The box of chocolates IS on the table"' },
      { label: 'Compound Subjects', formula: '"And" = plural; "Or/Nor" = match closer subject' },
      { label: 'Indefinite Pronouns', formula: 'Each, every, everyone, nobody, anyone → singular' },
      { label: 'Collective Nouns', formula: 'Team, group, audience → usually singular', note: 'Acting as one unit' },
    ],
  },
  {
    title: 'Punctuation Rules',
    items: [
      { label: 'Comma + FANBOYS', formula: 'Independent clause, [for/and/nor/but/or/yet/so] independent clause' },
      { label: 'Semicolon', formula: 'Independent clause; independent clause', note: 'Both sides must be complete sentences' },
      { label: 'Colon', formula: 'Complete sentence: list, explanation, or elaboration', note: 'What comes before the colon MUST be a full sentence' },
      { label: 'Dash', formula: 'Use em dashes to set off — like parentheses —', note: 'Must use two dashes or none (not one)' },
      { label: 'Apostrophes', formula: "Possessive: dog's, dogs' | It's = it is | Its = possessive" },
      { label: 'No Comma Splice', formula: 'WRONG: "I ran, she walked." Fix with period, semicolon, or FANBOYS' },
    ],
  },
  {
    title: 'Sentence Structure',
    items: [
      { label: 'Run-on Sentence', formula: 'Two independent clauses joined without proper punctuation', note: 'Fix: add period, semicolon, or comma + FANBOYS' },
      { label: 'Fragment', formula: 'A dependent clause or phrase pretending to be a sentence', note: 'Fix: attach to an independent clause' },
      { label: 'Parallel Structure', formula: 'Items in a list must be the same grammatical form', note: '"Running, swimming, and biking" NOT "running, swim, and to bike"' },
      { label: 'Modifiers', formula: 'Place modifiers next to what they describe', note: '"Walking to school, THE STUDENT saw a bird" not "the bird"' },
      { label: 'Pronoun Clarity', formula: 'Every pronoun must have ONE clear antecedent', note: '"He told him" is ambiguous — name the person' },
    ],
  },
  {
    title: 'Transitions',
    items: [
      { label: 'Addition', formula: 'Furthermore, moreover, additionally, in addition' },
      { label: 'Contrast', formula: 'However, nevertheless, on the other hand, conversely' },
      { label: 'Cause/Effect', formula: 'Therefore, consequently, as a result, thus' },
      { label: 'Example', formula: 'For instance, for example, specifically, in particular' },
      { label: 'Conclusion', formula: 'In conclusion, ultimately, in summary, overall' },
      { label: 'Sequence', formula: 'First, next, then, finally, subsequently' },
    ],
  },
  {
    title: 'Conciseness & Style',
    items: [
      { label: 'Eliminate Redundancy', formula: 'Remove words that repeat the same idea', note: '"Past history" → "history"; "true fact" → "fact"' },
      { label: 'Shorter Is Better', formula: 'If two choices say the same thing, pick the shorter one' },
      { label: 'Active vs Passive', formula: '"The dog bit the man" > "The man was bitten by the dog"', note: 'Active voice is preferred unless passive is needed' },
      { label: 'Wordiness', formula: '"Due to the fact that" → "because"', note: '"In order to" → "to"; "at this point in time" → "now"' },
    ],
  },
]

const SAT_READING = [
  {
    title: 'Passage Approach',
    items: [
      { label: 'Read Actively', formula: 'Underline main claims, circle key terms, note tone shifts' },
      { label: 'Main Idea First', formula: 'Ask: What is the author ARGUING? What is the PURPOSE?' },
      { label: 'Evidence-Based Pairs', formula: 'For paired questions, find the evidence FIRST then match the claim' },
      { label: 'Process of Elimination', formula: 'Wrong answers are often too extreme, too narrow, or unsupported' },
    ],
  },
  {
    title: 'Question Types',
    items: [
      { label: 'Main Idea', formula: 'What is the central claim or primary purpose?', note: 'Answer should cover the WHOLE passage, not just one part' },
      { label: 'Inference', formula: 'What can be reasonably concluded?', note: 'Must be directly supported — don\'t add outside knowledge' },
      { label: 'Vocabulary in Context', formula: 'Re-read the sentence, replace the word with each answer choice', note: 'The "obvious" definition is often wrong' },
      { label: 'Function/Purpose', formula: 'WHY did the author include this detail?', note: 'Think about the argument structure, not just what it says' },
      { label: 'Data/Graph Questions', formula: 'Read axis labels, title, and units carefully', note: 'The answer must be supported by the data shown' },
    ],
  },
  {
    title: 'Common Traps',
    items: [
      { label: 'Extreme Language', formula: 'Watch for "always," "never," "all," "none"', note: 'Correct answers use measured language' },
      { label: 'Out of Scope', formula: 'If it\'s not in the passage, it\'s wrong', note: 'Even if it\'s true in real life' },
      { label: 'Half Right', formula: 'An answer can be partially correct but still wrong', note: 'Every part of the answer must be supported' },
      { label: 'Misplaced Detail', formula: 'A true statement from the wrong part of the passage', note: 'Make sure the evidence matches the specific question' },
    ],
  },
]

/* ════════════════════════════════════════════════════════════
   Section color map
   ════════════════════════════════════════════════════════════ */
const SECTION_COLORS = {
  'Math Formulas': { bg: '#0284c7', icon: 'math' },
  'Grammar & Writing Rules': { bg: '#8b5cf6', icon: 'guide' },
  'Reading Strategies': { bg: '#f59e0b', icon: 'eye' },
}

/* ════════════════════════════════════════════════════════════
   Component
   ════════════════════════════════════════════════════════════ */
const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }

export default function FormulaSheet() {
  const { profile } = useAuth()
  const location = useLocation()
  const examParam = new URLSearchParams(location.search).get('exam')
  const exam = examParam === 'sat' ? examParam : getInitialPreferredExam(profile) || 'sat'
  const [openSections, setOpenSections] = useState({})
  const [searchQuery, setSearchQuery] = useState('')

  const toggle = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))

  const sections = useMemo(() => [
    { name: 'Math Formulas', groups: SAT_MATH },
    { name: 'Grammar & Writing Rules', groups: SAT_GRAMMAR },
    { name: 'Reading Strategies', groups: SAT_READING },
  ], [])

  // Filter by search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections
    const q = searchQuery.toLowerCase()
    return sections.map((sec) => ({
      ...sec,
      groups: sec.groups
        .map((g) => ({
          ...g,
          items: g.items.filter(
            (item) =>
              item.label.toLowerCase().includes(q) ||
              item.formula.toLowerCase().includes(q) ||
              (item.note && item.note.toLowerCase().includes(q)),
          ),
        }))
        .filter((g) => g.items.length > 0),
    })).filter((sec) => sec.groups.length > 0)
  }, [sections, searchQuery])

  const totalFormulas = useMemo(
    () => sections.reduce((sum, s) => sum + s.groups.reduce((gs, g) => gs + g.items.length, 0), 0),
    [sections],
  )

  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />
      <div className="page fade-up">
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 80px' }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ marginBottom: 28 }}
          >
            <div style={{
              background: '#16181d',
              borderRadius: 12, padding: '32px 34px', color: '#fff', marginBottom: 24,
            }}>
              <h1 style={{
                fontFamily: "Fraunces, Georgia, serif", fontSize: 26, fontWeight: 600, color: '#fff',
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
              }}>
                <Icon name="folder" size={24} />
                Formula & Rule Sheet
              </h1>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                Quick-reference cheat sheet for {exam.toUpperCase()}. {totalFormulas} formulas, rules, and strategies organized by section.
              </p>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 4 }}>
              <Icon name="search" size={16} style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: '#8a8f98', pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="Search formulas, rules, or strategies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12,
                  border: '1px solid #e4e0d5', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                  background: '#fff', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color .2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#0284c7' }}
                onBlur={(e) => { e.target.style.borderColor = '#e4e0d5' }}
              />
            </div>
          </motion.div>

          {/* Sections */}
          <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredSections.map((sec) => {
              const color = SECTION_COLORS[sec.name] || { bg: '#565a63', icon: 'info' }
              return (
                <motion.div key={sec.name} variants={fadeUp}>
                  {/* Section header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                    padding: '10px 16px', borderRadius: 12,
                    background: `${color.bg}10`, border: `1px solid ${color.bg}25`,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={color.icon} size={16} style={{ color: '#fff' }} />
                    </div>
                    <span style={{
                      fontFamily: "Fraunces, Georgia, serif", fontWeight: 600, fontSize: 16, color: '#16181d',
                    }}>
                      {sec.name}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: color.bg, background: `${color.bg}15`,
                      padding: '2px 8px', borderRadius: 99,
                    }}>
                      {sec.groups.reduce((s, g) => s + g.items.length, 0)} items
                    </span>
                  </div>

                  {/* Groups within section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {sec.groups.map((group) => {
                      const key = `${sec.name}:${group.title}`
                      const isOpen = openSections[key] !== false // default open
                      return (
                        <div key={group.title} style={{
                          background: '#fff', borderRadius: 12,
                          border: '1px solid #e4e0d5', overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(22,24,29,.06)',
                        }}>
                          <button
                            onClick={() => toggle(key)}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '14px 18px', border: 'none', background: 'none', cursor: 'pointer',
                              borderBottom: isOpen ? '1px solid #f3f0e9' : 'none',
                            }}
                          >
                            <span style={{
                              fontFamily: "Fraunces, Georgia, serif", fontWeight: 600, fontSize: 14, color: '#16181d',
                            }}>
                              {group.title}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 11, color: '#8a8f98', fontWeight: 600 }}>
                                {group.items.length}
                              </span>
                              <span style={{
                                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform .2s', display: 'inline-flex',
                              }}>
                                <Icon name="arrowRight" size={12} style={{ color: '#8a8f98' }} />
                              </span>
                            </div>
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div style={{ padding: '6px 18px 14px' }}>
                                  {group.items.map((item, i) => (
                                    <div
                                      key={i}
                                      style={{
                                        padding: '10px 0',
                                        borderBottom: i < group.items.length - 1 ? '1px solid #f7f5ef' : 'none',
                                        display: 'flex', flexDirection: 'column', gap: 4,
                                      }}
                                    >
                                      <div style={{
                                        fontSize: 12, fontWeight: 700, color: '#565a63',
                                        textTransform: 'uppercase', letterSpacing: '.3px',
                                      }}>
                                        {item.label}
                                      </div>
                                      <div style={{
                                        fontSize: 15, fontWeight: 600, color: '#16181d',
                                        fontFamily: "ui-serif, Charter, Georgia, Cambria, 'Times New Roman', serif",
                                        letterSpacing: '.2px',
                                      }}>
                                        {item.formula}
                                      </div>
                                      {item.note && (
                                        <div style={{
                                          fontSize: 12, color: '#8a8f98', fontStyle: 'italic', lineHeight: 1.4,
                                        }}>
                                          {item.note}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {filteredSections.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '60px 20px', color: '#8a8f98',
            }}>
              <Icon name="search" size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: 15, fontWeight: 600 }}>No results for "{searchQuery}"</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Try a different search term</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
