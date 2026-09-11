import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

function SupabaseNotConfigured() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: 24 }}>
      <div style={{ maxWidth: 720, width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24, boxShadow: '0 2px 16px rgba(15,31,61,.09)' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f1f3d', marginBottom: 8 }}>Missing Supabase environment variables</div>
        <div style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
          Add these environment variables in Vercel (Project → Settings → Environment Variables), then redeploy:
        </div>
        <pre style={{ background: '#0b1220', color: '#e2e8f0', padding: 14, borderRadius: 10, overflowX: 'auto', fontSize: 12, lineHeight: 1.5 }}>
{`VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...`}
        </pre>
        <div style={{ color: '#64748b', fontSize: 12, marginTop: 12 }}>
          Local dev: create a <code>.env</code> file with the same keys, then restart <code>npm run dev</code>.
        </div>
      </div>
    </div>
  )
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  /** When a user is signed in, true only after the first profiles fetch finishes (even if no row exists). */
  const [profileReady, setProfileReady] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setUser(null)
      setProfile(null)
      setProfileReady(false)
      setLoading(false)
      return
    }
    let cancelled = false
    let latestProfileRequest = 0
    const safetyTimer = setTimeout(() => {
      if (cancelled) return
      // Prevent a blank screen if session/profile calls hang.
      setLoading(false)
    }, 10000)

    async function loadProfile(userId) {
      if (!supabase || !userId) return
      const requestId = ++latestProfileRequest
      setProfileReady(false)
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
        if (error) console.warn('[Agora] Profile load error:', error.message || error)
        if (cancelled || requestId !== latestProfileRequest) return
        if (data) {
          console.log('[Agora] Profile loaded:', { role: data.role, email: data.email, affiliation: data.affiliation })
        } else {
          console.warn('[Agora] No profile row found for user', userId)
        }
        setProfile(data || null)
      } catch (e) {
        console.warn('[Agora] Profile load exception:', e)
        if (cancelled || requestId !== latestProfileRequest) return
        setProfile(null)
      } finally {
        if (!cancelled && requestId === latestProfileRequest) setProfileReady(true)
      }
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return
        const nextUser = session?.user ?? null
        setUser(nextUser)
        setLoading(false)
        if (nextUser) {
          setProfile(null)
          setProfileReady(false)
          loadProfile(nextUser.id)
        }
        else {
          setProfile(null)
          setProfileReady(false)
        }
      })
      .catch(() => {
        if (cancelled) return
        setUser(null)
        setProfile(null)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      setLoading(false)
      if (nextUser) {
        setProfile(null)
        setProfileReady(false)
        loadProfile(nextUser.id)
      }
      else {
        setProfile(null)
        setProfileReady(false)
      }
    })
    return () => {
      cancelled = true
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [])

  // Every signup is a student. Tutor/admin access is granted by an admin from
  // the Admin Panel (and the DB trigger ignores any role in signup metadata).
  async function signUp(email, password, fullName, affiliation = '') {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') }
    const cleanEmail = String(email || '').trim().toLowerCase().slice(0, 254)
    const cleanName = String(fullName || '').replace(/[<>]/g, '').trim().slice(0, 100)
    const cleanAffiliation = String(affiliation || '').replace(/[<>]/g, '').trim().slice(0, 100)
    if (!cleanEmail || !cleanName) return { data: null, error: new Error('Email and name are required') }
    if (String(password || '').length < 8) return { data: null, error: new Error('Password must be at least 8 characters') }
    const meta = { full_name: cleanName, role: 'student' }
    if (cleanAffiliation) meta.affiliation = cleanAffiliation
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail, password,
      options: {
        data: meta,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    return { data, error }
  }

  async function signIn(email, password) {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') }
    const cleanEmail = String(email || '').trim().toLowerCase().slice(0, 254)
    if (!cleanEmail) return { data: null, error: new Error('Email is required') }
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
    return { data, error }
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  async function requestPasswordReset(email) {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`,
    })
    return { data, error }
  }

  async function resendConfirmation(email) {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') }
    // Supabase expects "signup" for confirmation emails.
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    return { data, error }
  }

  async function setPreferredExam(exam) {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') }
    const { data, error } = await supabase.auth.updateUser({
      data: { preferred_exam: exam === 'act' ? 'act' : 'sat' },
    })
    if (!error && data?.user) setUser(data.user)
    return { data, error }
  }

  if (!supabase && !loading) return <SupabaseNotConfigured />

  return (
    <AuthContext.Provider value={{ user, profile, profileReady, loading, signUp, signIn, signOut, requestPasswordReset, resendConfirmation, setPreferredExam }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
