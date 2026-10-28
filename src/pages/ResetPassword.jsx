import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, getAuthRedirect, clearAuthRedirect } from '../lib/supabase.js'
import PasswordInput from '../components/PasswordInput.jsx'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [status, setStatus] = useState({ loading: true, msg: 'Opening reset link…' })
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setStatus({ loading: false, msg: 'Supabase is not configured.' })
      return
    }
    const INVALID = 'This reset link is invalid or expired. Please request a new one.'
    ;(async () => {
      try {
        // Only a visit that arrived through an email link may set a password. The
        // link's tokens were captured before the Supabase client cleared them from
        // the URL, and are validated HERE with setSession / exchangeCodeForSession.
        // Never fall back to whatever session the browser already holds: the client
        // keeps an existing session when a URL login fails, so a bogus token plus an
        // unlocked browser must not reach the password form.
        const landing = getAuthRedirect()
        if (landing?.path !== '/reset') {
          setStatus({ loading: false, msg: INVALID })
          return
        }
        if (landing.error) {
          setStatus({ loading: false, msg: `${landing.error}. Please request a new reset link.` })
          return
        }
        let session = null
        if (landing.code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(landing.code)
          if (error) throw error
          session = data?.session || null
        } else if (landing.accessToken && landing.refreshToken) {
          const { data, error } = await supabase.auth.setSession({ access_token: landing.accessToken, refresh_token: landing.refreshToken })
          if (error) throw error
          session = data?.session || null
        }
        if (!session) {
          setStatus({ loading: false, msg: INVALID })
          return
        }
        setStatus({ loading: false, msg: '' })
      } catch (e) {
        setStatus({ loading: false, msg: `${e?.message || 'Could not open reset link'}. Please request a new reset link.` })
      }
    })()
  }, [])

  async function updatePassword() {
    if (password.length < 8) return alert('Password must be at least 8 characters.')
    if (password !== confirm) return alert('Passwords do not match.')
    if (!supabase) return
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }
    clearAuthRedirect()
    await supabase.auth.signOut()
    alert('Password updated. Please sign in with your new password.')
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'transparent' }}>
      <div className="card" style={{ maxWidth: 520, width: '100%' }}>
        <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 600, color: '#16181d', marginBottom: 6 }}>
          Reset password
        </div>
        {status.loading ? (
          <div style={{ color: '#565a63' }}>{status.msg}</div>
        ) : status.msg ? (
          <>
            <div style={{ color: '#ef4444', fontWeight: 800 }}>{status.msg}</div>
            <Link to="/login?reset=1" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 14, textDecoration: 'none' }}>
              Send a new reset link
            </Link>
          </>
        ) : (
          <>
            <div style={{ color: '#565a63', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
              Enter a new password (8+ characters).
            </div>
            <div className="input-wrap">
              <label className="input-label">New password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password (min 8)"
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="input-wrap">
              <label className="input-label">Confirm password</label>
              <PasswordInput
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: 13, marginTop: 6 }} disabled={saving} onClick={updatePassword}>
              {saving ? 'Saving…' : 'Update password →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
