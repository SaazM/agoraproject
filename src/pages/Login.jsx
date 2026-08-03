import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import PasswordInput from '../components/PasswordInput.jsx'

export default function Login() {
  const navigate = useNavigate()
  const [, setSearchParams] = useSearchParams()
  const [startInSignup] = useState(() => {
    if (typeof window === 'undefined') return false
    const p = new URLSearchParams(window.location.search)
    return p.get('signup') === '1' || p.get('signup') === 'true'
  })
  const [mode, setMode] = useState(startInSignup ? 'signup' : 'signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [signupRole, setSignupRole] = useState('student')
  const [affiliation, setAffiliation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const { signIn, signUp } = useAuth()

  useEffect(() => {
    if (startInSignup) setSearchParams({}, { replace: true })
  }, [startInSignup, setSearchParams])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address'); setLoading(false); return
    }
    if (mode === 'signup') {
      // Length is only our rule for new accounts — on sign-in, let the server
      // judge, so existing accounts with shorter passwords aren't locked out.
      if (password.length < 8) {
        setError('Password must be at least 8 characters'); setLoading(false); return
      }
      if (!fullName.trim()) { setError('Please enter your full name'); setLoading(false); return }
      if (fullName.trim().length > 100) { setError('Name must be 100 characters or fewer'); setLoading(false); return }
      if (affiliation.trim().length > 100) { setError('Affiliation must be 100 characters or fewer'); setLoading(false); return }
      const { data, error } = await signUp(trimmedEmail, password, fullName, signupRole, affiliation.trim())
      if (error) setError(error.message)
      else {
        if (data?.session) {
          setLoading(false)
          if (signupRole === "tutor") {
            setSuccess("Account created! Redirecting to your welcome tour...")
            navigate("/welcome", { replace: true })
          } else {
            setSuccess("Account created! Let's choose your first test...")
            navigate("/choose-test", { replace: true })
          }
          return
        }
        setSuccess(signupRole === 'tutor' ? "Account created! Sign in to access your tutor dashboard." : "Account created! Sign in to start your SAT prep.")
        setMode('signin')
        setPassword('')
      }
    } else {
      const { error } = await signIn(trimmedEmail, password)
      if (error) {
        const msg = String(error.message || 'Sign in failed')
        setError(msg)
        if (msg.toLowerCase().includes('email not confirmed')) {
          setSuccess('Tip: confirm your email first. You can resend the confirmation email below.')
        }
      }
    }
    setLoading(false)
  }

  return (
    <div className="login-shell">
      {/* Main layout — split screen */}
      <div className="login-wrap">
        {/* Left — Brand panel */}
        <div className="login-brand">
          <div className="login-brand-static">
            <img src="/logo.png" alt="" className="login-logo" />
            <div className="login-brand-text">
              <div className="login-title">The Agora Project</div>
              <div className="login-subtitle">Built for speed, focus, and results</div>
            </div>
          </div>

          <div className="login-points">
            {[
              '100% Free College SAT Prep',
              'AI Tutoring',
              'Real Practice Tests',
              'Adaptive Learning Algorithms',
            ].map((label) => (
              <div key={label} className="login-point">
                <div className="login-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(14,165,233,.7)', flexShrink: 0, marginTop: 4 }} />
                <div className="login-point-text">
                  <div className="login-point-title" style={{ fontSize: 18 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="login-footnote">
            Built around the official SAT structure, from diagnostic to test day.
          </div>
        </div>

        {/* Right — Auth card */}
        <div className="login-auth-col">
          <div className="login-card">
            <div className="login-card-title">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </div>
            <div className="login-card-subtitle">
              {mode === 'signin' ? 'Sign in to continue your prep' : 'Join thousands of students'}
            </div>

            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <>
                  <div className="login-role-toggle">
                    {['student', 'tutor'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`login-role-btn ${signupRole === r ? 'active' : ''}`}
                        onClick={() => setSignupRole(r)}
                      >
                        {r === 'student' ? 'Student' : 'Tutor'}
                      </button>
                    ))}
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">Full Name</label>
                    <input className="input-field" type="text" placeholder="Jane Smith" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  </div>
                </>
              )}
              <div className="input-wrap">
                <label className="input-label">Email</label>
                <input className="input-field" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="input-wrap">
                <label className="input-label">Password</label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                  minLength={mode === 'signup' ? 8 : undefined}
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
              </div>
              {mode === 'signup' && (
                <div className="input-wrap">
                  <label className="input-label">School / Affiliation <span style={{ opacity: .4, fontWeight: 400 }}>(Optional)</span></label>
                  <input className="input-field" type="text" placeholder="Your school or organization" value={affiliation} onChange={e => setAffiliation(e.target.value)} />
                </div>
              )}

              {error && <div className="error-msg" style={{marginBottom:14}}>Error: {error}</div>}
              {success && <div style={{color:'#10b981', fontSize:13, marginBottom:14}}>Success: {success}</div>}

              <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
                {loading ? <span className="spinner" /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="login-switch">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess('') }}
                className="login-switch-btn">
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
