import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { getTestConfig } from '../data/tests.js'
import BrandLink from '../components/BrandLink.jsx'
import Icon from '../components/AppIcons.jsx'
import { getDefaultModuleTimeRemaining, getExamConfig } from '../data/examData.js'
import { getInitialPreferredExam } from '../lib/examChoice.js'
import { withExam } from '../lib/viewAs.js'

function Navbar({ exam }) {
  const navigate = useNavigate()
  return (
    <nav className="nav">
      <BrandLink to={withExam('/dashboard', exam)} />
      <div className="nav-actions">
        <button
          className="btn btn-outline"
          onClick={() => navigate(-1)}
          style={{ padding: '6px 14px', fontSize: 12, color: 'rgba(255,255,255,.8)', borderColor: 'rgba(255,255,255,.24)', background: 'rgba(255,255,255,.08)' }}
          title="Go back"
        >
          <Icon name="back" size={15} />
          Back
        </button>
        <Link
          to={withExam('/dashboard', exam)}
          className="btn btn-outline"
          style={{ padding: '6px 14px', fontSize: 12, color: 'rgba(255,255,255,.7)', borderColor: 'rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)' }}
        >
          Dashboard
        </Link>
      </div>
    </nav>
  )
}

export default function FinalTest() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const requestedExam = useMemo(() => String(new URLSearchParams(location.search || '').get('exam') || '').toLowerCase(), [location.search])
  const exam = requestedExam === 'sat' ? requestedExam : getInitialPreferredExam(user)
  const examConfig = getExamConfig(exam)
  const finalTestId = examConfig.finalTestId
  const cfg = getTestConfig(finalTestId)

  const [loading, setLoading] = useState(true)
  const [inProgress, setInProgress] = useState(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!supabase || !user?.id) return
    let cancelled = false
    setLoading(true)
    supabase.from('test_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('test_id', finalTestId)
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setInProgress(data || null)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.id, finalTestId])

  async function startFinal() {
    if (!supabase || !user?.id || starting) return
    setStarting(true)
    try {
      const existing = await supabase.from('test_attempts')
        .select('id')
        .eq('user_id', user.id)
        .eq('test_id', finalTestId)
        .is('completed_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (existing?.data?.id) {
        navigate(`/test/${existing.data.id}`)
        return
      }
      // A failed lookup must not fall through to insert — that would create a
      // duplicate in-progress attempt on a transient query error.
      if (existing?.error) {
        alert('Could not check for an existing attempt. Please try again.')
        return
      }

      const payload = {
        user_id: user.id,
        test_id: finalTestId,
        current_section: examConfig.moduleOrder[0],
        answers: {},
        module_time_remaining: getDefaultModuleTimeRemaining(finalTestId),
      }
      const res = await supabase.from('test_attempts').insert(payload).select().single()
      if (!res.error && res.data) navigate(`/test/${res.data.id}`)
      else {
        alert(res.error?.message || 'Could not start final test. Please try again.')
      }
    } catch (error) {
      alert(error?.message || 'Could not start final test. Please try again.')
    } finally {
      setStarting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <Navbar exam={exam} />
      <div className="page fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 600, color: '#16181d', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="final" size={20} />
              {cfg?.label || `${examConfig.label} Final Test`}
            </h1>
            <div style={{ color: '#565a63', fontSize: 13, marginTop: 4, lineHeight: 1.6 }}>
              This uses the same timed test engine as the {examConfig.label} pre-test and optional practice tests.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {cfg?.cbUrl && (
              <a className="btn btn-outline" href={cfg.cbUrl} target="_blank" rel="noreferrer">Open {cfg.cbLabel || 'test'} on College Board ↗</a>
            )}
            {cfg?.akUrl && (
              <a className="btn btn-outline" href={cfg.akUrl} target="_blank" rel="noreferrer" title="Admin-only hint: students shouldn't use this during the test">
                Open AK →
              </a>
            )}
            {inProgress?.id ? (
              <button className="btn" style={{ background: '#16181d', color: 'white', fontWeight: 600 }} onClick={() => navigate(`/test/${inProgress.id}`)} disabled={loading}>
                Resume →
              </button>
            ) : (
              <button className="btn btn-primary" onClick={startFinal} disabled={starting || loading}>
                {starting ? 'Starting…' : 'Start Final Test →'}
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div style={{ color: '#565a63', fontSize: 13, lineHeight: 1.7 }}>
            {loading ? 'Checking for an in-progress attempt…' : (
              inProgress ? (
                <>You have an in-progress final test attempt. Click <b>Resume</b> to continue.</>
              ) : (
                <>When you click <b>Start Final Test</b>, we create a new attempt and open the timed test interface.</>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
