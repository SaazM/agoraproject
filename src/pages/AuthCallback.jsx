import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [msg, setMsg] = useState('Confirming your email…')

  useEffect(() => {
    if (!supabase) {
      setMsg('Supabase is not configured.')
      return
    }
    ;(async () => {
      try {
        const url = window.location.href
        const hasCode = new URL(url).searchParams.get('code')
        const hash = window.location.hash || ''
        const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')

        if (hasCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(url)
          if (error) throw error
          setMsg('Email confirmed. Redirecting…')
          navigate('/dashboard', { replace: true })
          return
        }

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) throw error
          setMsg('Email confirmed. Redirecting…')
          navigate('/dashboard', { replace: true })
          return
        }

        // Fallback: session may already be set by the time we land here.
        const { data } = await supabase.auth.getSession()
        if (data?.session) {
          navigate('/dashboard', { replace: true })
          return
        }

        setMsg('This link is missing verification data. Please request a new confirmation email.')
      } catch (e) {
        setMsg(e?.message || 'Could not confirm email. Please request a new link.')
      }
    })()
  }, [navigate])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'transparent' }}>
      <div className="card" style={{ maxWidth: 720, width: '100%' }}>
        <div style={{ fontFamily: 'Fraunces,Georgia,serif', fontSize: 18, fontWeight: 600, color: '#16181d', marginBottom: 8 }}>
          Email Confirmation
        </div>
        <div style={{ color: '#565a63', fontSize: 14, lineHeight: 1.7 }}>
          {msg}
        </div>
      </div>
    </div>
  )
}

