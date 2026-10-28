import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, initialAuthRedirect } from '../lib/supabase.js'
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
        // Only a visit that arrived through an email link may set a password. Never
        // fall back to an existing session, or anyone at an unlocked browser could
        // change the password. initialAuthRedirect was captured before the Supabase
        // client cleared the tokens from the URL.
        const landing = initialAuthRedirect?.path === '/reset' ? initialAuthRedirect : null
        if (landing?.error) {
          setStatus({ loading: false, msg: `${landing.error}. Please request a new reset link.` })
          return
        }
        if (!landing?.hasTokens && !landing?.hasCode) {
          setStatus({ loading: false, msg: INVALID })
          return
        }

        // getSession waits for the client to finish reading the link.
        let { data } = await supabase.auth.getSession()
        if (!data?.session) {
          // The client may not have handled the link (e.g. it mounted first); do it here.
          const url = window.location.href
          const params = new URLSearchParams(String(window.location.hash || '').replace(/^#/, ''))
          const access_token = params.get('access_token')
          const refresh_token = params.get('refresh_token')
          if (new URL(url).searchParams.get('code')) {
            await supabase.auth.exchangeCodeForSession(url)
          } else if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token })
          }
          ;({ data } = await supabase.auth.getSession())
        }
        if (!data?.session) {
          setStatus({ loading: false, msg: INVALID })
          return
        }
        setStatus({ loading: false, msg: '' })
      } catch (e) {
        setStatus({ loading: false, msg: e?.message || 'Could not open reset link.' })
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
